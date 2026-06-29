// Single source of truth for per-route document metadata. Consumed by the
// runtime usePageMeta hook (in-SPA navigation) and the build-time
// route-prerender plugin in vite.config.js (static HTML for non-JS crawlers /
// social scrapers). Keep this the only place route copy lives.

export const SITE_URL = "https://goplasmatic.io";
export const SITE_NAME = "Plasmatic";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export const ROUTES = {
    "/": {
        path: "/",
        title: "Plasmatic – Declarative services runtime",
        description:
            "Plasmatic builds declarative runtimes that decouple, execute, and govern business logic in modern software — change rules instantly, without redeploying.",
    },
    "/orion": {
        path: "/orion",
        title: "Plasmatic – Orion",
        description:
            "Orion is a declarative services runtime: build the platform once, then change business rules instantly — no rebuilds, no redeploys — with governance built in.",
    },
    "/contact": {
        path: "/contact",
        title: "Contact – Plasmatic",
        description:
            "Get in touch with the Plasmatic team about Orion, partnerships, or investment.",
    },
    "/privacy": {
        path: "/privacy",
        title: "Privacy Policy – Plasmatic",
        description:
            "How Plasmatic collects, uses, and protects personal data (Singapore PDPA).",
    },
    "/terms": {
        path: "/terms",
        title: "Terms of Service – Plasmatic",
        description:
            "The terms governing use of the Plasmatic website and services.",
    },
};
