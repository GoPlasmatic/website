import { useEffect } from "react";
import { SITE_URL, SITE_NAME, DEFAULT_IMAGE } from "../site-meta.js";

// Per-route document metadata: title, description, canonical, and Open Graph /
// Twitter tags (replaces usePageTitle). The build-time route-prerender plugin
// bakes the same values into static per-route HTML for non-JS crawlers; this
// keeps them in sync as the SPA navigates. Route copy lives in src/site-meta.js.

function upsertMeta(attr, key, content) {
    if (content == null) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function upsertLink(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

export function usePageMeta({
    title,
    description,
    path = "/",
    image = DEFAULT_IMAGE,
    type = "website",
}) {
    useEffect(() => {
        const url = `${SITE_URL}${path}`;
        if (title) document.title = title;
        upsertMeta("name", "description", description);
        upsertLink("canonical", url);

        upsertMeta("property", "og:title", title);
        upsertMeta("property", "og:description", description);
        upsertMeta("property", "og:url", url);
        upsertMeta("property", "og:type", type);
        upsertMeta("property", "og:image", image);
        upsertMeta("property", "og:site_name", SITE_NAME);

        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:title", title);
        upsertMeta("name", "twitter:description", description);
        upsertMeta("name", "twitter:image", image);
    }, [title, description, path, image, type]);
}
