import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Global chrome + design tokens (the :root brand variables, nav/footer,
// reveal animations, scroll-hint). Page-specific CSS is imported by each page.
import "./styles/common.css";

// No <StrictMode>: the hero/orion scenes own a WebGL context imperatively, and
// double-mounting them in dev would churn contexts and slow the sceneReady gate
// the visual tests rely on.
const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Production HTML is prerendered by tools/prerender.mjs, so #root already holds
// the route's markup and must be hydrated rather than replaced. `vite dev`
// serves the bare index.html, where there is nothing to hydrate — hence the
// branch rather than an unconditional hydrateRoot, which would warn and throw
// the whole tree away on every dev load.
const container = document.getElementById("root");
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
