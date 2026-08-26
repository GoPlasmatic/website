// Static prerender. Runs after both Vite builds (client -> dist/, SSR ->
// dist-ssr/) and rewrites each route's HTML stub with:
//
//   1. per-route <head> metadata (title, description, canonical, OG/Twitter),
//   2. the route's JSON-LD graph, for crawlers that do not run JS,
//   3. the fully rendered page markup inside #root,
//   4. the route's page stylesheet, so first paint is styled.
//
// (3) is the point of the exercise. The site is a client-rendered SPA, so
// before this every route served `<div id="root"></div>` and nothing else:
// Google had to defer to its render queue, and AI crawlers — which generally do
// not execute JavaScript at all — saw no content whatsoever. The client bundle
// hydrates over this markup, so the runtime behaviour is unchanged.
//
// Cloudflare serves dist/orion/index.html at /orion via
// html_handling:"drop-trailing-slash"; /404.html is written flat because
// not_found_handling:"404-page" looks for it at the root. That setting only
// works because this script emits a stub for every route, so a deep link never
// needs an SPA fallback — a route missing from ROUTES will hard-404.

import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    rmSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

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

function injectHead(html, block) {
    return html.replace(/<\/head>/, `${block}\n    </head>`);
}

function applyRouteMeta(html, meta, rendered) {
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

    // The 404 stub is served with a real 404 status, so this is belt and
    // braces — but it also covers the client-rendered case, where an in-app
    // navigation to a dead link swaps in NotFound without a new response.
    if (meta.noindex) {
        h = injectHead(h, `    <meta name="robots" content="noindex, follow" />`);
    }

    if (meta.jsonLd) {
        // The runtime useJsonLd hook writes the same block with the same
        // data-page-jsonld marker and clears any it finds first, so the
        // rendered document never carries two. Escaping "<" keeps a
        // "</script>" inside a string literal from closing the tag early.
        const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c");
        h = injectHead(
            h,
            `    <script type="application/ld+json" data-page-jsonld>${json}</script>`,
        );
    }

    if (rendered?.css) {
        h = injectHead(
            h,
            `    <style data-page-styles-prerendered>${rendered.css}</style>`,
        );
    }

    if (rendered?.html) {
        h = h.replace(
            /<div id="root">\s*<\/div>/,
            `<div id="root">${rendered.html}</div>`,
        );
    }
    return h;
}

// Vite names the SSR entry .mjs while the root package is CJS-typed (the
// Playwright suite is CommonJS) and .js once it is not, so resolve rather than
// assume — an extension change here would otherwise fail the build with a bare
// ERR_MODULE_NOT_FOUND.
const entry = ["entry-server.mjs", "entry-server.js"]
    .map((f) => resolve(root, "dist-ssr", f))
    .find((f) => existsSync(f));
if (!entry) {
    throw new Error(
        "prerender: no SSR entry in dist-ssr/. Run `vite build --ssr src/entry-server.jsx --outDir dist-ssr` first.",
    );
}

const { render, ROUTES, SITE_URL } = await import(pathToFileURL(entry).href);

const base = readFileSync(resolve(dist, "index.html"), "utf8");
let count = 0;

for (const meta of Object.values(ROUTES)) {
    let rendered;
    try {
        rendered = render(meta.path);
    } catch (err) {
        // A route that cannot render server-side must fail the build rather
        // than silently shipping the old empty shell.
        console.error(`prerender: ${meta.path} failed to render`);
        throw err;
    }
    const html = applyRouteMeta(base, meta, rendered);

    if (meta.path === "/") {
        writeFileSync(resolve(dist, "index.html"), html);
    } else if (meta.path === "/404") {
        writeFileSync(resolve(dist, "404.html"), html);
    } else {
        const dir = resolve(dist, meta.path.replace(/^\//, ""));
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, "index.html"), html);
    }
    count++;
    const kb = (Buffer.byteLength(rendered.html) / 1024).toFixed(1);
    console.log(`prerender  ${meta.path.padEnd(10)} ${kb.padStart(7)} kB markup`);
}

// publicDir is copied into dist/ verbatim, so Finder's .DS_Store ships to
// production alongside robots.txt unless something removes it. Vite has no
// exclusion hook for this, and gitignoring it only keeps it out of the repo.
for (const junk of [".DS_Store", "team/.DS_Store"]) {
    rmSync(resolve(dist, junk), { force: true });
}

console.log(`prerender  ${count} routes written`);
