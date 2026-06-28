// Shared neon-line primitives — shader, material factory, geometry helper,
// palette builder, and a resolution-adaptive bloom composer. Used by the
// hero scene (home-scene.js) and the <section-graphic> custom element.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Identity tagged template — marker for the build's GLSL minifier.
const glsl = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ""), "");

// `aT` is a per-vertex path parameter (0 → 1); the fragment shader uses it to
// position travelling pulses and to fade the tail smoothly across cycles.
export const vertexShader = glsl`
    attribute float aT;
    varying float vT;
    void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = glsl`
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
    uniform float uPulseCount;
    varying float vT;

    const int MAX_PULSES = 6;

    void main() {
        float intensity = uBaseGlow;

        if (uHasPulse > 0.5) {
            float count = max(uPulseCount, 1.0);
            for (int k = 0; k < MAX_PULSES; k++) {
                if (float(k) >= count) break;
                float phase = fract(uTime * uPulseSpeed + uPulseOffset + float(k) / count);
                float d1 = phase - vT;
                float d = d1 >= 0.0 ? d1 : d1 + 1.0;
                float tail = exp(-d / uPulseTailLen) * uPulseTail;
                float head = exp(-abs(d1) * uPulseHeadFalloff) * uPulseHead;
                intensity += tail + head;
            }
        }

        gl_FragColor = vec4(uColor * intensity, 1.0);
    }
`;

export function randRange(min, max) {
    return min + Math.random() * (max - min);
}

// Creates a ShaderMaterial + uniforms pair for one neon line. Additive
// blending + depthWrite off so lines accumulate into the bloom pass.
export function createNeonLineMaterial(opts) {
    const uniforms = {
        uColor: { value: opts.color },
        uBaseGlow: { value: opts.baseGlow },
        uTime: { value: 0 },
        uHasPulse: { value: opts.hasPulse ? 1 : 0 },
        uPulseSpeed: { value: opts.pulseSpeed },
        uPulseOffset: { value: opts.pulseOffset },
        uPulseTailLen: { value: opts.pulseTailLen },
        uPulseHead: { value: opts.pulseHead },
        uPulseTail: { value: opts.pulseTail },
        uPulseHeadFalloff: { value: opts.pulseHeadFalloff },
        uPulseCount: { value: opts.pulseCount || 1 },
    };
    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    return { material, uniforms };
}

// Builds a BufferGeometry from a list of THREE.Vector3 points with the
// per-vertex `aT` attribute populated uniformly from 0 → 1. Pass a shared
// `tArr` Float32Array when many lines have identical vertex counts to avoid
// reallocating the attribute buffer per line. When `closed` is true, aT is
// spaced as j/n instead of j/(n-1) so the implicit LineLoop closing segment
// covers the same aT increment as every other segment — without this, the
// pulse would traverse the wrap-around segment at a different speed.
export function buildLineGeometry(points, tArr, closed = false) {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const n = points.length;
    if (!tArr || tArr.length !== n) {
        tArr = new Float32Array(n);
        const denom = closed ? n : Math.max(1, n - 1);
        for (let j = 0; j < n; j++) tArr[j] = j / denom;
    }
    geom.setAttribute("aT", new THREE.BufferAttribute(tArr, 1));
    return geom;
}

// Resolution-adaptive bloom: UnrealBloomPass strength/radius are
// pixel-dependent, so the same nominal values produce thicker glow on
// low-res and tighter glow on high-res. Scale both for visual consistency.
const REF_PIXELS = 3840 * 2160;

export function getResScale(w, h) {
    const pr = Math.min(devicePixelRatio, 2);
    return Math.sqrt((w * pr * h * pr) / REF_PIXELS);
}

export function adaptBloom(bloom, rs) {
    return {
        strength: THREE.MathUtils.clamp(bloom.strength * rs, 0.25, 0.9),
        radius: THREE.MathUtils.clamp(bloom.radius / rs, 0.15, 0.6),
    };
}

// Constructs an EffectComposer with MSAA render target, RenderPass,
// UnrealBloomPass (resolution-adapted), and OutputPass. Returns
// { composer, bloomPass } so callers can re-adapt on resize.
export function createBloomComposer(renderer, scene, camera, bloom, w, h) {
    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
        samples: 4,
        type: THREE.HalfFloatType,
    });
    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(new RenderPass(scene, camera));

    const ab = adaptBloom(bloom, getResScale(w, h));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        ab.strength,
        ab.radius,
        bloom.threshold,
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    return { composer, bloomPass };
}

// Precomputes palette anchors and returns a `(i) => THREE.Color` that
// gradient-lerps between anchors every `groupSize` lines. Matches the
// original hero scene's colour distribution exactly when groupSize and
// numLines match.
export function buildPalette(colors, numLines, groupSize) {
    const step = Math.max(1, groupSize);
    const numAnchors = Math.ceil(Math.max(numLines - 1, 1) / step) + 1;
    const anchors = [];
    for (let a = 0; a < numAnchors; a++) {
        anchors.push(
            new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        );
    }
    return (i) => {
        const frac = i / step;
        const loIdx = Math.floor(frac);
        const hiIdx = Math.min(loIdx + 1, numAnchors - 1);
        return anchors[loIdx].clone().lerp(anchors[hiIdx], frac - loIdx);
    };
}

// Rolls per-line randomised uniform values from tunable ranges. `colorFor`
// is the callable returned by `buildPalette`. Keeps the hero scene and the
// section-graphic element using identical distributions.
export function sampleLineUniforms(cfg, i, colorFor) {
    const isBright = Math.random() < cfg.brightProbability;
    const baseGlow = isBright
        ? randRange(cfg.brightGlowMin, cfg.brightGlowMax)
        : randRange(cfg.dimGlowMin, cfg.dimGlowMax);
    return {
        color: colorFor(i),
        baseGlow,
        hasPulse: Math.random() < cfg.pulseProbability,
        pulseSpeed: randRange(cfg.pulseSpeedMin, cfg.pulseSpeedMax),
        pulseOffset: Math.random(),
        pulseTailLen: randRange(cfg.pulseTailMin, cfg.pulseTailMax),
        pulseHead: cfg.pulseHead,
        pulseTail: cfg.pulseTail,
        pulseHeadFalloff: cfg.pulseHeadFalloff,
        pulseCount: cfg.pulseCount || 1,
    };
}
