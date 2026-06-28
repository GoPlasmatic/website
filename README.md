# Plasmatic Website

Marketing website for Plasmatic's Orion platform — a Vite + React single-page app
with interactive Three.js visualizations.

## Pages / Routes

- **`/`** — Landing page with a scroll-driven 3D neon-ribbon hero
- **`/orion`** — Orion product page with an animated neural-system visualization
- **`/contact`**, **`/privacy`**, **`/terms`** — Supporting pages

## Getting Started

```bash
npm install        # one-time
npm run dev        # Vite dev server on http://localhost:8000
```

## Build & Preview

```bash
npm run build      # bundles + minifies to dist/ (also writes 404.html for SPA routing)
npm run preview    # serve the production build on http://localhost:8000
```

`dist/` is git-ignored. The static assets in `public/` (`CNAME`, `robots.txt`,
`nervous-system.bin`, `favicon.svg`) are copied to the root of `dist/` verbatim.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs `npm ci &&
npm run build` and publishes `dist/` to GitHub Pages at the custom domain
`goplasmatic.io` (via `public/CNAME`). Deep links work because the build copies
`index.html` to `404.html`, so GitHub Pages serves the SPA shell for any path
and React Router renders the route client-side.

## Visual Tests

```bash
npm run screenshots       # Playwright sweep across viewports × routes
npm run screenshots:ui    # interactive mode
```

The harness starts the Vite dev server, waits for `document.body.dataset.sceneReady`
on the 3D pages, freezes animations, and captures per-section / full-page / mobile-nav
screenshots plus layout probes under `tests/visual/__screenshots__/` (git-ignored).

## Tech Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) (plain JavaScript, React Router)
- [Three.js](https://threejs.org/) v0.170.0 — bundled (no CDN), with custom GLSL shaders,
  UnrealBloom post-processing, and an SVG-driven neon-line engine. Scenes are plain
  Three.js wrapped in React hooks (`src/three/*` + `useScene`).
- [lucide-react](https://lucide.dev/) for icons
- Google Fonts (Montserrat, DM Sans, DM Mono) + Adobe Fonts (Typekit), loaded in `index.html`

## License

Source-available — see [LICENSE](LICENSE). Published for transparency; all rights reserved by Plasmatic.

## 3D Asset Pipeline

The neural-pathway data on the Orion page is generated from a Blender OBJ export:

```bash
python tools/convert_obj.py     # requires numpy + open3d
```

This reads `reference/blender-source/nervous-system.obj` and writes the optimized
binary into `public/` (the engine fetches `/nervous-system.bin` at runtime). Never
edit the `.bin` directly — regenerate it from source.

## Project Structure

```
index.html              Vite entry (SPA shell: fonts + #root)
vite.config.js          Vite config (react plugin, three/addons alias, 404 SPA fallback)
public/                 Static files copied to dist/ root (CNAME, robots.txt, .bin, favicon)
src/
  main.jsx              createRoot + <BrowserRouter>; imports global common.css
  App.jsx               <Routes> under a shared <Layout>
  pages/                Home, Orion, Contact, Privacy, Terms
  components/           SiteNav, SiteFooter, ScrollHint, SectionGraphic, canvases,
                        ContactForm, orion/ interactive widgets
  three/                Framework-agnostic Three.js engines (init → dispose):
                        neon-line, home-scene, orion-scene, section-graphic
  hooks/                useScene, useReveal, useSnapReady, usePageStyles, usePageTitle
  styles/               common.css (global) + per-page CSS (injected via usePageStyles)
  assets/               SVG brand logos and section graphics (imported as URLs)
reference/
  blender-source/       Nervous-system Blender source + OBJ export
  design/               Homepage copy and design-system JSX
  diagrams/             Architecture diagram sources
tools/
  convert_obj.py        Blender OBJ → public/nervous-system.bin
```
