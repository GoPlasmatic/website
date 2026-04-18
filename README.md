# Plasmatic Website

Marketing website for Plasmatic's Orion platform, featuring interactive 3D visualizations powered by Three.js.

## Pages

- **index.html** — Landing page with a scroll-driven 3D logo
- **product.html** — Orion product page with an animated neural system visualization

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

## 3D Asset Pipeline

Source models are authored in Blender (`reference/blender-source/*.blend`). The neural pathway data used on the product page is generated from an OBJ export:

```bash
python tools/convert_obj.py
```

This reads `reference/blender-source/nervous-system.obj` and writes the optimized binary into `src/`. Requires numpy and open3d.

## Project Structure

```
src/                    Authored site (served in development)
  index.html
  product.html
  nervous-system.bin    Neural pathway data (used by product.html)
  assets/               SVG and PNG brand logos
  js/                   Page scripts and shared chrome
  styles/               Page-level and shared CSS
public/                 Minified build output (generated; git-ignored)
reference/
  design/               Mockups, mood boards, Figma design-system JSX
  blender-source/       Blender projects and raw model exports
  orion-lp/             Figma-exported React prototype
tools/
  build.py              Minify src/ → public/
  convert_obj.py        Blender OBJ → nervous-system binary
backup/
  pages/                Retired HTML pages
  models/               Retired 3D models
  assets/               Retired brand assets
```
