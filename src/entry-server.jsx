import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App.jsx";

// Re-exported so the prerender script imports everything it needs from the
// compiled SSR bundle. The package is not "type":"module" (the Playwright suite
// is CommonJS), so Node cannot import src/site-meta.js directly.
export { ROUTES, SITE_URL } from "./site-meta.js";

// Per-page stylesheets. Pages inject these themselves via usePageStyles, but
// that runs in a layout effect and so produces nothing during renderToString —
// the prerendered HTML would paint unstyled until hydration. Inlining the right
// sheet into each stub keeps first paint correct. usePageStyles removes the
// prerendered block as it adds its own, so the rules are never duplicated.
//
// Keep this map in step with the usePageStyles call in each page. A stale entry
// degrades to a flash of unstyled content on first paint, not a broken page.
import homeCss from "./styles/home.css?inline";
import orionCss from "./styles/orion.css?inline";
import aboutCss from "./styles/about.css?inline";
import contactCss from "./styles/contact.css?inline";
import legalCss from "./styles/legal.css?inline";

const ROUTE_CSS = {
    "/": homeCss,
    "/orion": orionCss,
    "/about": aboutCss,
    "/contact": contactCss,
    "/privacy": legalCss,
    "/terms": legalCss,
    "/404": legalCss,
};

// Renders the app for one route as static HTML. The client bundle hydrates over
// it, so this must stay a pure render: every browser-facing hook in src/ runs
// inside an effect and is therefore inert here, which is what keeps the two
// trees identical. If you add a component that reads window/document during
// render, or seeds state from a browser API, it will mismatch on hydration.
export function render(path) {
    return {
        html: renderToString(
            <StaticRouter location={path}>
                <App />
            </StaticRouter>,
        ),
        css: ROUTE_CSS[path] ?? "",
    };
}
