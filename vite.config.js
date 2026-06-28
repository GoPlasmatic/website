import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

// GitHub Pages serves a 404 page for any path it can't resolve to a file.
// Copying the built index.html to 404.html lets deep links (/orion, /contact)
// boot the SPA so React Router can render the right route client-side.
function spa404Fallback() {
  return {
    name: "spa-404-fallback",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spa404Fallback()],
  resolve: {
    alias: {
      // three 0.170 exports "./addons/*" natively, but pin the mapping so the
      // ported scene imports (three/addons/postprocessing/…) always resolve.
      "three/addons": "three/examples/jsm",
    },
  },
  build: {
    outDir: "dist",
    // Emit imported SVGs as real files (no data-URL inlining) so the
    // <SectionGraphic> engine fetches a URL exactly like the vanilla site.
    assetsInlineLimit: 0,
    // esbuild minify (the default) never mangles property names or string
    // literals, so Three.js's by-name uniform/attribute lookups
    // (uniforms.uColor.value, setAttribute("aT", …)) and GLSL kept in template
    // literals survive untouched — no extra config needed.
  },
  // Match the Playwright baseURL (http://localhost:8000).
  server: { port: 8000, strictPort: true },
  preview: { port: 8000, strictPort: true },
});
