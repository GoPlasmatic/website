import { useEffect, useLayoutEffect } from "react";

// Injects page-specific CSS only while the page is mounted, removing it on
// unmount. The vanilla site loaded one stylesheet per page; the SPA would
// otherwise bundle every page's CSS globally and let rules leak across routes
// (e.g. home.css `.hero { background:#000 }` occluding Orion's fixed canvas).
// Import the stylesheet with Vite's `?inline` query to get its text instead of
// auto-injecting it, then pass it here. useLayoutEffect runs before paint so
// the page never flashes unstyled.
//
// useLayoutEffect does nothing during renderToString and React warns about it,
// so fall back to useEffect on the server. Neither runs there — the prerendered
// stub gets its stylesheet inlined by tools/prerender.mjs instead — this only
// silences the warning.
const useIsomorphicLayoutEffect =
    typeof document === "undefined" ? useEffect : useLayoutEffect;

export function usePageStyles(css) {
    useIsomorphicLayoutEffect(() => {
        // Drop the block tools/prerender.mjs inlined for first paint, so the
        // prerendered rules and these are never both live. Removing it in the
        // same layout effect that adds the replacement keeps it flash-free.
        document
            .querySelectorAll("style[data-page-styles-prerendered]")
            .forEach((el) => el.remove());
        const el = document.createElement("style");
        el.setAttribute("data-page-styles", "");
        el.textContent = css;
        document.head.appendChild(el);
        return () => el.remove();
    }, [css]);
}
