import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// `vite preview` SPA-falls-back every deep route to dist/index.html, so it
// would serve the *home page's* prerendered markup at /orion and React would
// hydrate the Orion tree over it — a mismatch that only exists in preview.
// Cloudflare resolves /orion to dist/orion/index.html
// (html_handling:"drop-trailing-slash") and unknown paths to 404.html, so match
// that here or previewing a production build reports bugs that are not real.
function previewLikeCloudflare() {
  return {
    name: "preview-like-cloudflare",
    configurePreviewServer(server) {
      const dist = resolve(__dirname, "dist");
      server.middlewares.use((req, _res, next) => {
        const path = req.url.split("?")[0];
        if (/\.[a-z0-9]+$/i.test(path)) return next();
        const stub = resolve(dist, `.${path}`, "index.html");
        if (stub.startsWith(dist) && existsSync(stub)) {
          req.url = `${path.replace(/\/$/, "")}/index.html`;
        } else if (existsSync(resolve(dist, "404.html"))) {
          req.url = "/404.html";
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), previewLikeCloudflare()],
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
