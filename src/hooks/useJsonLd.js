import { useEffect } from "react";

// Injects a page-scoped JSON-LD block into <head> while the page is mounted,
// and removes it on unmount so an SPA navigation never leaves another route's
// structured data behind.
//
// The route-prerender plugin in vite.config.js bakes the same block (with the
// same data-page-jsonld marker) into the static per-route HTML for crawlers
// that do not run JS. This hook clears any existing marked block before adding
// its own, so a JS-capable crawler still sees exactly one.
//
// The site-wide Organization / WebSite graph stays in index.html and is left
// alone; nodes here reference it by @id.
export function useJsonLd(data) {
    useEffect(() => {
        if (!data) return undefined;
        document.head
            .querySelectorAll("script[data-page-jsonld]")
            .forEach((el) => el.remove());
        const el = document.createElement("script");
        el.type = "application/ld+json";
        el.setAttribute("data-page-jsonld", "");
        el.textContent = JSON.stringify(data);
        document.head.appendChild(el);
        return () => el.remove();
    }, [data]);
}
