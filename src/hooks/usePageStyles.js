import { useLayoutEffect } from "react";

// Injects page-specific CSS only while the page is mounted, removing it on
// unmount. The vanilla site loaded one stylesheet per page; the SPA would
// otherwise bundle every page's CSS globally and let rules leak across routes
// (e.g. home.css `.hero { background:#000 }` occluding Orion's fixed canvas).
// Import the stylesheet with Vite's `?inline` query to get its text instead of
// auto-injecting it, then pass it here. useLayoutEffect runs before paint so
// the page never flashes unstyled.
export function usePageStyles(css) {
    useLayoutEffect(() => {
        const el = document.createElement("style");
        el.setAttribute("data-page-styles", "");
        el.textContent = css;
        document.head.appendChild(el);
        return () => el.remove();
    }, [css]);
}
