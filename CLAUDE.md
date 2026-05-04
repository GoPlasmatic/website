# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plasmatic marketing website — a static site with interactive 3D visualizations for the Orion distributed systems platform. Vanilla HTML/CSS/JavaScript authored under `src/`; a minifier script produces the deployable `public/`.

## Development

**Local server** — serve `src/` during development (required for 3D asset loading):
```bash
python -m http.server 8000 --directory src
```
Visit `http://localhost:8000/` or `http://localhost:8000/orion.html`.

**Build minified output** (writes `public/`, git-ignored):
```bash
pip install htmlmin csscompressor   # one-time
npm install                         # one-time (installs terser, svgo)
python tools/build.py
```
The script mirrors `src/` into `public/`, minifying `*.html` / `*.css` / `*.js` / `*.svg` (terser handles JS — mangle + compress, property mangling off so Three.js uniform/attribute string keys stay intact; svgo handles SVG with default preset) and copying everything else verbatim. Serve the build with `python -m http.server 8000 --directory public`.

**Regenerate neural pathway binary** (after editing Blender source):
```bash
python tools/convert_obj.py
```
Requires numpy, open3d. Reads `reference/blender-source/nervous-system.obj`, writes `src/nervous-system.bin`.

## Build Pipeline Conventions

Authored files in `src/` should be readable; the build compresses them. Two source-level conventions exist so the build can reach content that minifiers normally can't touch.

### Tagged-template markers: `html` and `glsl`

Every JS file that embeds HTML or GLSL in a template literal defines a no-op identity tag near the top:

```js
const html = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ""), "");
const glsl = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ""), "");
```

Use these tags on any literal whose body should be minified by the build:

```js
this.innerHTML = html`<nav class="nav">…${links}…</nav>`;
const vertexShader = glsl`attribute float aT; varying float vT; …`;
```

`tools/build.py` scans for `` html`…` `` and `` glsl`…` `` *before* handing the source to terser, and replaces the body with a minified version:
- **`html`** — `${…}` placeholders are stashed, `htmlmin` runs on the scrubbed content, placeholders are restored. Safe for interpolation as long as each `${…}` contains only identifiers/simple calls (nested strings, backticks, or `{`/`}` inside interpolation abort the rewrite for that literal).
- **`glsl`** — strips `//` and `/* */` comments, collapses whitespace around punctuation/operators. Safe for WebGL1 shaders without `#version` / `#define` directives (which is what Three.js `ShaderMaterial` expects).

If you skip the tag, the template content ships verbatim (big strings full of indentation survive to production). Always tag new shaders and new `innerHTML` templates.

### Terser constraints (important for Three.js)

`tools/build.py` runs terser with `--mangle toplevel --compress passes=2,pure_getters,unsafe_arrows --module`. Property mangling is deliberately **off**, because Three.js reads uniform / attribute keys by their exact string name:

- `ShaderMaterial.uniforms.uColor.value` — `uColor` must match the `uniform vec3 uColor;` declaration in GLSL, and `.value` is Three.js's internal contract.
- `geom.setAttribute("aT", …)` — `aT` must match the `attribute float aT;` declaration.
- Three.js APIs (`camera.position`, `.aspect`, `bloomPass.strength`, `.setSize`, …) are all property accesses and must not be renamed.

Guidelines when writing scene code:

1. **Don't wrap tunables in a big `CONFIG` object.** Property names can't be mangled, so `CONFIG.numLines` ships as a readable 9-byte string; `const numLines = 128;` at top level becomes a single letter after terser runs (and is usually inlined at call sites). `home-scene.js` / `orion-scene.js` follow this flat pattern — keep it.
2. **Tight sub-objects are fine when keys are already leaked by Three.js.** `parallax = { x, y, smoothing }` and `bloom = { strength, radius, threshold }` are acceptable because `.x`, `.strength`, etc. appear in the bundle anyway via Three.js call sites.
3. **Don't introduce properties named after GLSL uniform/attribute names on plain JS objects**, because you then can't enable property mangling later without a rename.
4. **`customElements.define("site-nav", …)`** — tag names are string literals, safe.

### Pipeline order

```
src/foo.js  →  rewrite html`…` / glsl`…` bodies  →  terser  →  public/js/foo.js
src/foo.html  →  htmlmin  →  public/foo.html
src/foo.css  →  csscompressor  →  public/foo.css
src/foo.svg  →  svgo  →  public/foo.svg
anything else  →  copied verbatim
```

Top-level `await` is used in `orion-scene.js`, which is why terser runs with `--module`. Any new top-level `await` or `import`/`export` will keep working.

## Architecture

### Pages

- **index.html** — Landing page with scroll-driven 3D logo visualization
- **orion.html** — Full Orion product page (~2300 lines) with neural system 3D visualization (loads `nervous-system.bin`)

Both pages are self-contained: styles and scripts are inline.

### 3D Pipeline

```
Blender (.blend) → Export (.glb / .obj) → convert_obj.py → Binary (.bin) → Three.js rendering
```

- **Three.js v0.170.0** loaded via CDN import maps (ES modules)
- **Post-processing**: GTAO on index.html, UnrealBloomPass on orion.html
- **Custom shaders**: orion.html contains GLSL vertex/fragment shaders for nerve lines, endpoint nodes, and traveling pulses
- `nervous-system.bin` is a compact binary (~11 KB) containing decimated brain mesh (1024 verts, delta-encoded faces) and pre-sampled spine endpoints. Nerve pathway curves are generated on the frontend via natural cubic spline interpolation. See format spec in `tools/convert_obj.py`.
- Never edit `.bin` files directly — always regenerate from source

### orion.html 3D Scene

Scroll-snap sections drive camera position through 8 keyframes. The scene renders:
- Brain wireframe (LineSegments, additive blend, 1024-vert decimated mesh)
- ~650 nerve pathways generated on frontend (cubic spline through waypoints) with per-vertex alpha fade
- Pulsing endpoint nodes (custom shader)
- 200 traveling pulses animating along random pathways

### Key Directories

- `src/` — Authored site (HTML, CSS, JS, assets, binaries) — the dev server's doc root
- `public/` — Minified build output, generated by `tools/build.py`; git-ignored
- `reference/design/` — Mockups, mood boards, and the Figma-exported design-system JSX
- `reference/blender-source/` — Blender projects and raw model exports (not served to users)
- `reference/orion-lp/` — Figma-exported React prototype (not integrated into the main site)
- `tools/` — Python utilities (`build.py` minifier, `convert_obj.py` asset converter)
- `backup/pages/` — Retired HTML pages
- `backup/models/` — Retired 3D models
- `backup/assets/` — Retired brand assets

## Brand Design Tokens

Colors: `#07111A` (deep bg), `#119FCD` (accent blue), `#4CBD97` (accent green)
Fonts: Montserrat (display), DM Sans (body), DM Mono (code) — all via Google Fonts CDN

## External CDN Dependencies

Three.js, Lucide icons, and Google Fonts are all loaded from CDNs. No offline fallback exists.
