// Brain → spine nervous-system scene for the Orion page. Loads a compact
// binary mesh, generates connection curves on the fly, and pilots the camera
// through 9 keyframes driven by scroll position.
//
// Exposed as initOrionScene(canvas, opts) => dispose(): the React hook owns the
// <canvas> and the page's sections; this builds the scene, wires listeners, and
// returns a teardown that cancels the loop, removes listeners, and frees GPU
// resources.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Identity tagged template — keeps the GLSL readable; no build step needs it.
const glsl = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ""), "");

const PULSE_COUNT = 200;
const MODEL_START_X = 1.5; // initial rightward offset for hero layout

// Plasma neon palette — shared with the home hero background
const PALETTE = [
    0xff2d95, // hot pink
    0xff4570, // red-pink
    0x9b5cff, // purple
    0x5a3bff, // violet-blue
    0xff7a4d, // orange
];

/* ── Seeded PRNG (mulberry32) ───────────────────────────────────────── */

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ── Natural cubic spline (matches scipy CubicSpline natural BC) ───── */

function cubicSplineInterpolate(points, nSamples) {
    const n = points.length;
    if (n < 2) return points.map((p) => [p[0], p[1], p[2]]);

    const t = new Float64Array(n);
    for (let i = 1; i < n; i++) {
        const dx = points[i][0] - points[i - 1][0];
        const dy = points[i][1] - points[i - 1][1];
        const dz = points[i][2] - points[i - 1][2];
        t[i] = t[i - 1] + Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    if (t[n - 1] === 0) return points.map((p) => [p[0], p[1], p[2]]);
    for (let i = 1; i < n; i++) t[i] /= t[n - 1];
    for (let i = 1; i < n; i++) {
        if (t[i] <= t[i - 1]) t[i] = t[i - 1] + 1e-10;
    }

    const h = new Float64Array(n - 1);
    for (let i = 0; i < n - 1; i++) h[i] = t[i + 1] - t[i];

    function solveAxis(vals) {
        const m = n - 2;
        if (m <= 0) return new Float64Array(n);
        const a = new Float64Array(m),
            b = new Float64Array(m);
        const c = new Float64Array(m),
            d = new Float64Array(m);
        for (let i = 0; i < m; i++) {
            const ii = i + 1;
            a[i] = h[ii - 1];
            b[i] = 2 * (h[ii - 1] + h[ii]);
            c[i] = h[ii];
            d[i] =
                6 *
                ((vals[ii + 1] - vals[ii]) / h[ii] -
                    (vals[ii] - vals[ii - 1]) / h[ii - 1]);
        }
        for (let i = 1; i < m; i++) {
            const w = a[i] / b[i - 1];
            b[i] -= w * c[i - 1];
            d[i] -= w * d[i - 1];
        }
        const M = new Float64Array(n);
        M[m] = d[m - 1] / b[m - 1];
        for (let i = m - 2; i >= 0; i--)
            M[i + 1] = (d[i] - c[i] * M[i + 2]) / b[i];
        return M;
    }

    const vx = points.map((p) => p[0]),
        vy = points.map((p) => p[1]),
        vz = points.map((p) => p[2]);
    const Mx = solveAxis(vx),
        My = solveAxis(vy),
        Mz = solveAxis(vz);

    const result = [];
    for (let s = 0; s < nSamples; s++) {
        const tEval = s / (nSamples - 1);
        let seg = 0;
        for (let i = 0; i < n - 2; i++) {
            if (tEval >= t[i + 1]) seg = i + 1;
            else break;
        }
        if (seg > n - 2) seg = n - 2;
        const dt = tEval - t[seg],
            hi = h[seg];
        function evalSeg(vals, M, i) {
            const a = vals[i];
            const b =
                (vals[i + 1] - vals[i]) / hi -
                (hi * (2 * M[i] + M[i + 1])) / 6;
            const c = M[i] / 2,
                d = (M[i + 1] - M[i]) / (6 * hi);
            return a + b * dt + c * dt * dt + d * dt * dt * dt;
        }
        result.push([
            evalSeg(vx, Mx, seg),
            evalSeg(vy, My, seg),
            evalSeg(vz, Mz, seg),
        ]);
    }
    return result;
}

/* ── Farthest-point sampling ───────────────────────────────────────── */

function farthestPointSample(verts, nSamples, rng) {
    const n = verts.length / 3;
    if (n <= nSamples) {
        const all = [];
        for (let i = 0; i < n; i++) all.push(i);
        return all;
    }
    const indices = [Math.floor(rng() * n)];
    const dists = new Float32Array(n).fill(Infinity);
    for (let iter = 1; iter < nSamples; iter++) {
        const last = indices[indices.length - 1];
        const lx = verts[last * 3],
            ly = verts[last * 3 + 1],
            lz = verts[last * 3 + 2];
        let maxDist = -1,
            maxIdx = 0;
        for (let j = 0; j < n; j++) {
            const dx = verts[j * 3] - lx,
                dy = verts[j * 3 + 1] - ly,
                dz = verts[j * 3 + 2] - lz;
            const d = dx * dx + dy * dy + dz * dz;
            if (d < dists[j]) dists[j] = d;
            if (dists[j] > maxDist) {
                maxDist = dists[j];
                maxIdx = j;
            }
        }
        indices.push(maxIdx);
    }
    return indices;
}

/* ── Weighted random choice (without replacement) ──────────────────── */

function weightedChoice(weights, n, rng) {
    const result = [];
    const w = new Float64Array(weights);
    for (let k = 0; k < n; k++) {
        let sum = 0;
        for (let j = 0; j < w.length; j++) sum += w[j];
        if (sum === 0) break;
        const invSum = 1 / sum,
            r = rng();
        let cumSum = 0,
            chosen = w.length - 1;
        for (let j = 0; j < w.length; j++) {
            cumSum += w[j] * invSum;
            if (r <= cumSum) {
                chosen = j;
                break;
            }
        }
        result.push(chosen);
        w[chosen] = 0;
    }
    return result;
}

/* ── Load compact binary + generate curves on frontend ─────────────── */

async function loadNervousSystem(binUrl) {
    const resp = await fetch(binUrl);
    const buf = await resp.arrayBuffer();
    const view = new DataView(buf);

    // Header (30 bytes)
    const minX = view.getFloat32(0, true);
    const minY = view.getFloat32(4, true);
    const minZ = view.getFloat32(8, true);
    const rangeX = view.getFloat32(12, true);
    const rangeY = view.getFloat32(16, true);
    const rangeZ = view.getFloat32(20, true);
    const numBrainFaces = view.getUint16(24, true);
    const numBrainVerts = view.getUint16(26, true);
    const numSpineSegs = view.getUint8(28);
    let off = 30;

    const dq = (raw, s) => [
        minX + (raw[s] / 255) * rangeX,
        minY + (raw[s + 1] / 255) * rangeY,
        minZ + (raw[s + 2] / 255) * rangeZ,
    ];

    // Spine segment centers (pre-computed)
    const spineCenters = [];
    const scRaw = new Uint8Array(buf, off, numSpineSegs * 3);
    for (let i = 0; i < numSpineSegs; i++) {
        const [x, y, z] = dq(scRaw, i * 3);
        spineCenters.push([x, y, z]);
    }
    off += numSpineSegs * 3;

    // Spine pre-sampled endpoint counts + vertices
    const spineSampleCounts = [];
    for (let i = 0; i < numSpineSegs; i++) {
        spineSampleCounts.push(view.getUint8(off));
        off += 1;
    }

    const spineSampledAll = [];
    for (let si = 0; si < numSpineSegs; si++) {
        const count = spineSampleCounts[si];
        const raw = new Uint8Array(buf, off, count * 3);
        for (let j = 0; j < count; j++) {
            const [x, y, z] = dq(raw, j * 3);
            spineSampledAll.push({ pt: [x, y, z], segIdx: si });
        }
        off += count * 3;
    }

    // Brain faces (delta-encoded) → extract edges
    const faceDataLen = view.getUint16(off, true);
    off += 2;
    const faceRaw = new Uint8Array(buf, off, faceDataLen);
    let fi = 0;
    const prev = [0, 0, 0];
    const edgeSet = new Set();
    for (let f = 0; f < numBrainFaces; f++) {
        const idx = [0, 0, 0];
        for (let k = 0; k < 3; k++) {
            let delta;
            if (faceRaw[fi] & 0x80) {
                delta =
                    ((faceRaw[fi] & 0x7f) | (faceRaw[fi + 1] << 7)) - 8192;
                fi += 2;
            } else {
                delta = faceRaw[fi] - 64;
                fi += 1;
            }
            idx[k] = prev[k] + delta;
            prev[k] = idx[k];
        }
        for (let k = 0; k < 3; k++) {
            const a = idx[k],
                b = idx[(k + 1) % 3];
            edgeSet.add(Math.min(a, b) | (Math.max(a, b) << 16));
        }
    }
    off += faceDataLen;

    const brainEdges = [];
    for (const packed of edgeSet) {
        brainEdges.push(packed & 0xffff, packed >>> 16);
    }
    const numBrainEdges = edgeSet.size;

    // Brain vertices
    const brainVerts = new Float32Array(numBrainVerts * 3);
    const brainRaw = new Uint8Array(buf, off, numBrainVerts * 3);
    for (let i = 0; i < numBrainVerts; i++) {
        const [x, y, z] = dq(brainRaw, i * 3);
        brainVerts[i * 3] = x;
        brainVerts[i * 3 + 1] = y;
        brainVerts[i * 3 + 2] = z;
    }

    // ── Frontend curve generation ─────────────────────────────────

    let bcx = 0,
        bcy = 0,
        bcz = 0;
    for (let i = 0; i < numBrainVerts; i++) {
        bcx += brainVerts[i * 3];
        bcy += brainVerts[i * 3 + 1];
        bcz += brainVerts[i * 3 + 2];
    }
    bcx /= numBrainVerts;
    bcy /= numBrainVerts;
    bcz /= numBrainVerts;
    const brainCenter = [bcx, bcy, bcz];

    // Farthest-point sample brain → 500 surface points
    const sampleRng = mulberry32(42);
    const brainSampleIdx = farthestPointSample(brainVerts, 500, sampleRng);
    const brainSampled = brainSampleIdx.map((i) => [
        brainVerts[i * 3],
        brainVerts[i * 3 + 1],
        brainVerts[i * 3 + 2],
    ]);

    const connRng = mulberry32(7777);
    const jitterRng = mulberry32(42);
    const lines = [];

    for (let i = 0; i < brainSampled.length; i++) {
        const bp = brainSampled[i];
        const weights = new Float64Array(spineSampledAll.length);
        for (let j = 0; j < spineSampledAll.length; j++) {
            const sp = spineSampledAll[j].pt;
            const dx = sp[0] - bp[0],
                dz = sp[2] - bp[2];
            weights[j] = 1.0 / (Math.sqrt(dx * dx + dz * dz) + 0.1);
        }
        const nConn = connRng() < 0.7 ? 1 : 2;
        const chosen = weightedChoice(weights, nConn, connRng);

        for (const j of chosen) {
            const sp = spineSampledAll[j].pt;
            const segIdx = spineSampledAll[j].segIdx;

            const bcJ = [
                brainCenter[0] + (jitterRng() * 2 - 1) * 0.08,
                brainCenter[1] + (jitterRng() * 2 - 1) * 0.08,
                brainCenter[2] + (jitterRng() * 2 - 1) * 0.08,
            ];

            const waypoints = [bp, bcJ];
            for (let s = 0; s <= segIdx; s++) {
                const sc = spineCenters[s];
                waypoints.push([
                    sc[0] + (jitterRng() * 2 - 1) * 0.02,
                    sc[1] + (jitterRng() * 2 - 1) * 0.02,
                    sc[2] + (jitterRng() * 2 - 1) * 0.02,
                ]);
            }
            waypoints.push(sp);

            const nPts = Math.min(30, 12 + Math.floor((segIdx + 1) * 1.2));
            const pts = cubicSplineInterpolate(waypoints, nPts);

            let startIdx = 0;
            if (jitterRng() < 0.5) {
                startIdx = 1 + Math.floor(jitterRng() * 4);
                if (startIdx >= pts.length) startIdx = 0;
            }

            const line = [];
            for (let k = startIdx; k < pts.length; k++) {
                line.push(pts[k][0], pts[k][1], pts[k][2]);
            }
            lines.push(line);
        }
    }

    return {
        lines,
        numLines: lines.length,
        brainVerts,
        brainEdges,
        numBrainEdges,
    };
}

/* ── Resolution-adaptive helpers ───────────────────────────────────── */

const REF_PIXELS = 2560 * 1440;

function getResScale() {
    const pr = Math.min(devicePixelRatio, 2);
    const totalPx = innerWidth * pr * innerHeight * pr;
    return Math.sqrt(totalPx / REF_PIXELS);
}

// Clamp to 1 on hi-res so points never grow beyond the original size
function pointScale(rs) {
    return 35.0 * Math.min(rs, 1.0);
}
// Lines look thicker on low-res; dim them to compensate
function lineOpacity(rs) {
    return 0.2 * Math.min(rs, 1.0);
}

function adaptedBloom(resScale) {
    return {
        strength: THREE.MathUtils.clamp(0.6 * resScale, 0.25, 0.8),
        radius: THREE.MathUtils.clamp(0.85 / resScale, 0.6, 1.0),
    };
}

/* ── Scene initializer ─────────────────────────────────────────────── */

export async function initOrionScene(canvas, options = {}) {
    const { binUrl = "/nervous-system.bin", root = document } = options;
    const heroText = options.heroText ?? document.getElementById("heroText");

    // Listener bookkeeping — every registration is paired with a remover so
    // dispose() can unwind them all.
    const offs = [];
    const on = (target, ev, fn, opt) => {
        target.addEventListener(ev, fn, opt);
        offs.push(() => target.removeEventListener(ev, fn, opt));
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111a);

    const camera = new THREE.PerspectiveCamera(
        45,
        innerWidth / innerHeight,
        0.1,
        100,
    );
    // Initial position is set by updateCamera on first frame

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    /* ── Post-processing (Bloom + MSAA) ────────────────────────────── */

    // Size must include devicePixelRatio; otherwise the target is half-
    // resolution on retina and the brain mesh looks pixelated.
    const _pr = Math.min(devicePixelRatio, 2);
    const renderTarget = new THREE.WebGLRenderTarget(
        innerWidth * _pr,
        innerHeight * _pr,
        {
            samples: 4,
            type: THREE.HalfFloatType,
        },
    );
    const composer = new EffectComposer(renderer, renderTarget);
    composer.setPixelRatio(_pr);
    composer.setSize(innerWidth, innerHeight);
    composer.addPass(new RenderPass(scene, camera));

    const initScale = getResScale();
    const initBloom = adaptedBloom(initScale);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        initBloom.strength,
        initBloom.radius,
        0.75, // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    /* ── Build geometry from data ──────────────────────────────────── */

    const data = await loadNervousSystem(binUrl);
    const { lines, numLines, brainVerts, brainEdges, numBrainEdges } = data;

    // Center the model
    let bMinX = Infinity,
        bMinY = Infinity,
        bMinZ = Infinity;
    let bMaxX = -Infinity,
        bMaxY = -Infinity,
        bMaxZ = -Infinity;
    for (let i = 0; i < brainVerts.length; i += 3) {
        bMinX = Math.min(bMinX, brainVerts[i]);
        bMaxX = Math.max(bMaxX, brainVerts[i]);
        bMinY = Math.min(bMinY, brainVerts[i + 1]);
        bMaxY = Math.max(bMaxY, brainVerts[i + 1]);
        bMinZ = Math.min(bMinZ, brainVerts[i + 2]);
        bMaxZ = Math.max(bMaxZ, brainVerts[i + 2]);
    }
    for (const line of lines) {
        for (let i = 0; i < line.length; i += 3) {
            bMinX = Math.min(bMinX, line[i]);
            bMaxX = Math.max(bMaxX, line[i]);
            bMinY = Math.min(bMinY, line[i + 1]);
            bMaxY = Math.max(bMaxY, line[i + 1]);
            bMinZ = Math.min(bMinZ, line[i + 2]);
            bMaxZ = Math.max(bMaxZ, line[i + 2]);
        }
    }
    const cx = (bMinX + bMaxX) / 2;
    const cy = (bMinY + bMaxY) / 2;
    const cz = (bMinZ + bMaxZ) / 2;

    const MODEL_SCALE = 2.0;
    for (const line of lines) {
        for (let i = 0; i < line.length; i += 3) {
            line[i] = (line[i] - cx) * MODEL_SCALE;
            line[i + 1] = (line[i + 1] - cy) * MODEL_SCALE;
            line[i + 2] = (line[i + 2] - cz) * MODEL_SCALE;
        }
    }
    for (let i = 0; i < brainVerts.length; i += 3) {
        brainVerts[i] = (brainVerts[i] - cx) * MODEL_SCALE;
        brainVerts[i + 1] = (brainVerts[i + 1] - cy) * MODEL_SCALE;
        brainVerts[i + 2] = (brainVerts[i + 2] - cz) * MODEL_SCALE;
    }

    // Brain top = max Y of brain verts, spine bottom = min Y of all geometry
    let brainTopY = -Infinity,
        spineBottomY = Infinity;
    for (let i = 0; i < brainVerts.length; i += 3) {
        brainTopY = Math.max(brainTopY, brainVerts[i + 1]);
    }
    for (const line of lines) {
        for (let i = 0; i < line.length; i += 3) {
            spineBottomY = Math.min(spineBottomY, line[i + 1]);
        }
    }
    // Brain center is roughly the upper 25% of the model
    const brainCenterY = brainTopY * 0.75;

    /* ── Per-line palette colours ──────────────────────────────────── */

    // One random plasma colour per nerve line, re-used by endpoints and
    // pulses so every strand reads as one continuous hue.
    const lineColors = new Float32Array(numLines * 3);
    {
        const tmp = new THREE.Color();
        for (let i = 0; i < numLines; i++) {
            tmp.setHex(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
            lineColors[i * 3] = tmp.r;
            lineColors[i * 3 + 1] = tmp.g;
            lineColors[i * 3 + 2] = tmp.b;
        }
    }

    /* ── Model group (for scroll-driven offset) ────────────────────── */

    const MODEL_START_ROT = -Math.PI / 2; // face left in hero
    const modelGroup = new THREE.Group();
    modelGroup.position.x = MODEL_START_X;
    modelGroup.rotation.y = MODEL_START_ROT;
    scene.add(modelGroup);

    /* ── Brain wireframe ───────────────────────────────────────────── */

    const brainWirePositions = new Float32Array(numBrainEdges * 2 * 3);
    for (let i = 0; i < numBrainEdges; i++) {
        const a = brainEdges[i * 2];
        const b = brainEdges[i * 2 + 1];
        brainWirePositions[i * 6] = brainVerts[a * 3];
        brainWirePositions[i * 6 + 1] = brainVerts[a * 3 + 1];
        brainWirePositions[i * 6 + 2] = brainVerts[a * 3 + 2];
        brainWirePositions[i * 6 + 3] = brainVerts[b * 3];
        brainWirePositions[i * 6 + 4] = brainVerts[b * 3 + 1];
        brainWirePositions[i * 6 + 5] = brainVerts[b * 3 + 2];
    }

    const brainWireGeo = new THREE.BufferGeometry();
    brainWireGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(brainWirePositions, 3),
    );

    const brainWireMat = new THREE.LineBasicMaterial({
        color: 0x119fcd,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    modelGroup.add(new THREE.LineSegments(brainWireGeo, brainWireMat));

    /* ── Lines geometry with per-vertex fade ───────────────────────── */

    let totalSegs = 0;
    for (const line of lines) totalSegs += line.length / 3 - 1;
    const linePositions = new Float32Array(totalSegs * 2 * 3);
    const lineAlphas = new Float32Array(totalSegs * 2);
    const lineColorAttr = new Float32Array(totalSegs * 2 * 3);

    let li = 0,
        ai = 0,
        ci = 0,
        lineIdx = 0;
    for (const line of lines) {
        const ptCount = line.length / 3;
        const cr = lineColors[lineIdx * 3];
        const cg = lineColors[lineIdx * 3 + 1];
        const cb = lineColors[lineIdx * 3 + 2];
        for (let j = 0; j < ptCount - 1; j++) {
            const s = j * 3;
            linePositions[li++] = line[s];
            linePositions[li++] = line[s + 1];
            linePositions[li++] = line[s + 2];
            linePositions[li++] = line[s + 3];
            linePositions[li++] = line[s + 4];
            linePositions[li++] = line[s + 5];

            const t1 = j / (ptCount - 1);
            const t2 = (j + 1) / (ptCount - 1);
            const fade = (t) => {
                const edgeBright = Math.max(0, 1.0 - t * 4.0);
                const endBright = Math.max(0, (t - 0.7) * 3.3);
                const mid = 0.08;
                return Math.min(1.0, edgeBright + endBright + mid);
            };
            lineAlphas[ai++] = fade(t1);
            lineAlphas[ai++] = fade(t2);

            lineColorAttr[ci++] = cr;
            lineColorAttr[ci++] = cg;
            lineColorAttr[ci++] = cb;
            lineColorAttr[ci++] = cr;
            lineColorAttr[ci++] = cg;
            lineColorAttr[ci++] = cb;
        }
        lineIdx++;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(linePositions, 3),
    );
    lineGeo.setAttribute("alpha", new THREE.BufferAttribute(lineAlphas, 1));
    lineGeo.setAttribute("aColor", new THREE.BufferAttribute(lineColorAttr, 3));

    const lineMat = new THREE.ShaderMaterial({
        uniforms: {
            uOpacity: { value: lineOpacity(initScale) },
        },
        vertexShader: glsl`
            attribute float alpha;
            attribute vec3 aColor;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              vAlpha = alpha;
              vColor = aColor;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: glsl`
            uniform float uOpacity;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              gl_FragColor = vec4(vColor, vAlpha * uOpacity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    modelGroup.add(new THREE.LineSegments(lineGeo, lineMat));

    /* ── Endpoint nodes (emissive pulsing) ─────────────────────────── */

    const endpointCount = numLines * 2;
    const epPositions = new Float32Array(endpointCount * 3);
    const epPhases = new Float32Array(endpointCount);
    const epSpeeds = new Float32Array(endpointCount);
    const epColors = new Float32Array(endpointCount * 3);

    for (let i = 0; i < numLines; i++) {
        const line = lines[i];
        const last = line.length - 3;

        epPositions[i * 6] = line[0];
        epPositions[i * 6 + 1] = line[1];
        epPositions[i * 6 + 2] = line[2];
        epPositions[i * 6 + 3] = line[last];
        epPositions[i * 6 + 4] = line[last + 1];
        epPositions[i * 6 + 5] = line[last + 2];

        epPhases[i * 2] = Math.random() * Math.PI * 2;
        epPhases[i * 2 + 1] = Math.random() * Math.PI * 2;
        epSpeeds[i * 2] = 1.0 + Math.random() * 2.0;
        epSpeeds[i * 2 + 1] = 1.0 + Math.random() * 2.0;

        const cr = lineColors[i * 3];
        const cg = lineColors[i * 3 + 1];
        const cb = lineColors[i * 3 + 2];
        epColors[i * 6] = cr;
        epColors[i * 6 + 1] = cg;
        epColors[i * 6 + 2] = cb;
        epColors[i * 6 + 3] = cr;
        epColors[i * 6 + 4] = cg;
        epColors[i * 6 + 5] = cb;
    }

    const epGeo = new THREE.BufferGeometry();
    epGeo.setAttribute("position", new THREE.BufferAttribute(epPositions, 3));
    epGeo.setAttribute("phase", new THREE.BufferAttribute(epPhases, 1));
    epGeo.setAttribute("speed", new THREE.BufferAttribute(epSpeeds, 1));
    epGeo.setAttribute("aColor", new THREE.BufferAttribute(epColors, 3));

    const epMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPointScale: { value: pointScale(initScale) },
        },
        vertexShader: glsl`
            attribute float phase;
            attribute float speed;
            attribute vec3 aColor;
            varying float vBrightness;
            varying vec3 vColor;

            uniform float uTime;
            uniform float uPointScale;

            void main() {
              vBrightness = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * speed + phase));
              vColor = aColor;

              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = (1.6 + vBrightness * 1.6) * (uPointScale / -mvPos.z);
              gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: glsl`
            varying float vBrightness;
            varying vec3 vColor;

            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;

              float core = exp(-d * d * 80.0);
              float halo = exp(-d * 12.0) * 0.3;

              float intensity = core + halo;
              vec3 col = mix(vColor, vec3(1.0), core * vBrightness);

              gl_FragColor = vec4(col * intensity * vBrightness, intensity * vBrightness);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    modelGroup.add(new THREE.Points(epGeo, epMat));

    /* ── Traveling pulses ──────────────────────────────────────────── */

    const pulseLineIndices = [];
    const pulseProgress = new Float32Array(PULSE_COUNT);
    const pulseSpeed = new Float32Array(PULSE_COUNT);
    const pulsePositions = new Float32Array(PULSE_COUNT * 3);
    const pulseDirection = new Int8Array(PULSE_COUNT);
    const pulseColorAttr = new Float32Array(PULSE_COUNT * 3);

    function assignPulse(i) {
        const lineIdx = Math.floor(Math.random() * numLines);
        pulseLineIndices[i] = lineIdx;
        pulseProgress[i] = Math.random();
        pulseSpeed[i] = 0.15 + Math.random() * 0.35;
        pulseDirection[i] = Math.random() < 0.5 ? 1 : -1;
        pulseColorAttr[i * 3] = lineColors[lineIdx * 3];
        pulseColorAttr[i * 3 + 1] = lineColors[lineIdx * 3 + 1];
        pulseColorAttr[i * 3 + 2] = lineColors[lineIdx * 3 + 2];
    }

    for (let i = 0; i < PULSE_COUNT; i++) {
        assignPulse(i);
    }

    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(pulsePositions, 3),
    );
    pulseGeo.setAttribute("aColor", new THREE.BufferAttribute(pulseColorAttr, 3));

    const pulseMat = new THREE.ShaderMaterial({
        uniforms: {
            uPointScale: { value: pointScale(initScale) },
        },
        vertexShader: glsl`
            uniform float uPointScale;
            attribute vec3 aColor;
            varying vec3 vColor;
            void main() {
              vColor = aColor;
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = 4.5 * (uPointScale / -mvPos.z);
              gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: glsl`
            varying vec3 vColor;

            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;

              float core = exp(-d * d * 100.0);
              float halo = exp(-d * 15.0) * 0.2;
              float intensity = core + halo;

              vec3 col = mix(vColor, vec3(1.0), core);
              gl_FragColor = vec4(col * intensity, intensity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    modelGroup.add(new THREE.Points(pulseGeo, pulseMat));

    function updatePulses(dt) {
        const posAttr = pulseGeo.getAttribute("position");
        const colAttr = pulseGeo.getAttribute("aColor");
        let anyReassigned = false;

        for (let i = 0; i < PULSE_COUNT; i++) {
            pulseProgress[i] += pulseSpeed[i] * dt * pulseDirection[i];

            if (pulseProgress[i] > 1.0 || pulseProgress[i] < 0.0) {
                assignPulse(i);
                anyReassigned = true;
            }

            const line = lines[pulseLineIndices[i]];
            const t = Math.max(0, Math.min(1, pulseProgress[i]));
            const linePtCount = line.length / 3;
            const segs = linePtCount - 1;
            const seg = Math.min(Math.floor(t * segs), segs - 1);
            const frac = t * segs - seg;

            const s = seg * 3;
            posAttr.array[i * 3] = line[s] + (line[s + 3] - line[s]) * frac;
            posAttr.array[i * 3 + 1] =
                line[s + 1] + (line[s + 4] - line[s + 1]) * frac;
            posAttr.array[i * 3 + 2] =
                line[s + 2] + (line[s + 5] - line[s + 2]) * frac;
        }

        posAttr.needsUpdate = true;
        if (anyReassigned) colAttr.needsUpdate = true;
    }

    /* ── Scroll-driven camera (brain → spine journey) ──────────────── */

    // One keyframe per snap-section (9 sections, 8 segments)
    // Hero | Two Clocks | Orion | Decouple Diagram | AI & Trust | Guardrails Diagram | The Future | CTA | Footer
    const maxLookY = spineBottomY * 0.45; // limit: don't let spine go above mid-screen
    const camKeyframes = [
        { posX: 1.5, lookY: brainCenterY, camZ: 5, camYOff: 0.5, rotOff: 0 }, // 0 Hero
        { posX: 1.5, lookY: brainCenterY, camZ: 6, camYOff: 0.4, rotOff: 0 }, // 1 Two Clocks
        { posX: -1.5, lookY: brainCenterY * 0.3, camZ: 8, camYOff: 0.3, rotOff: 0 }, // 2 Orion
        { posX: 0, lookY: 0, camZ: 9, camYOff: 0.2, rotOff: 0 }, // 3 Decouple Diagram
        { posX: 0, lookY: spineBottomY * 0.25, camZ: 10, camYOff: 0.1, rotOff: 0 }, // 4 AI & Trust
        { posX: 0, lookY: maxLookY, camZ: 10, camYOff: 0.0, rotOff: 0 }, // 5 Guardrails Diagram
        { posX: 0, lookY: maxLookY, camZ: 10, camYOff: 0.0, rotOff: 0 }, // 6 The Future
        {
            posX: 2.4,
            lookY: brainCenterY * 0.4,
            camZ: 10,
            camYOff: 0.3,
            rotOff: -Math.PI / 2,
        }, // 7 CTA
        {
            posX: 2.4,
            lookY: brainCenterY * 0.4,
            camZ: 10,
            camYOff: 0.3,
            rotOff: -Math.PI / 2,
        }, // 8 Footer
    ];

    // Map scroll position to keyframe progress via the actual snap sections.
    // scrollY/scrollHeight is fragile on mobile because section heights grow
    // when the layout collapses to one column — anchoring on element rects
    // keeps the camera index aligned with the section the user is reading.
    let _sections = [];
    const refreshSections = () => {
        _sections = [
            ...root.querySelectorAll(
                ".hero, .section-full, .section-orion, .section-cta, footer.footer",
            ),
        ];
    };
    refreshSections();
    on(window, "load", refreshSections);
    if (window.visualViewport) on(visualViewport, "resize", refreshSections);

    function getScrollProgress() {
        if (_sections.length < 2) {
            refreshSections();
            if (_sections.length < 2) {
                const max = document.body.scrollHeight - innerHeight;
                return max > 0 ? scrollY / max : 0;
            }
        }
        const mid = innerHeight * 0.5;
        let active = 0;
        for (let i = 0; i < _sections.length; i++) {
            if (_sections[i].getBoundingClientRect().top <= mid) active = i;
        }
        const r = _sections[active].getBoundingClientRect();
        const within = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
        const n = _sections.length - 1;
        return Math.min(1, Math.max(0, (active + within) / n));
    }
    let targetScrollProgress = getScrollProgress();
    let scrollProgress = targetScrollProgress; // no lerp on first frame
    on(window, "scroll", () => {
        targetScrollProgress = getScrollProgress();
    });

    const lookTarget = new THREE.Vector3(0, 0, 0);
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

    function lerpKeyframes(p) {
        const n = camKeyframes.length - 1; // 7 segments
        const raw = p * n;
        const seg = Math.min(Math.floor(raw), n - 1);
        const t = ease(raw - seg);

        const a = camKeyframes[seg];
        const b = camKeyframes[seg + 1];
        return {
            posX: a.posX + (b.posX - a.posX) * t,
            lookY: a.lookY + (b.lookY - a.lookY) * t,
            camZ: a.camZ + (b.camZ - a.camZ) * t,
            camYOff: a.camYOff + (b.camYOff - a.camYOff) * t,
            rotOff: a.rotOff + (b.rotOff - a.rotOff) * t,
        };
    }

    function updateCamera(p) {
        const kf = lerpKeyframes(p);

        modelGroup.position.x = kf.posX;

        // Rotation: unwind intro over first section, then continuous scroll
        // rotation + per-keyframe offset.
        const introT = ease(Math.min(p * (camKeyframes.length - 1), 1));
        const introRot = MODEL_START_ROT * (1 - introT);
        const scrollRot = p * Math.PI * 2;
        modelGroup.rotation.y = introRot + scrollRot + kf.rotOff;

        lookTarget.set(0, kf.lookY, 0);
        camera.position.set(0, kf.lookY + kf.camYOff, kf.camZ);
        camera.lookAt(lookTarget);
    }

    /* ── Resize ────────────────────────────────────────────────────── */

    // visualViewport.resize fires when iOS Safari's URL bar collapses; the
    // regular window.resize event does not, which leaves the canvas the
    // wrong size on mobile until the next orientation change.
    const onResize = () => {
        const pr = Math.min(devicePixelRatio, 2);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(pr);
        renderer.setSize(innerWidth, innerHeight);
        composer.setSize(innerWidth, innerHeight);

        const rs = getResScale();
        const ab = adaptedBloom(rs);
        bloomPass.strength = ab.strength;
        bloomPass.radius = ab.radius;
        epMat.uniforms.uPointScale.value = pointScale(rs);
        pulseMat.uniforms.uPointScale.value = pointScale(rs);
        lineMat.uniforms.uOpacity.value = lineOpacity(rs);
    };
    on(window, "resize", onResize);
    if (window.visualViewport) on(visualViewport, "resize", onResize);

    /* ── Render loop ───────────────────────────────────────────────── */

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let firstFrame = true;
    let rafId = 0;
    (function animate() {
        rafId = requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        if (reduced) scrollProgress = targetScrollProgress;
        else scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

        // Fade hero text as user scrolls
        if (heroText) {
            heroText.style.opacity = Math.max(0, 1 - scrollProgress * 4);
        }

        if (!reduced) {
            epMat.uniforms.uTime.value = elapsed;
            updatePulses(dt);
        }
        updateCamera(scrollProgress);

        composer.render();

        if (firstFrame) {
            firstFrame = false;
            document.body.dataset.sceneReady = "true";
        }
    })();

    /* ── Teardown ──────────────────────────────────────────────────── */

    return function dispose() {
        cancelAnimationFrame(rafId);
        offs.forEach((off) => off());
        scene.traverse((obj) => {
            obj.geometry?.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else m?.dispose();
        });
        composer.dispose?.();
        renderer.dispose();
        renderer.forceContextLoss?.();
        delete document.body.dataset.sceneReady;
    };
}
