// Reusable 3D background engine. Loads an SVG, extrudes its shapes into 3D, and
// animates neon pulse lines around / across the extruded silhouette. Same
// visual language as the hero scene, driven by a user-supplied SVG and a config
// object.
//
// Exposed as initSectionGraphic(host, config) => dispose(): the <SectionGraphic>
// React component renders a <section-graphic> host element and runs this in an
// effect. resolveConfig() maps camelCase props to the internal config (the
// vanilla element read kebab-case attributes).

import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import {
    adaptBloom,
    buildLineGeometry,
    buildPalette,
    createBloomComposer,
    createNeonLineMaterial,
    getResScale,
    sampleLineUniforms,
} from "./neon-line.js";

/* ── config resolution (props → internal config) ───────────────────── */

function toVec(v, def) {
    if (v == null) return def;
    if (Array.isArray(v)) return v.map(Number);
    return String(v)
        .split(",")
        .map((s) => parseFloat(s));
}
function toList(v, def) {
    if (v == null) return def;
    if (Array.isArray(v)) return v;
    return String(v)
        .split(",")
        .map((s) => s.trim());
}

// Maps the <SectionGraphic> camelCase props to the internal config the engine
// uses. Defaults and coercions mirror the vanilla element's readParams(). CSV
// strings ("0,0,36") and real arrays ([0,0,36]) are both accepted.
export function resolveConfig(props = {}) {
    const numP = (k, d) => (props[k] == null ? d : parseFloat(props[k]));
    const intP = (k, d) => (props[k] == null ? d : parseInt(props[k], 10));
    const strP = (k, d) => (props[k] == null ? d : String(props[k]));
    const boolP = (k, d) => {
        const v = props[k];
        if (v == null) return d;
        return v === true || v === "1" || v === "true";
    };
    return {
        svg: strP("svg", ""),
        lineMode: strP("lineMode", "outline"),
        numLines: intP("numLines", 48),
        pathSamples: intP("pathSamples", 200),
        extrudeDepth: numP("extrudeDepth", 6),
        bevel: boolP("bevel", false),
        bevelSize: numP("bevelSize", 0.1),
        meshStyle: strP("meshStyle", "hidden"),
        meshColor: strP("meshColor", "#0a0a12"),
        meshOpacity: numP("meshOpacity", 0),
        colorSource: strP("colorSource", "palette"),
        colors: toList(props.colors, ["#ff2d95", "#9b5cff", "#5a3bff"]).map(
            (c) => new THREE.Color(c).getHex(),
        ),
        colorGroupSize: intP("colorGroupSize", 6),
        brightProbability: numP("brightProbability", 0.2),
        dimGlow: toVec(props.dimGlow, [0.02, 0.3]),
        brightGlow: toVec(props.brightGlow, [0.5, 1.0]),
        pulseProbability: numP("pulseProbability", 0.55),
        pulseSpeed: toVec(props.pulseSpeed, [0.1, 0.4]),
        pulseTail: toVec(props.pulseTail, [0.22, 0.55]),
        pulseHead: numP("pulseHeadBoost", 12),
        pulseTailBoost: numP("pulseTailBoost", 2.5),
        pulseHeadFalloff: numP("pulseHeadFalloff", 40),
        pulsesPerLine: intP("pulsesPerLine", 1),
        bloomStrength: numP("bloomStrength", 0.6),
        bloomRadius: numP("bloomRadius", 0.28),
        bloomThreshold: numP("bloomThreshold", 0),
        fov: numP("fov", 40),
        cameraPos: toVec(props.cameraPos, [0, 0, 18]),
        cameraLook: toVec(props.cameraLook, [0, 0, 0]),
        // Continuous auto-rotation in deg/s — independent of tilt.
        rotation: toVec(props.rotation, [0, 0, 0]),
        // Mouse-driven object tilt: x-amplitude, y-amplitude (radians at full
        // mouse travel), smoothing factor per frame.
        tilt: toVec(props.tilt, [0, 0, 0]),
        // Camera parallax (same model as hero). Independent of tilt.
        parallax: toVec(props.parallax, [0, 0, 0.06]),
        // World-space offset applied to the group origin so rotation stays
        // centred on the shape while the shape sits off-axis.
        objectOffset: toVec(props.objectOffset, [0, 0]),
        // Offset applied on narrow viewports (≤1280px). Defaults to centered.
        mobileObjectOffset: toVec(props.mobileObjectOffset, [0, 0]),
        targetExtent: numP("targetExtent", 8),
        position: strP("position", "inline"),
    };
}

/* ── SVG preprocessing ─────────────────────────────────────────────── */

// Inlines paint attributes from <style> rules onto matching elements.
// SVGLoader reads `fill` / `stroke` / `opacity` as SVG attributes, NOT from
// the `style` string, so class-driven fills from Illustrator / Figma exports
// (.cls-1 { fill: #4cbd97; }) otherwise all resolve to black.
const PAINT_ATTRS = new Set([
    "fill",
    "fill-opacity",
    "stroke",
    "stroke-width",
    "stroke-opacity",
    "opacity",
    // Text styling: <text> elements render as an HTML overlay, so the
    // component needs these resolved onto the element too — otherwise a
    // class-only rule (.label-core { font-family: "Montserrat" }) would be
    // lost the moment the CSS selectors stop matching outside the SVG doc.
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "letter-spacing",
    "text-transform",
]);

async function loadSvgWithInlinedStyles(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to fetch ${url}: ${res.status}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");

    const rules = [];
    doc.querySelectorAll("style").forEach((s) => {
        const css = s.textContent || "";
        const re = /([^{}]+)\{([^}]+)\}/g;
        let m;
        while ((m = re.exec(css)) !== null) {
            const selectors = m[1]
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
            const decls = {};
            for (const decl of m[2].split(";")) {
                const ix = decl.indexOf(":");
                if (ix < 0) continue;
                const prop = decl.slice(0, ix).trim();
                const val = decl.slice(ix + 1).trim();
                if (prop) decls[prop] = val;
            }
            for (const sel of selectors) rules.push({ sel, decls });
        }
    });

    for (const { sel, decls } of rules) {
        let matches;
        try {
            matches = doc.querySelectorAll(sel);
        } catch {
            continue;
        }
        matches.forEach((el) => {
            for (const prop in decls) {
                // Only override when the element doesn't already declare the
                // paint inline, matching CSS cascade order for fairness.
                if (PAINT_ATTRS.has(prop) && !el.hasAttribute(prop)) {
                    el.setAttribute(prop, decls[prop]);
                }
            }
        });
    }

    return { svgText: new XMLSerializer().serializeToString(doc), doc };
}

// Extract <text> elements from the (style-inlined) SVG doc and convert each
// SVG (x, y) anchor into the same world frame the shapes use — centred on
// the shape bbox, Y flipped, scaled by k. The caller renders these as
// plain HTML absolutely positioned over the canvas (flat text, no neon).
function extractTexts(doc, transform) {
    const { cx, cy, k } = transform;
    const nodes = doc.querySelectorAll("text");
    const out = [];
    for (const n of nodes) {
        const content = (n.textContent || "").trim();
        if (!content) continue;
        const sx = parseFloat(n.getAttribute("x") || "0");
        const sy = parseFloat(n.getAttribute("y") || "0");
        out.push({
            text: content,
            worldX: (sx - cx) * k,
            worldY: -(sy - cy) * k,
            // Font size travels through in *SVG user units*; the renderer
            // rescales to pixels each frame based on current canvas height.
            fontSizeSvg: parseFloat(n.getAttribute("font-size") || "14"),
            fill: n.getAttribute("fill") || "",
            fontFamily: n.getAttribute("font-family") || "",
            fontWeight: n.getAttribute("font-weight") || "",
            fontStyle: n.getAttribute("font-style") || "",
            letterSpacing: n.getAttribute("letter-spacing") || "",
            textTransform: n.getAttribute("text-transform") || "",
            textAnchor: n.getAttribute("text-anchor") || "start",
        });
    }
    return out;
}

/* ── geometry helpers ──────────────────────────────────────────────── */

// Polyline perimeter length (open polyline).
function polylineLen(pts) {
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]);
    return len;
}

// Resamples a polyline to `n` evenly-spaced points along its length. Keeps
// the start and end points; intermediate points land at equal arc-length.
function resampleEvenly(points, n) {
    const cum = [0];
    for (let i = 1; i < points.length; i++) {
        cum.push(cum[i - 1] + points[i].distanceTo(points[i - 1]));
    }
    const total = cum[cum.length - 1];
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
        const target = (i / Math.max(1, n - 1)) * total;
        let lo = 1;
        while (lo < cum.length && cum[lo] < target) lo++;
        lo = Math.min(lo, cum.length - 1);
        const seg = cum[lo] - cum[lo - 1] || 1;
        const t = (target - cum[lo - 1]) / seg;
        out[i] = points[lo - 1].clone().lerp(points[lo], t);
    }
    return out;
}

// SVGLoader returns paths with Y growing downward. Flatten each shape into
// { outer, holes, outerLen, color } in a world-friendly frame: centred on
// origin, Y flipped, uniformly scaled so the longest bbox side = targetExtent.
// `color` is the SVG path's fill colour (THREE.Color) so callers can opt to
// pull neon-line colours straight from the source artwork.
function prepareShapes(paths, pathSamples, targetExtent) {
    // Keep the duplicate closing point from `getSpacedPoints(n)` (returns
    // n+1 points with last==first). We render these as THREE.Line (not
    // LineLoop) so the closing visually happens via that duplicate and aT
    // stays monotonic 0→1 — no secondary "echo" pulse on an implicit
    // LineLoop closing segment.
    const raw = [];
    for (const p of paths) {
        for (const shape of p.toShapes(true)) {
            const outer = shape.getSpacedPoints(pathSamples);
            const holes = shape.holes.map((h) =>
                h.getSpacedPoints(pathSamples),
            );
            raw.push({ outer, holes, color: p.color });
        }
    }
    if (raw.length === 0) return [];

    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    for (const s of raw) {
        for (const p of s.outer) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const size = Math.max(maxX - minX, maxY - minY) || 1;
    const k = targetExtent / size;

    const tx = (p) => new THREE.Vector2((p.x - cx) * k, -(p.y - cy) * k);

    const shapes = raw.map(({ outer, holes, color }) => {
        const o = outer.map(tx);
        const h = holes.map((hh) => hh.map(tx));
        return { outer: o, holes: h, outerLen: polylineLen(o), color };
    });
    // Arrays can carry non-index properties; stash the SVG→world transform
    // here so callers (text overlay) can align with the shapes exactly.
    shapes.transform = { cx, cy, k };
    shapes.extentX = (maxX - minX) * k;
    shapes.extentY = (maxY - minY) * k;
    return shapes;
}

// Each shape gets the same line count so big paths don't drown small ones.
// Perimeter-weighted distribution looked uneven on typical logos — a thin
// rectangle would get 30× the lines of a small accent shape.
function distribute(shapes, total) {
    const per = Math.max(2, Math.round(total / shapes.length));
    return shapes.map(() => per);
}

// Rotates a closed polyline so it starts at a random vertex. The polyline
// still traces the same silhouette, but subsequent rings of the same shape
// each start at a different seam position — smearing out any pulse-head /
// tail stacking at the aT=0 vertex instead of concentrating it at one pixel.
function rotateClosed(pts) {
    const n = pts.length;
    if (n < 3) return pts.slice();
    // Strip the duplicate closing point before rotating, then re-close at
    // the new start.
    const hasDup = pts[n - 1].distanceTo(pts[0]) < 1e-4;
    const body = hasDup ? pts.slice(0, n - 1) : pts.slice();
    const k = Math.floor(Math.random() * body.length);
    const rotated = body.slice(k).concat(body.slice(0, k));
    rotated.push(rotated[0].clone());
    return rotated;
}

/* ── line builders (one per line-mode) ─────────────────────────────── */

// Outline rings stacked along Z — same outer/hole polyline copied at
// evenly-spaced Z slices from -depth/2 to +depth/2. Each ring rotates to a
// random start vertex so stacked rings don't all share the same seam pixel.
function outlineLines(shapes, numLines, extrudeDepth) {
    const perShape = distribute(shapes, numLines);
    // Flat mode (extrude-depth=0): every Z-slice collapses to z=0, so >1
    // ring per shape paints the same outline additively at the same spot
    // and reads as a thick / blooming double line. One ring is enough.
    if (extrudeDepth === 0) perShape.fill(1);
    const lines = [];
    shapes.forEach((s, si) => {
        const n = perShape[si];
        for (let i = 0; i < n; i++) {
            const z = -extrudeDepth / 2 + (i / Math.max(1, n - 1)) * extrudeDepth;
            const outer = rotateClosed(s.outer);
            lines.push({
                points: outer.map((p) => new THREE.Vector3(p.x, p.y, z)),
                shapeIndex: si,
                closed: false,
            });
            for (const hole of s.holes) {
                const rot = rotateClosed(hole);
                lines.push({
                    points: rot.map((p) => new THREE.Vector3(p.x, p.y, z)),
                    shapeIndex: si,
                    closed: false,
                });
            }
        }
    });
    return lines;
}

// Straight lines running front-to-back, rooted at evenly-spaced perimeter
// samples. Pulses sweep along the extrusion depth rather than the silhouette.
function depthLines(shapes, numLines, pathSamples, extrudeDepth) {
    const perShape = distribute(shapes, numLines);
    const lines = [];
    shapes.forEach((s, si) => {
        const samples = resampleEvenly(s.outer, perShape[si]);
        for (const p of samples) {
            const pts = new Array(pathSamples);
            for (let j = 0; j < pathSamples; j++) {
                const z =
                    -extrudeDepth / 2 +
                    (j / (pathSamples - 1)) * extrudeDepth;
                pts[j] = new THREE.Vector3(p.x, p.y, z);
            }
            lines.push({ points: pts, shapeIndex: si, closed: false });
        }
    });
    return lines;
}

function mixedLines(shapes, numLines, pathSamples, extrudeDepth) {
    const a = Math.floor(numLines / 2);
    const b = numLines - a;
    return [
        ...outlineLines(shapes, a, extrudeDepth),
        ...depthLines(shapes, b, pathSamples, extrudeDepth),
    ];
}

function buildLines(mode, shapes, numLines, pathSamples, extrudeDepth) {
    if (mode === "depth")
        return depthLines(shapes, numLines, pathSamples, extrudeDepth);
    if (mode === "mixed")
        return mixedLines(shapes, numLines, pathSamples, extrudeDepth);
    return outlineLines(shapes, numLines, extrudeDepth);
}

/* ── extruded mesh (optional) ──────────────────────────────────────── */

function buildExtrudedMesh(shapes, style, color, opacity, depth, bevel, bevelSize) {
    if (style === "hidden") return null;
    const group = new THREE.Group();
    for (const s of shapes) {
        const shape = new THREE.Shape(s.outer);
        for (const h of s.holes) shape.holes.push(new THREE.Path(h));
        const geom = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: bevel,
            bevelSize: bevelSize,
            bevelThickness: bevelSize,
            bevelSegments: 2,
        });
        geom.translate(0, 0, -depth / 2);

        let mesh;
        if (style === "edges") {
            const edges = new THREE.EdgesGeometry(geom, 20);
            mesh = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1 }),
            );
            geom.dispose();
        } else if (style === "wireframe") {
            mesh = new THREE.Mesh(
                geom,
                new THREE.MeshBasicMaterial({ color, wireframe: true }),
            );
        } else {
            mesh = new THREE.Mesh(
                geom,
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: opacity < 1,
                    opacity,
                }),
            );
        }
        group.add(mesh);
    }
    return group;
}

// Shared scratch vector for projecting text anchors (transient per frame;
// JS is single-threaded so instances never interleave a projection loop).
const projVec = new THREE.Vector3();

/* ── engine initializer ────────────────────────────────────────────── */

export function initSectionGraphic(host, config) {
    const p = config;

    let disposed = false;
    let visible = false;
    let initialized = false;

    const canvas = document.createElement("canvas");
    host.appendChild(canvas);

    // Per-instance scene state (populated by build()).
    let scene,
        camera,
        renderer,
        composer,
        bloomPass,
        bloom,
        group,
        textLayer = null,
        textNodes = [],
        shapeScale,
        shapeExtent,
        uniformsList = [],
        basePos,
        baseLook,
        rotRad,
        tiltBase,
        parallaxBase,
        tiltRad,
        parallaxV,
        clock,
        rafId = 0,
        resizeObs = null,
        mq = null,
        onMq = null,
        onMouse = null;
    let mouseX = 0;
    let mouseY = 0;
    let autoRot = new THREE.Vector3(0, 0, 0);
    let tiltCur = new THREE.Vector2(0, 0);

    function resize() {
        if (disposed || !renderer) return;
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // On narrow viewports the configured object-offset (meant for the
        // desktop 2-column layout) pushes the shape off-screen. Center it
        // and zoom the camera so targetExtent fills the viewport in both axes.
        const narrow =
            p.position === "background" &&
            (matchMedia(
                "(max-width: 1280px) and (orientation: portrait), (max-width: 950px)",
            ).matches ||
                getComputedStyle(host).position !== "absolute");
        const baseZ = p.cameraPos[2] || 1;
        if (narrow) {
            const mox = p.mobileObjectOffset[0] || 0;
            const moy = p.mobileObjectOffset[1] || 0;
            group.position.set(mox, moy, 0);
            basePos.x = 0;
            basePos.y = 0;
            camera.position.x = 0;
            camera.position.y = 0;
            // Disable mouse-driven parallax and tilt — keep the camera locked
            // on origin so the diagram reads like a static figure on mobile.
            parallaxV = [0, 0, parallaxBase[2]];
            tiltRad = [0, 0, tiltBase[2]];
            tiltCur.set(0, 0);
            const fovRad = (p.fov * Math.PI) / 180;
            const aspect = w / h;
            const t = Math.tan(fovRad / 2);
            const ex = (shapeExtent?.x || p.targetExtent) * 1.02;
            const ey = (shapeExtent?.y || p.targetExtent) * 1.02;
            const dFitX = ex / (2 * t * aspect);
            const dFitY = ey / (2 * t);
            const d = Math.max(dFitX, dFitY);
            basePos.z = d;
            camera.position.z = d;
        } else {
            group.position.set(
                p.objectOffset[0] || 0,
                p.objectOffset[1] || 0,
                0,
            );
            basePos.x = p.cameraPos[0] || 0;
            basePos.y = p.cameraPos[1] || 0;
            basePos.z = baseZ;
            camera.position.z = baseZ;
            parallaxV = [...parallaxBase];
            tiltRad = [...tiltBase];
        }

        const ab = adaptBloom(bloom, getResScale(w, h));
        bloomPass.strength = ab.strength;
        bloomPass.radius = ab.radius;

        // Keep text legible across resizes. Match the shapes' on-screen
        // scale: SVG units → world via `shapeScale` (same k shapes use),
        // world → pixels via the perspective camera's on-axis factor at z=0.
        if (textNodes && textNodes.length) {
            const camZ = Math.abs(basePos?.z || p.cameraPos[2] || 1);
            const fovRad = (p.fov * Math.PI) / 180;
            const pxPerWorld = h / (2 * Math.tan(fovRad / 2) * camZ);
            const pxPerSvg = shapeScale * pxPerWorld;
            for (const { el, data } of textNodes) {
                const projected = data.fontSizeSvg * pxPerSvg;
                el.style.fontSize = `${Math.max(8, projected)}px`;
            }
        }
    }

    function animate() {
        if (disposed) return;
        rafId = requestAnimationFrame(animate);
        if (!visible) {
            // Keep clock in sync so rotation dt doesn't spike on return.
            clock.getDelta();
            return;
        }

        const dt = clock.getDelta();
        const t = clock.getElapsedTime();

        for (const u of uniformsList) u.uTime.value = t;

        autoRot.x += rotRad[0] * dt;
        autoRot.y += rotRad[1] * dt;
        autoRot.z += rotRad[2] * dt;

        // Tilt targets come from the mouse; ease toward them each frame so
        // the motion feels heavy and organic rather than snapping.
        const targetTiltX = mouseY * tiltRad[1];
        const targetTiltY = mouseX * tiltRad[0];
        const s = tiltRad[2];
        tiltCur.x += (targetTiltX - tiltCur.x) * s;
        tiltCur.y += (targetTiltY - tiltCur.y) * s;

        group.rotation.x = autoRot.x + tiltCur.x;
        group.rotation.y = autoRot.y + tiltCur.y;
        group.rotation.z = autoRot.z;

        const targetX = basePos.x - mouseX * parallaxV[0];
        const targetY = basePos.y + mouseY * parallaxV[1];
        const pSmooth = parallaxV[2];
        camera.position.x += (targetX - camera.position.x) * pSmooth;
        camera.position.y += (targetY - camera.position.y) * pSmooth;
        camera.lookAt(baseLook);

        // Project text anchors through the live camera & group matrix so
        // overlays track every frame — parallax, object-offset, rotation.
        if (textNodes.length) {
            group.updateMatrixWorld();
            const W = renderer.domElement.clientWidth;
            const H = renderer.domElement.clientHeight;
            for (const { el, data, anchorPct } of textNodes) {
                projVec.set(data.worldX, data.worldY, 0);
                projVec.applyMatrix4(group.matrixWorld);
                projVec.project(camera);
                const sx = (projVec.x * 0.5 + 0.5) * W;
                const sy = (-projVec.y * 0.5 + 0.5) * H;
                el.style.transform = `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) translate(${anchorPct}%, -82%)`;
            }
        }

        composer.render();
    }

    async function build() {
        if (!p.svg) {
            console.warn("[section-graphic] missing `svg`");
            return;
        }

        const loader = new SVGLoader();
        const { svgText, doc: svgDoc } = await loadSvgWithInlinedStyles(p.svg);
        if (disposed) return;
        const data = loader.parse(svgText);

        const shapes = prepareShapes(data.paths, p.pathSamples, p.targetExtent);
        if (shapes.length === 0) {
            console.warn("[section-graphic] SVG produced no shapes:", p.svg);
            return;
        }

        // Text elements from the source SVG: rendered as HTML absolutely
        // positioned over the canvas, re-projected each frame.
        const texts = extractTexts(svgDoc, shapes.transform);

        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(p.fov, w / h, 0.1, 400);
        camera.position.set(...p.cameraPos);
        camera.lookAt(new THREE.Vector3(...p.cameraLook));

        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        bloom = {
            strength: p.bloomStrength,
            radius: p.bloomRadius,
            threshold: p.bloomThreshold,
        };
        const composerPair = createBloomComposer(
            renderer,
            scene,
            camera,
            bloom,
            w,
            h,
        );
        composer = composerPair.composer;
        bloomPass = composerPair.bloomPass;

        group = new THREE.Group();
        scene.add(group);

        const meshGroup = buildExtrudedMesh(
            shapes,
            p.meshStyle,
            p.meshColor,
            p.meshOpacity,
            p.extrudeDepth,
            p.bevel,
            p.bevelSize,
        );
        if (meshGroup) group.add(meshGroup);

        const lineRecords = buildLines(
            p.lineMode,
            shapes,
            p.numLines,
            p.pathSamples,
            p.extrudeDepth,
        );
        const paletteFor = buildPalette(
            p.colors,
            lineRecords.length,
            p.colorGroupSize,
        );
        // When the caller opts into SVG colours, each line wears its owning
        // shape's fill colour verbatim; otherwise fall back to the palette.
        const useSvgColor = p.colorSource === "svg";
        const colorFor = (i) =>
            useSvgColor
                ? shapes[lineRecords[i].shapeIndex].color.clone()
                : paletteFor(i);
        const cfg = {
            brightProbability: p.brightProbability,
            dimGlowMin: p.dimGlow[0],
            dimGlowMax: p.dimGlow[1],
            brightGlowMin: p.brightGlow[0],
            brightGlowMax: p.brightGlow[1],
            pulseProbability: p.pulseProbability,
            pulseSpeedMin: p.pulseSpeed[0],
            pulseSpeedMax: p.pulseSpeed[1],
            pulseTailMin: p.pulseTail[0],
            pulseTailMax: p.pulseTail[1],
            pulseHead: p.pulseHead,
            pulseTail: p.pulseTailBoost,
            pulseHeadFalloff: p.pulseHeadFalloff,
            pulseCount: p.pulsesPerLine,
        };
        uniformsList = [];
        for (let i = 0; i < lineRecords.length; i++) {
            const rec = lineRecords[i];
            const geom = buildLineGeometry(rec.points, undefined, rec.closed);
            const opts = sampleLineUniforms(cfg, i, colorFor);
            const { material, uniforms } = createNeonLineMaterial(opts);
            uniformsList.push(uniforms);
            const LineCtor = rec.closed ? THREE.LineLoop : THREE.Line;
            group.add(new LineCtor(geom, material));
        }

        group.position.set(p.objectOffset[0] || 0, p.objectOffset[1] || 0, 0);

        // Text overlay: one HTML div per <text>, parented to a layer over the
        // canvas. Each frame we project the text's world anchor through the
        // live camera so parallax/object-offset/rotation carry the text.
        textNodes = [];
        if (texts.length) {
            textLayer = document.createElement("div");
            textLayer.className = "sg-text-layer";
            host.appendChild(textLayer);
            for (const t of texts) {
                const el = document.createElement("div");
                el.className = "sg-text";
                el.textContent = t.text;
                if (t.fill) el.style.color = t.fill;
                if (t.fontFamily) el.style.fontFamily = t.fontFamily;
                if (t.fontWeight) el.style.fontWeight = t.fontWeight;
                if (t.fontStyle) el.style.fontStyle = t.fontStyle;
                if (t.letterSpacing) el.style.letterSpacing = t.letterSpacing;
                if (t.textTransform) el.style.textTransform = t.textTransform;
                // SVG text-anchor → HTML %-shift so the projected point stays
                // the same anchor (start/middle/end → left/centre/right).
                const anchorPct =
                    t.textAnchor === "middle"
                        ? -50
                        : t.textAnchor === "end"
                          ? -100
                          : 0;
                textLayer.appendChild(el);
                textNodes.push({ el, data: t, anchorPct });
            }
        }

        shapeScale = shapes.transform.k;
        shapeExtent = { x: shapes.extentX, y: shapes.extentY };
        basePos = new THREE.Vector3(...p.cameraPos);
        baseLook = new THREE.Vector3(...p.cameraLook);

        const DEG = Math.PI / 180;
        rotRad = [p.rotation[0] * DEG, p.rotation[1] * DEG, p.rotation[2] * DEG];
        tiltBase = [p.tilt[0] * DEG, p.tilt[1] * DEG, p.tilt[2] || 1];
        parallaxBase = [p.parallax[0], p.parallax[1], p.parallax[2]];
        tiltRad = [...tiltBase];
        parallaxV = [...parallaxBase];

        resize();
        resizeObs = new ResizeObserver(() => resize());
        resizeObs.observe(host);
        mq = matchMedia("(max-width: 1280px)");
        onMq = () => resize();
        mq.addEventListener("change", onMq);

        onMouse = (e) => {
            mouseX = (e.clientX / innerWidth) * 2 - 1;
            mouseY = (e.clientY / innerHeight) * 2 - 1;
        };
        addEventListener("mousemove", onMouse);

        clock = new THREE.Clock();
        animate();
    }

    // Defer build() until the host first intersects the viewport — avoids
    // building shaders/geometry for a background graphic the user may never
    // scroll to.
    const io = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                visible = e.isIntersecting;
                if (visible && !initialized) {
                    initialized = true;
                    build().catch((err) =>
                        console.error("[section-graphic] init failed:", err),
                    );
                }
            }
        },
        { rootMargin: "200px" },
    );
    io.observe(host);

    return function dispose() {
        disposed = true;
        io.disconnect();
        resizeObs?.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        if (onMouse) removeEventListener("mousemove", onMouse);
        if (mq && onMq) mq.removeEventListener("change", onMq);
        textLayer?.remove();
        if (scene) {
            scene.traverse((obj) => {
                obj.geometry?.dispose();
                const m = obj.material;
                if (Array.isArray(m)) m.forEach((x) => x.dispose());
                else m?.dispose();
            });
        }
        composer?.dispose?.();
        renderer?.dispose();
        renderer?.forceContextLoss?.();
        canvas.remove();
    };
}
