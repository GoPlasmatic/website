// <section-graphic svg="…"> — a reusable 3D background component.
//
// Loads an SVG, extrudes its shapes into 3D, and animates neon pulse lines
// around / across the extruded silhouette. Same visual language as the hero
// scene, driven by user-supplied SVG and parameterised via attributes.

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

/* ── attribute parsing helpers ─────────────────────────────────────── */

const num = (el, name, def) => {
    const v = el.getAttribute(name);
    return v == null ? def : parseFloat(v);
};
const int = (el, name, def) => {
    const v = el.getAttribute(name);
    return v == null ? def : parseInt(v, 10);
};
const str = (el, name, def) => el.getAttribute(name) ?? def;
const bool = (el, name, def) => {
    const v = el.getAttribute(name);
    if (v == null) return def;
    return v === "1" || v === "true";
};
const vec = (el, name, def) => {
    const v = el.getAttribute(name);
    if (v == null) return def;
    return v.split(",").map((s) => parseFloat(s));
};
const list = (el, name, def) => {
    const v = el.getAttribute(name);
    if (v == null) return def;
    return v.split(",").map((s) => s.trim());
};

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

// Each entry: { points: Vector3[], shapeIndex: number, closed: boolean }.
// Outline rings are emitted as `closed: false` because the polyline already
// contains a duplicate last==first vertex — THREE.Line closes them visually
// through that duplicate while keeping aT monotonic 0→1 (avoids the pulse
// echo that a LineLoop implicit-close segment would produce).

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

/* ── shared visibility observer ────────────────────────────────────── */

const visibilityObserver = new IntersectionObserver(
    (entries) => {
        for (const e of entries) {
            const fn = e.target._sgSetVisible;
            if (fn) fn(e.isIntersecting);
        }
    },
    { rootMargin: "200px" },
);

/* ── custom element ────────────────────────────────────────────────── */

class SectionGraphic extends HTMLElement {
    connectedCallback() {
        if (this.canvas) return;
        this.disposed = false;
        this.visible = false;
        this.initialized = false;

        this.canvas = document.createElement("canvas");
        this.appendChild(this.canvas);

        this.params = this.readParams();

        // Defer init() until the element first intersects the viewport —
        // avoids building shaders/geometry for a background graphic the
        // user may never scroll to.
        this._sgSetVisible = (v) => {
            this.visible = v;
            if (v && !this.initialized) {
                this.initialized = true;
                this.init().catch((err) => {
                    console.error("[section-graphic] init failed:", err);
                });
            }
        };
        visibilityObserver.observe(this);
    }

    disconnectedCallback() {
        this.disposed = true;
        visibilityObserver.unobserve(this);
        if (this.resizeObs) this.resizeObs.disconnect();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this._onMouse) removeEventListener("mousemove", this._onMouse);
        if (this.textLayer) this.textLayer.remove();

        if (this.scene) {
            this.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    const m = obj.material;
                    if (Array.isArray(m)) m.forEach((x) => x.dispose());
                    else m.dispose();
                }
            });
        }
        if (this.composer) this.composer.dispose();
        if (this.renderer) this.renderer.dispose();
        this.canvas = null;
    }

    readParams() {
        return {
            svg: str(this, "svg", ""),
            lineMode: str(this, "line-mode", "outline"),
            numLines: int(this, "num-lines", 48),
            pathSamples: int(this, "path-samples", 200),
            extrudeDepth: num(this, "extrude-depth", 6),
            bevel: bool(this, "bevel", false),
            bevelSize: num(this, "bevel-size", 0.1),
            meshStyle: str(this, "mesh-style", "hidden"),
            meshColor: str(this, "mesh-color", "#0a0a12"),
            meshOpacity: num(this, "mesh-opacity", 0),
            colorSource: str(this, "color-source", "palette"),
            colors: list(this, "colors", [
                "#ff2d95",
                "#9b5cff",
                "#5a3bff",
            ]).map((c) => new THREE.Color(c).getHex()),
            colorGroupSize: int(this, "color-group-size", 6),
            brightProbability: num(this, "bright-probability", 0.2),
            dimGlow: vec(this, "dim-glow", [0.02, 0.3]),
            brightGlow: vec(this, "bright-glow", [0.5, 1.0]),
            pulseProbability: num(this, "pulse-probability", 0.55),
            pulseSpeed: vec(this, "pulse-speed", [0.1, 0.4]),
            pulseTail: vec(this, "pulse-tail", [0.22, 0.55]),
            pulseHead: num(this, "pulse-head-boost", 12),
            pulseTailBoost: num(this, "pulse-tail-boost", 2.5),
            pulseHeadFalloff: num(this, "pulse-head-falloff", 40),
            pulsesPerLine: int(this, "pulses-per-line", 1),
            bloomStrength: num(this, "bloom-strength", 0.6),
            bloomRadius: num(this, "bloom-radius", 0.28),
            bloomThreshold: num(this, "bloom-threshold", 0),
            fov: num(this, "fov", 40),
            cameraPos: vec(this, "camera-pos", [0, 0, 18]),
            cameraLook: vec(this, "camera-look", [0, 0, 0]),
            // Continuous auto-rotation in deg/s — independent of tilt.
            rotation: vec(this, "rotation", [0, 0, 0]),
            // Mouse-driven object tilt: x-amplitude, y-amplitude (radians
            // at full mouse travel), smoothing factor per frame.
            tilt: vec(this, "tilt", [0, 0, 0]),
            // Camera parallax (same model as hero). Keeps tilt and camera
            // parallax independent so callers can mix or pick one.
            parallax: vec(this, "parallax", [0, 0, 0.06]),
            // World-space offset applied to the group origin so rotation
            // stays centred on the shape while the shape sits off-axis.
            objectOffset: vec(this, "object-offset", [0, 0]),
            // Offset applied on narrow viewports (≤1280px). Defaults to
            // centered (0,0) since the side-by-side desktop layout doesn't
            // apply when the canvas stacks above prose.
            mobileObjectOffset: vec(this, "mobile-object-offset", [0, 0]),
            targetExtent: num(this, "target-extent", 8),
            position: str(this, "position", "inline"),
        };
    }

    async init() {
        const p = this.params;
        if (!p.svg) {
            console.warn("[section-graphic] missing `svg` attribute");
            return;
        }

        const loader = new SVGLoader();
        const { svgText, doc: svgDoc } = await loadSvgWithInlinedStyles(p.svg);
        if (this.disposed) return;
        const data = loader.parse(svgText);

        const shapes = prepareShapes(data.paths, p.pathSamples, p.targetExtent);
        if (shapes.length === 0) {
            console.warn("[section-graphic] SVG produced no shapes:", p.svg);
            return;
        }

        // Text elements from the source SVG: rendered as HTML absolutely
        // positioned over the canvas, re-projected each frame so camera
        // parallax / object-offset / group rotation carry them with the
        // shapes. They never enter the neon pipeline — intentional, per
        // the "flat text over 3D diagram" use case.
        const texts = extractTexts(svgDoc, shapes.transform);

        const w = this.clientWidth || 1;
        const h = this.clientHeight || 1;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(p.fov, w / h, 0.1, 400);
        camera.position.set(...p.cameraPos);
        camera.lookAt(new THREE.Vector3(...p.cameraLook));

        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        const bloom = {
            strength: p.bloomStrength,
            radius: p.bloomRadius,
            threshold: p.bloomThreshold,
        };
        const { composer, bloomPass } = createBloomComposer(
            renderer,
            scene,
            camera,
            bloom,
            w,
            h,
        );

        const group = new THREE.Group();
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
        // shape's fill colour verbatim; otherwise we fall back to the
        // configured palette (same distribution as the hero scene).
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
        const uniformsList = [];
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

        // ── Text overlay: one HTML div per <text>, parented to a layer
        // that sits on top of the canvas. Each frame we project the text's
        // world anchor through the live camera to get its screen pixel
        // position, so camera parallax, object-offset and group rotation
        // move the text with the shapes automatically.
        let textLayer = null;
        const textNodes = [];
        if (texts.length) {
            textLayer = document.createElement("div");
            textLayer.className = "sg-text-layer";
            this.appendChild(textLayer);
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
                // SVG text-anchor → HTML %-shift so the projected point
                // stays the same anchor (start/middle/end → left/centre/right).
                // Vertical: SVG `y` is the text baseline; shift up ~0.82em
                // since HTML divs anchor at the top.
                const anchorPct =
                    t.textAnchor === "middle" ? -50
                        : t.textAnchor === "end" ? -100
                        : 0;
                textLayer.appendChild(el);
                textNodes.push({ el, data: t, anchorPct });
            }
        }

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;
        this.bloomPass = bloomPass;
        this.bloom = bloom;
        this.group = group;
        this.textLayer = textLayer;
        this.textNodes = textNodes;
        this.shapeScale = shapes.transform.k;
        this.shapeExtent = { x: shapes.extentX, y: shapes.extentY };
        this.uniformsList = uniformsList;
        this.basePos = new THREE.Vector3(...p.cameraPos);
        this.baseLook = new THREE.Vector3(...p.cameraLook);
        this.mouseX = 0;
        this.mouseY = 0;
        // Auto-rotation accumulators and smoothed tilt — applied together
        // each frame so the two never fight over group.rotation.
        this.autoRot = new THREE.Vector3(0, 0, 0);
        this.tiltCur = new THREE.Vector2(0, 0);

        const DEG = Math.PI / 180;
        this.rotRad = [p.rotation[0] * DEG, p.rotation[1] * DEG, p.rotation[2] * DEG];
        this.tiltBase = [p.tilt[0] * DEG, p.tilt[1] * DEG, p.tilt[2] || 1];
        this.parallaxBase = [p.parallax[0], p.parallax[1], p.parallax[2]];
        this.tiltRad = [...this.tiltBase];
        this.parallaxV = [...this.parallaxBase];

        this.resize();
        this.resizeObs = new ResizeObserver(() => this.resize());
        this.resizeObs.observe(this);
        this._mq = matchMedia("(max-width: 1280px)");
        this._onMq = () => this.resize();
        this._mq.addEventListener("change", this._onMq);

        this._onMouse = (e) => {
            this.mouseX = (e.clientX / innerWidth) * 2 - 1;
            this.mouseY = (e.clientY / innerHeight) * 2 - 1;
        };
        addEventListener("mousemove", this._onMouse);

        this.clock = new THREE.Clock();
        this.animate();
    }

    resize() {
        if (this.disposed || !this.renderer) return;
        const w = this.clientWidth || 1;
        const h = this.clientHeight || 1;
        this.renderer.setSize(w, h, false);
        this.composer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        // On narrow viewports the configured object-offset (meant for the
        // desktop 2-column layout) pushes the shape off-screen. Center it
        // and zoom the camera so targetExtent fills the viewport in both
        // axes (with a small margin).
        const p = this.params;
        // Mobile / tablet treatment: ignore the configured object-offset
        // (meant for desktop side-by-side layout), center the camera, and
        // zoom to fit the shape's bbox.
        const narrow =
            p.position === "background" &&
            (matchMedia("(max-width: 1280px)").matches ||
                getComputedStyle(this).position !== "absolute");
        const baseZ = p.cameraPos[2] || 1;
        if (narrow) {
            const mox = p.mobileObjectOffset[0] || 0;
            const moy = p.mobileObjectOffset[1] || 0;
            this.group.position.set(mox, moy, 0);
            this.basePos.x = 0;
            this.basePos.y = 0;
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            // Disable mouse-driven parallax and tilt — keep the camera locked
            // on origin so the diagram reads like a static figure on mobile.
            this.parallaxV = [0, 0, this.parallaxBase[2]];
            this.tiltRad = [0, 0, this.tiltBase[2]];
            this.tiltCur.set(0, 0);
            const fovRad = (p.fov * Math.PI) / 180;
            const aspect = w / h;
            const t = Math.tan(fovRad / 2);
            const ex = (this.shapeExtent?.x || p.targetExtent) * 1.02;
            const ey = (this.shapeExtent?.y || p.targetExtent) * 1.02;
            const dFitX = ex / (2 * t * aspect);
            const dFitY = ey / (2 * t);
            const d = Math.max(dFitX, dFitY);
            this.basePos.z = d;
            this.camera.position.z = d;
        } else {
            this.group.position.set(
                p.objectOffset[0] || 0,
                p.objectOffset[1] || 0,
                0,
            );
            this.basePos.x = p.cameraPos[0] || 0;
            this.basePos.y = p.cameraPos[1] || 0;
            this.basePos.z = baseZ;
            this.camera.position.z = baseZ;
            this.parallaxV = [...this.parallaxBase];
            this.tiltRad = [...this.tiltBase];
        }

        const ab = adaptBloom(this.bloom, getResScale(w, h));
        this.bloomPass.strength = ab.strength;
        this.bloomPass.radius = ab.radius;

        // Keep text legible across resizes. Match the shapes' on-screen
        // scale: SVG units → world via `shapeScale` (same k shapes use),
        // world → pixels via the perspective camera's on-axis factor at
        // z=0: `pxPerWorld = h / (2·tan(fov/2)·|cam.z|)`.
        if (this.textNodes && this.textNodes.length) {
            const camZ = Math.abs(this.params.cameraPos[2] || 1);
            const fovRad = (this.params.fov * Math.PI) / 180;
            const pxPerWorld = h / (2 * Math.tan(fovRad / 2) * camZ);
            const pxPerSvg = this.shapeScale * pxPerWorld;
            for (const { el, data } of this.textNodes) {
                el.style.fontSize = `${data.fontSizeSvg * pxPerSvg}px`;
            }
        }
    }

    animate() {
        if (this.disposed) return;
        this.rafId = requestAnimationFrame(() => this.animate());
        if (!this.visible) {
            // Keep clock in sync so rotation dt doesn't spike on return.
            this.clock.getDelta();
            return;
        }

        const dt = this.clock.getDelta();
        const t = this.clock.getElapsedTime();

        for (const u of this.uniformsList) u.uTime.value = t;

        this.autoRot.x += this.rotRad[0] * dt;
        this.autoRot.y += this.rotRad[1] * dt;
        this.autoRot.z += this.rotRad[2] * dt;

        // Tilt targets come from the mouse; ease toward them each frame so
        // the motion feels heavy and organic rather than snapping.
        const targetTiltX = this.mouseY * this.tiltRad[1];
        const targetTiltY = this.mouseX * this.tiltRad[0];
        const s = this.tiltRad[2];
        this.tiltCur.x += (targetTiltX - this.tiltCur.x) * s;
        this.tiltCur.y += (targetTiltY - this.tiltCur.y) * s;

        this.group.rotation.x = this.autoRot.x + this.tiltCur.x;
        this.group.rotation.y = this.autoRot.y + this.tiltCur.y;
        this.group.rotation.z = this.autoRot.z;

        const targetX = this.basePos.x - this.mouseX * this.parallaxV[0];
        const targetY = this.basePos.y + this.mouseY * this.parallaxV[1];
        const pSmooth = this.parallaxV[2];
        this.camera.position.x += (targetX - this.camera.position.x) * pSmooth;
        this.camera.position.y += (targetY - this.camera.position.y) * pSmooth;
        this.camera.lookAt(this.baseLook);

        // Project text anchors through the live camera & group matrix so
        // overlays track every frame — parallax, object-offset, rotation.
        if (this.textNodes.length) {
            this.group.updateMatrixWorld();
            const W = this.renderer.domElement.clientWidth;
            const H = this.renderer.domElement.clientHeight;
            const v = SectionGraphic._projVec;
            for (const { el, data, anchorPct } of this.textNodes) {
                v.set(data.worldX, data.worldY, 0);
                v.applyMatrix4(this.group.matrixWorld);
                v.project(this.camera);
                const sx = (v.x * 0.5 + 0.5) * W;
                const sy = (-v.y * 0.5 + 0.5) * H;
                el.style.transform = `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) translate(${anchorPct}%, -82%)`;
            }
        }

        this.composer.render();
    }
}

SectionGraphic._projVec = new THREE.Vector3();

customElements.define("section-graphic", SectionGraphic);
