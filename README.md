# Plasmatic Website

Marketing website for Plasmatic's Orion platform, featuring interactive 3D visualizations powered by Three.js.

## Pages

- **index.html** — Landing page with a scroll-driven 3D logo
- **product.html** — Orion product page with an animated neural system visualization

## Getting Started

Serve the project root with any static HTTP server (required for 3D asset loading):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework, no build step)
- [Three.js](https://threejs.org/) v0.170.0 for 3D rendering and post-processing
- [Lucide](https://lucide.dev/) for icons
- Google Fonts (Montserrat, DM Sans, DM Mono)

All libraries are loaded from CDNs.

## 3D Asset Pipeline

Source models are authored in Blender (`source/*.blend`). The neural pathway data used on the product page is generated from an OBJ export:

```bash
python tools/convert_obj.py
```

This reads `source/nervous-system.obj` and writes the optimized binary `nervous-system.bin`. Requires numpy, scipy, and matplotlib.

## Project Structure

```
index.html              Landing page
product.html            Orion product page
logo3d.glb              3D logo model (used by index.html)
nervous-system.bin      Neural pathway data (used by product.html)
assets/                 SVG and PNG brand logos
source/                 Blender projects and raw model exports
tools/                  Python utilities for asset conversion
reference/              Design references
```
