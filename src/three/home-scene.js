// Hero background for the home page — a swept curtain of neon ribbons curving
// from floor to wall, with travelling pulses and bloom.
//
// Exposed as initHomeScene(canvas, opts) => dispose(): the React hook owns the
// <canvas>; this builds the scene and returns a teardown.

import * as THREE from "three";
import {
    adaptBloom,
    buildLineGeometry,
    buildPalette,
    createBloomComposer,
    createNeonLineMaterial,
    getResScale,
    sampleLineUniforms,
} from "./neon-line.js";

/* ── Tunables ──────────────────────────────────────────────────────── */

const numLines = 128;
const xMin = -22;
const xMax = 14;
const zNear = 32; // start well behind the camera so line ends are off-screen
const zWall = -72; // wall plane (furthest from camera)
const rBend = 10.0; // fillet radius at floor/wall corner
const yTop = 90; // how high wall lines extend
const divisions = 280; // path samples per line
const cameraPos = [-3, 2.2, 9];
const cameraLookAt = [-10, 2.5, -6];
const fov = 50;

// Every Nth line picks a fresh anchor from the palette; lines in
// between are gradient-lerped between anchors.
const colorGroupSize = 10;
const palette = [
    0xff2d95, // hot pink
    0xff4570, // red-pink
    0x9b5cff, // purple
    0x5a3bff, // violet-blue
    0xff7a4d, // orange
];

// Per-line random base glow — bimodal so most lines are dim with
// occasional bright pops. Full range spans 1% → 100%.
const lineCfg = {
    brightProbability: 0.22,
    dimGlowMin: 0.01,
    dimGlowMax: 0.3,
    brightGlowMin: 0.5,
    brightGlowMax: 1.0,
    pulseProbability: 0.55,
    pulseSpeedMin: 0.1,
    pulseSpeedMax: 0.4,
    pulseTailMin: 0.22,
    pulseTailMax: 0.55,
    pulseHead: 12.0,
    pulseTail: 2.5,
    // Lower = softer leading edge tapering symmetrically into the tail.
    pulseHeadFalloff: 40.0,
};

// Random horizontal jitter on line placement (fraction of nominal
// spacing). 0 = perfectly equidistant, 1 = ±half spacing.
const xJitter = 0.75;

const parallax = { x: 1.2, y: 0.45, smoothing: 0.06 };
const bloom = { strength: 0.6, radius: 0.28, threshold: 0.0 };

// Path: floor (−Z travel) → quarter-arc fillet → wall (+Y travel).
// Fillet centered at (rBend, zWall + rBend) so tangents meet the
// straight floor/wall segments smoothly.
const zFloorEnd = zWall + rBend;
const floorLen = zNear - zFloorEnd;
const arcLen = (rBend * Math.PI) / 2;
const wallLen = yTop - rBend;
const totalLen = floorLen + arcLen + wallLen;

function pathPoint(t) {
    let s = t * totalLen;
    if (s < floorLen) return [0, zNear - s];
    s -= floorLen;
    if (s < arcLen) {
        const theta = Math.PI + (s / arcLen) * (Math.PI / 2);
        return [
            rBend + rBend * Math.cos(theta),
            zWall + rBend + rBend * Math.sin(theta),
        ];
    }
    s -= arcLen;
    return [rBend + s, zWall];
}

/* ── Scene initializer ─────────────────────────────────────────────── */

export function initHomeScene(canvas, options = {}) {
    const hero = options.hero ?? canvas.parentElement;

    const offs = [];
    const on = (target, ev, fn, opt) => {
        target.addEventListener(ev, fn, opt);
        offs.push(() => target.removeEventListener(ev, fn, opt));
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
    camera.position.set(...cameraPos);
    camera.lookAt(...cameraLookAt);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const { composer, bloomPass } = createBloomComposer(
        renderer,
        scene,
        camera,
        bloom,
        hero.clientWidth,
        hero.clientHeight,
    );

    function resize() {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        const ab = adaptBloom(bloom, getResScale(w, h));
        bloomPass.strength = ab.strength;
        bloomPass.radius = ab.radius;
    }
    resize();
    on(window, "resize", resize);
    if (window.visualViewport) on(visualViewport, "resize", resize);

    // Shared aT buffer — identical across every line, so one Float32Array can
    // back all 128 BufferAttribute wrappers.
    const tArr = new Float32Array(divisions + 1);
    for (let j = 0; j <= divisions; j++) tArr[j] = j / divisions;

    const colorFor = buildPalette(palette, numLines, colorGroupSize);

    const allUniforms = [];
    const group = new THREE.Group();

    const spacing = (xMax - xMin) / (numLines - 1);
    for (let i = 0; i < numLines; i++) {
        const jitter = (Math.random() - 0.5) * spacing * xJitter;
        const x = xMin + i * spacing + jitter;

        const pts = new Array(divisions + 1);
        for (let j = 0; j <= divisions; j++) {
            const [y, z] = pathPoint(j / divisions);
            pts[j] = new THREE.Vector3(x, y, z);
        }

        const geom = buildLineGeometry(pts, tArr);
        const opts = sampleLineUniforms(lineCfg, i, colorFor);
        const { material, uniforms } = createNeonLineMaterial(opts);
        allUniforms.push(uniforms);

        group.add(new THREE.Line(geom, material));
    }

    scene.add(group);

    const basePos = new THREE.Vector3(...cameraPos);
    const baseLookAt = new THREE.Vector3(...cameraLookAt);
    const targetPos = basePos.clone();
    let mouseX = 0;
    let mouseY = 0;
    on(window, "mousemove", (e) => {
        mouseX = (e.clientX / innerWidth) * 2 - 1;
        mouseY = (e.clientY / innerHeight) * 2 - 1;
    });

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let firstFrame = true;
    let rafId = 0;
    function animate() {
        rafId = requestAnimationFrame(animate);
        if (!reduced) {
            const t = clock.getElapsedTime();
            for (const u of allUniforms) u.uTime.value = t;

            targetPos.set(
                basePos.x - mouseX * parallax.x,
                basePos.y + mouseY * parallax.y,
                basePos.z,
            );
            camera.position.lerp(targetPos, parallax.smoothing);
        }
        camera.lookAt(baseLookAt);

        composer.render();

        if (firstFrame) {
            firstFrame = false;
            document.body.dataset.sceneReady = "true";
        }
    }
    animate();

    // Pause/resume across GPU context loss so the loop neither throws against a
    // dead context nor stays frozen after the browser restores it.
    let contextLost = false;
    on(canvas, "webglcontextlost", (e) => {
        e.preventDefault();
        contextLost = true;
        cancelAnimationFrame(rafId);
    });
    on(canvas, "webglcontextrestored", () => {
        if (!contextLost) return;
        contextLost = false;
        animate();
    });

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
