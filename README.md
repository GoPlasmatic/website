# Plasmatic Website

Marketing website for Plasmatic's Orion platform, featuring interactive 3D visualizations powered by Three.js.

## Pages

- **index.html** — Landing page with a scroll-driven 3D logo
- **orion.html** — Orion product page with an animated neural system visualization
- **contact.html**, **privacy.html**, **terms.html** — Supporting pages

## Getting Started

Serve `src/` during development (required for 3D asset loading):

```bash
python -m http.server 8000 --directory src
```

Then open http://localhost:8000.

## Build (Minified Output)

Produce a minified, deployable copy in `public/`:

```bash
pip install htmlmin csscompressor   # one-time
npm install                         # one-time (installs terser, svgo)
python tools/build.py
```

This reads everything under `src/`, minifies `*.html`, `*.css`, `*.js`, `*.svg`, copies other files verbatim, and writes to `public/`. The `public/` directory is git-ignored.

Serve the build output the same way:

```bash
python -m http.server 8000 --directory public
```

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework)
- [Three.js](https://threejs.org/) v0.170.0 for 3D rendering and post-processing
- [Lucide](https://lucide.dev/) for icons
- Google Fonts (Montserrat, DM Sans, DM Mono)

All libraries are loaded from CDNs.

## License

Source-available — see [LICENSE](LICENSE). Published for transparency; all rights reserved by Plasmatic.

## 3D Asset Pipeline

The neural pathway data used on the Orion page is generated from a Blender OBJ export:

```bash
python tools/convert_obj.py
```

This reads `reference/blender-source/nervous-system.obj` and writes the optimized binary (`src/nervous-system.bin`). Requires numpy and open3d.

## Project Structure

```
src/                    Authored site (served in development)
  index.html
  orion.html
  contact.html
  privacy.html
  terms.html
  nervous-system.bin    Neural pathway data (used by orion.html)
  assets/               SVG brand logos and section graphics
  js/                   Page scripts and shared chrome
  styles/               Page-level and shared CSS
public/                 Minified build output (generated; git-ignored)
reference/
  blender-source/       Nervous-system Blender source + OBJ export
  design/               Homepage copy and design-system JSX
  diagrams/             Architecture diagram sources
tools/
  build.py              Minify src/ → public/
  convert_obj.py        Blender OBJ → nervous-system binary
```
