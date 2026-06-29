import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ROUTES, SITE_URL } from "./src/site-meta.js";

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

// Bake per-route <head> metadata into static HTML so non-JS crawlers / social
// scrapers — and GitHub Pages, which would otherwise return HTTP 404 for deep
// paths — get the right title/description/OG tags and a 200 for /orion,
// /contact, etc. Each stub still loads the same SPA bundle, so React Router
// renders normally. Route copy is the single source of truth in src/site-meta.js
// (also used by the runtime usePageMeta hook).
function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
// Rewrite the content="" of the <meta> tag identified by idAttr=idVal. [^>]
// spans newlines, so this is tolerant of multi-line / reordered attributes.
function setMeta(html, idAttr, idVal, content) {
  const tagRe = new RegExp(`<meta\\b[^>]*\\b${idAttr}="${idVal}"[^>]*>`, "i");
  return html.replace(tagRe, (tag) =>
    /content="[^"]*"/i.test(tag)
      ? tag.replace(/content="[^"]*"/i, `content="${content}"`)
      : tag.replace(/<meta\b/i, `<meta content="${content}"`),
  );
}
function applyRouteMeta(html, meta) {
  const url = `${SITE_URL}${meta.path}`;
  const t = escAttr(meta.title);
  const d = escAttr(meta.description);
  let h = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  h = setMeta(h, "name", "description", d);
  h = setMeta(h, "property", "og:title", t);
  h = setMeta(h, "property", "og:description", d);
  h = setMeta(h, "property", "og:url", url);
  h = setMeta(h, "name", "twitter:title", t);
  h = setMeta(h, "name", "twitter:description", d);
  h = h.replace(/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${url}$2`);
  return h;
}
function routePrerender() {
  return {
    name: "route-prerender",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      const base = readFileSync(resolve(dist, "index.html"), "utf8");
      for (const meta of Object.values(ROUTES)) {
        const html = applyRouteMeta(base, meta);
        if (meta.path === "/") {
          writeFileSync(resolve(dist, "index.html"), html);
        } else {
          const dir = resolve(dist, meta.path.replace(/^\//, ""));
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, "index.html"), html);
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), routePrerender(), spa404Fallback()],
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
