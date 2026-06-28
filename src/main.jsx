import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Global chrome + design tokens (the :root brand variables, nav/footer,
// reveal animations, scroll-hint). Page-specific CSS is imported by each page.
import "./styles/common.css";

// No <StrictMode>: the hero/orion scenes own a WebGL context imperatively, and
// double-mounting them in dev would churn contexts and slow the sceneReady gate
// the visual tests rely on.
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
