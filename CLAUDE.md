# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plasmatic marketing website — a **Vite + React** single-page app (plain JavaScript, React Router) with interactive Three.js visualizations for the Orion platform. Source lives in `src/`; `vite build` produces the deployable `dist/`.

## Development

```bash
npm install        # one-time
npm run dev        # Vite dev server on http://localhost:8000 (SPA fallback for deep routes)
npm run build      # bundle + minify to dist/ (+ per-route HTML stubs with baked meta)
npm run preview    # serve the production build on http://localhost:8000
```

Routes: `/`, `/orion`, `/about`, `/contact`, `/privacy`, `/terms`.

**Regenerate the neural-pathway binary** (after editing Blender source):
```bash
python tools/convert_obj.py     # requires numpy + open3d
```
Reads `reference/blender-source/nervous-system.obj`, writes into `public/`. The scene fetches `/nervous-system.bin` at runtime. Never edit `.bin` files directly — regenerate from source.

## Build / bundling notes

- **Three.js is bundled from the `three` npm package** (no CDN import map). Addon imports use `three/addons/...`, aliased to `three/examples/jsm` in `vite.config.js`.
- **No property-mangling hazard.** Vite 8 minifies with rolldown/Oxc (it replaced esbuild in the Vite 7→8 change); like esbuild before it, it never renames object properties or string literals, so Three.js's by-name lookups are safe with zero config — `uniforms.uColor.value`, `setAttribute("aT", …)`, and GLSL kept inside template literals all survive. (This is what the old Python `build.py` worked to guarantee; the bundler gives it for free.) The `glsl` identity-tag helper remains in the scene files purely for readable shaders. **If you ever change the minifier or enable mangling, re-verify** by grepping the built bundle for `uColor`/`aT`/`gl_FragColor` — a silent rename breaks the scenes at runtime, not at build time.
- **Bloom is version-compensated — don't "simplify" it away.** three r0.178 rewrote `UnrealBloomPass` in two ways that silently change every scene's look. (1) The composite gained a hard-coded `3.0 *` factor and the separable blur dropped its `diffuseSum / weightSum` normalisation, so identical strength values bloom ~3x hotter — hence `BLOOM_COMPOSITE_GAIN` in `neon-line.js`, divided out in both `adaptBloom()` and `orion-scene.js`'s `adaptedBloom()`. (2) The blend material became `premultipliedAlpha: true` and the composite now emits `alpha = max(bloom.rgb)`, so unlit pixels leave an `alpha: true` canvas fully transparent; previously the pass wrote a near-uniform partial alpha that veiled whatever was behind. `section-graphic.js` therefore clears to **opaque** black for `position="background"` — without it the section's CSS gradient reads through and the glow sits on a lighter base, appearing as a bright bubble bounded by the canvas rect. `home-scene.js` is unaffected (its `.hero` is `#000`) and `orion-scene.js` never set `alpha: true`. **After any three.js bump, re-check both**: capture a section graphic and compare the background luminance far from the geometry against the glow peak.
- **Static files** live in `public/` and are copied to `dist/` root verbatim: `robots.txt`, `sitemap.xml`, `nervous-system.bin`, `favicon.svg`, `og-image.png`.
- **Deployment (Cloudflare Workers):** pushes to `main` trigger Workers Builds (CI), which builds and runs `wrangler deploy` per `wrangler.jsonc` (assets-only Worker, no `main`). `dist/` is served as static assets on `goplasmatic.io` (canonical) and `goplasmatic.ai`. The `.ai → .io` 301 is a **zone-level Redirect Rule** on the goplasmatic.ai zone (dashboard → Rules → "Canonical redirect to goplasmatic.io"), not code — it runs before cache and Workers. The `.ai` custom-domain binding stays in `wrangler.jsonc` because the rule needs `.ai`'s proxied DNS record to exist. **`www.*` canonicalization** works the same way and must be configured in the dashboard, not code: each zone needs a **proxied `www` CNAME → its apex** plus a Redirect Rule 301'ing `www` → the canonical apex (`https://goplasmatic.io`, path + query preserved). Same edge-before-Workers mechanism and same prerequisite as the `.ai` rule — without the proxied `www` record the host NXDOMAINs and no rule can fire (this was the original `www` 404). SPA deep links get a 200 via `not_found_handling: "single-page-application"`; `html_handling: "drop-trailing-slash"` serves the prerendered `dist/orion/index.html` at `/orion`.
- **SEO canonicalization:** all absolute URLs (canonical, OG, JSON-LD, sitemap, robots) point at `https://goplasmatic.io` via `SITE_URL` in `src/site-meta.js`; the `routePrerender` plugin in `vite.config.js` bakes per-route `<head>` metadata into static HTML stubs at build time.

## CSS isolation (important)

`src/styles/common.css` is global (imported once in `main.jsx`): brand tokens (`:root`), nav/footer, reveal animations, scroll-hint. **Per-page CSS (`home.css`, `orion.css`, `contact.css`, `legal.css`) is NOT imported globally** — each page imports it with Vite's `?inline` query and injects it via the `usePageStyles` hook, so it is present only while that page is mounted. This is load-bearing: these stylesheets override shared selectors (`.hero`, `.section-full`, …), and bundling them globally would leak rules across routes (e.g. `home.css` `.hero { background:#000 }` would occlude Orion's fixed neural canvas). When adding a new page, follow the same pattern.

## Architecture

### Routing & chrome

`App.jsx` mounts all routes under a shared `<Layout>` (`SiteNav` + `<Outlet/>` + `ScrollHint` + `SiteFooter`). `Layout` also runs `useSnapReady` (scroll-restoration + scroll-snap priming) and `useReveal` (IntersectionObserver reveal-on-scroll), re-primed per route. `SiteNav`/`SiteFooter` render the literal `<site-nav>` / `<site-footer>` custom-element tags so the existing CSS selectors keep matching. Icons come from `lucide-react`.

### Three.js scenes (`src/three/`, plain JS — no React)

Each engine exports `init(canvas/host, opts) => dispose()`: it owns the renderer, collects event listeners, runs the RAF loop, and the returned `dispose()` cancels the loop, removes listeners, and frees GPU resources. React drives them via the `useScene` hook (owns a `<canvas ref>`, calls `init` in an effect, returns `dispose`).

- `neon-line.js` — shared shader + material/geometry/bloom helpers (used by home + section-graphic).
- `home-scene.js` — hero neon-ribbon scene (`initHomeScene`).
- `orion-scene.js` — neural brain→spine scene (`initOrionScene`): async-loads `nervous-system.bin`, generates ~650 cubic-spline nerve pathways, brain wireframe, pulsing endpoint nodes, 200 traveling pulses, UnrealBloom + MSAA. A scroll-driven camera interpolates **9 keyframes** (one per Orion snap-section) read from the page's `.hero/.section-full/.section-orion/.section-cta/footer.footer` rects.
- `section-graphic.js` — SVG → extruded neon-line background engine (`initSectionGraphic` + `resolveConfig`), surfaced as the `<SectionGraphic>` component (camelCase props map to the old kebab attributes). Lazy-inits on IntersectionObserver; projects an HTML text overlay each frame.

### The migration DOM contract

The React DOM must preserve (the scenes and Playwright depend on these): `document.body.dataset.sceneReady` set on the scene's first frame (and `delete`d on dispose); per-section `class` names + `data-test-section` slugs; `.reveal*` classes; `.nav-toggle` + `body.nav-open`; `html.snap-ready`. Don't let JSX refactors rename a class or drop one of these.

### Interactive Orion widgets (`src/components/orion/`)

`DeploySimulator`, `UseCaseTabs`, `GuardrailsSimulator` — formerly inline `<script>` DOM-mutation handlers, now `useState`-driven components (timers tracked in refs, cleared on unmount). They keep the original CSS class names.

## 3D asset format

`nervous-system.bin` (~11 KB): 30-byte header, quantized spine centers, pre-sampled spine endpoints, delta-encoded brain faces (extracted to edges on load), quantized brain verts (1024). Nerve curves are generated on the frontend via natural cubic-spline interpolation. Full format spec in `tools/convert_obj.py`.

## Brand Design Tokens

Colors: `#07111A` (deep bg), `#119FCD` (accent blue), `#4CBD97` (accent green)
Fonts: Montserrat (display), DM Sans (body), DM Mono (code) — Google Fonts + Adobe Typekit, linked in `index.html`.

## Tests

`npm run screenshots` runs Playwright (`tests/visual/`) against the Vite dev server: per-section / full-page / mobile-nav captures + layout probes across 11 viewports × 5 routes, gated on `sceneReady`. Output (git-ignored) lands in `tests/visual/__screenshots__/`.

Each viewport in `tests/visual/viewports.js` becomes a Playwright **project**, so narrow a run by project (viewport) or by title — there's no per-route project:
```bash
npx playwright test --project=desktop-wide      # one viewport, all routes
npx playwright test -g orion                    # one route, all viewports
npx playwright test --project=mobile-portrait-small -g orion
```
The harness is serial by design (`workers: 1`, `fullyParallel: false`) so captures stay deterministic against the single shared dev server — don't parallelize it.
