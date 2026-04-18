// Hero background for home.html — a swept curtain of neon ribbons curving
// from floor to wall, with travelling pulses and bloom.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("hero-bg");
const hero = canvas.parentElement;

const CONFIG = {
    numLines: 128,
    xMin: -22,
    xMax: 14,
    zNear: 32, // start well behind the camera so line ends are off-screen
    zWall: -72, // wall plane (furthest from camera)
    rBend: 10.0, // fillet radius at floor/wall corner
    yTop: 90, // how high wall lines extend
    divisions: 280, // path samples per line
    cameraPos: [-3, 2.2, 9],
    cameraLookAt: [-10, 2.5, -6],
    fov: 50,
    // Every Nth line picks a fresh anchor from the palette; lines in
    // between are gradient-lerped between anchors.
    colorGroupSize: 10,
    palette: [
        0xff2d95, // hot pink
        0xff4570, // red-pink
        0x9b5cff, // purple
        0x5a3bff, // violet-blue
        0xff7a4d, // orange
    ],
    // Per-line random base glow — bimodal so most lines are dim with
    // occasional bright pops. Full range spans 1% → 100%.
    brightProbability: 0.22,
    dimGlowMin: 0.01,
    dimGlowMax: 0.3,
    brightGlowMin: 0.5,
    brightGlowMax: 1.0,
    // Pulse travel: fraction of lines that get a moving pulse, plus
    // speed / tail length ranges. Pulse phase is randomised per line.
    pulseProbability: 0.55,
    pulseSpeedMin: 0.1,
    pulseSpeedMax: 0.4,
    pulseTailMin: 0.22,
    pulseTailMax: 0.55,
    pulseHeadBoost: 12.0,
    pulseTailBoost: 2.5,
    parallax: { x: 1.2, y: 0.45, smoothing: 0.06 },
    // Random horizontal jitter on line placement (fraction of nominal
    // spacing). 0 = perfectly equidistant, 1 = ±half spacing.
    xJitter: 0.75,
    // Lower = softer leading edge tapering symmetrically into the tail.
    pulseHeadFalloff: 40.0,
    bloom: { strength: 0.6, radius: 0.28, threshold: 0.0 },
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 400);
camera.position.set(...CONFIG.cameraPos);
camera.lookAt(...CONFIG.cameraLookAt);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

// MSAA target keeps line edges smooth — the renderer's `antialias: true`
// is bypassed once the composer renders to its own framebuffer.
const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
    samples: 4,
    type: THREE.HalfFloatType,
});
const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(new RenderPass(scene, camera));

// Resolution-adaptive bloom: UnrealBloomPass strength/radius are
// pixel-dependent, so the same values produce thicker glow on low-res
// and tighter glow on high-res. Scale both for visual consistency.
const REF_PIXELS = 3840 * 2160;
function getResScale(w, h) {
    const pr = Math.min(devicePixelRatio, 2);
    return Math.sqrt((w * pr * h * pr) / REF_PIXELS);
}
function adaptedBloom(rs) {
    return {
        strength: THREE.MathUtils.clamp(CONFIG.bloom.strength * rs, 0.25, 0.9),
        radius: THREE.MathUtils.clamp(CONFIG.bloom.radius / rs, 0.15, 0.6),
    };
}

const initScale = getResScale(hero.clientWidth, hero.clientHeight);
const initBloom = adaptedBloom(initScale);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(1, 1),
    initBloom.strength,
    initBloom.radius,
    CONFIG.bloom.threshold,
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const ab = adaptedBloom(getResScale(w, h));
    bloomPass.strength = ab.strength;
    bloomPass.radius = ab.radius;
}
resize();
addEventListener("resize", resize);

// Path: floor (−Z travel) → quarter-arc fillet → wall (+Y travel).
// Fillet centered at (rBend, zWall + rBend) so tangents meet the
// straight floor/wall segments smoothly.
const { zNear, zWall, rBend, yTop } = CONFIG;
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

// Shared shader — each line gets its own uniforms but the same code.
// `aT` is a per-vertex path parameter (0 → 1) used by the fragment
// shader to position pulses along the line.
const vertexShader = /* glsl */ `
    attribute float aT;
    varying float vT;
    void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const fragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uBaseGlow;
    uniform float uTime;
    uniform float uHasPulse;
    uniform float uPulseSpeed;
    uniform float uPulseOffset;
    uniform float uPulseTailLen;
    uniform float uPulseHead;
    uniform float uPulseTail;
    uniform float uPulseHeadFalloff;
    varying float vT;

    void main() {
        float intensity = uBaseGlow;

        if (uHasPulse > 0.5) {
            // phase ∈ [0,1) sweeps the pulse head along the line
            float phase = fract(uTime * uPulseSpeed + uPulseOffset);
            // Distance behind the pulse head, wrapped so the tail
            // keeps decaying smoothly across cycle boundaries.
            float d1 = phase - vT;
            float d = d1 >= 0.0 ? d1 : d1 + 1.0;
            float tail = exp(-d / uPulseTailLen) * uPulseTail;
            // Halo around the head. Falloff matches the tail feel
            // so the leading edge tapers as smoothly as the trail.
            float head = exp(-abs(d1) * uPulseHeadFalloff) * uPulseHead;
            intensity += tail + head;
        }

        gl_FragColor = vec4(uColor * intensity, 1.0);
    }
`;

function randRange(min, max) {
    return min + Math.random() * (max - min);
}

// Shared aT attribute — identical across every line.
const tArr = new Float32Array(CONFIG.divisions + 1);
for (let j = 0; j <= CONFIG.divisions; j++) {
    tArr[j] = j / CONFIG.divisions;
}

// Pre-sample anchor colours every `colorGroupSize` lines; in-between
// lines lerp between the bracketing anchors for a smooth gradient.
const anchorStep = Math.max(1, CONFIG.colorGroupSize);
const numAnchors = Math.ceil((CONFIG.numLines - 1) / anchorStep) + 1;
const anchorColors = [];
for (let a = 0; a < numAnchors; a++) {
    anchorColors.push(
        new THREE.Color(
            CONFIG.palette[Math.floor(Math.random() * CONFIG.palette.length)],
        ),
    );
}

const allUniforms = [];
const group = new THREE.Group();

const spacing = (CONFIG.xMax - CONFIG.xMin) / (CONFIG.numLines - 1);
for (let i = 0; i < CONFIG.numLines; i++) {
    const jitter = (Math.random() - 0.5) * spacing * CONFIG.xJitter;
    const x = CONFIG.xMin + i * spacing + jitter;

    const pts = new Array(CONFIG.divisions + 1);
    for (let j = 0; j <= CONFIG.divisions; j++) {
        const [y, z] = pathPoint(j / CONFIG.divisions);
        pts[j] = new THREE.Vector3(x, y, z);
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    geom.setAttribute("aT", new THREE.BufferAttribute(tArr, 1));

    const frac = i / anchorStep;
    const loIdx = Math.floor(frac);
    const hiIdx = Math.min(loIdx + 1, numAnchors - 1);
    const color = anchorColors[loIdx]
        .clone()
        .lerp(anchorColors[hiIdx], frac - loIdx);

    const isBright = Math.random() < CONFIG.brightProbability;
    const baseGlow = isBright
        ? randRange(CONFIG.brightGlowMin, CONFIG.brightGlowMax)
        : randRange(CONFIG.dimGlowMin, CONFIG.dimGlowMax);
    const uniforms = {
        uColor: { value: color },
        uBaseGlow: { value: baseGlow },
        uTime: { value: 0 },
        uHasPulse: {
            value: Math.random() < CONFIG.pulseProbability ? 1 : 0,
        },
        uPulseSpeed: {
            value: randRange(CONFIG.pulseSpeedMin, CONFIG.pulseSpeedMax),
        },
        uPulseOffset: { value: Math.random() },
        uPulseTailLen: {
            value: randRange(CONFIG.pulseTailMin, CONFIG.pulseTailMax),
        },
        uPulseHead: { value: CONFIG.pulseHeadBoost },
        uPulseTail: { value: CONFIG.pulseTailBoost },
        uPulseHeadFalloff: { value: CONFIG.pulseHeadFalloff },
    };
    allUniforms.push(uniforms);

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    group.add(new THREE.Line(geom, material));
}

scene.add(group);

// Mouse parallax — track normalized cursor, lerp camera each frame
const basePos = new THREE.Vector3(...CONFIG.cameraPos);
const baseLookAt = new THREE.Vector3(...CONFIG.cameraLookAt);
const targetPos = basePos.clone();
let mouseX = 0;
let mouseY = 0;
addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / innerWidth) * 2 - 1;
    mouseY = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
(function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    for (const u of allUniforms) u.uTime.value = t;

    targetPos.set(
        basePos.x - mouseX * CONFIG.parallax.x,
        basePos.y + mouseY * CONFIG.parallax.y,
        basePos.z,
    );
    camera.position.lerp(targetPos, CONFIG.parallax.smoothing);
    camera.lookAt(baseLookAt);

    composer.render();
})();
