# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plasmatic marketing website — a static site with interactive 3D visualizations for the Orion distributed systems platform. No build system or framework; vanilla HTML/CSS/JavaScript served as-is.

## Development

**Local server** (required for 3D asset loading):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` (index.html) or `http://localhost:8000/product.html`.

**Regenerate neural pathway binary** (after editing Blender source):
```bash
python tools/convert_obj.py
```
Requires numpy, scipy, matplotlib. Reads `source/nervous-system.obj`, writes `nervous-system.bin`.

## Architecture

### Pages

- **index.html** — Landing page with scroll-driven 3D logo visualization (loads `logo3d.glb`)
- **product.html** — Full Orion product page (~2300 lines) with neural system 3D visualization (loads `nervous-system.bin`)

Both pages are self-contained: styles and scripts are inline.

### 3D Pipeline

```
Blender (.blend) → Export (.glb / .obj) → convert_obj.py → Binary (.bin) → Three.js rendering
```

- **Three.js v0.170.0** loaded via CDN import maps (ES modules)
- **Post-processing**: GTAO on index.html, UnrealBloomPass on product.html
- **Custom shaders**: product.html contains GLSL vertex/fragment shaders for nerve lines, endpoint nodes, and traveling pulses
- `nervous-system.bin` uses a custom uint8-quantized binary format (see header struct in `tools/convert_obj.py`)
- Never edit `.bin` files directly — always regenerate from source

### product.html 3D Scene

Scroll-snap sections drive camera position through 8 keyframes. The scene renders:
- Brain wireframe (LineSegments, additive blend)
- ~590 nerve pathways with per-vertex alpha fade
- Pulsing endpoint nodes (custom shader)
- 200 traveling pulses animating along random pathways

### Key Directories

- `assets/` — SVG/PNG brand logos
- `source/` — Blender projects and raw exports (not served to users)
- `tools/` — Python utilities for asset conversion
- `reference/` — Design references and a Figma-exported React prototype (not integrated into the main site)

## Brand Design Tokens

Colors: `#07111A` (deep bg), `#119FCD` (accent blue), `#4CBD97` (accent green)
Fonts: Montserrat (display), DM Sans (body), DM Mono (code) — all via Google Fonts CDN

## External CDN Dependencies

Three.js, Lucide icons, and Google Fonts are all loaded from CDNs. No offline fallback exists.
