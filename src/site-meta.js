// Single source of truth for per-route document metadata. Consumed by the
// runtime usePageMeta hook (in-SPA navigation) and the build-time
// route-prerender plugin in vite.config.js (static HTML for non-JS crawlers /
// social scrapers). Keep this the only place route copy lives.

export const SITE_URL = "https://goplasmatic.io";
export const SITE_NAME = "Plasmatic";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

// Documentation site, linked from nav/footer and page CTAs across routes.
export const DOCS_URL = "https://docs.goplasmatic.io";
export const DOCS_INSTALL_URL = `${DOCS_URL}/getting-started/install.html`;

export const ROUTES = {
    "/": {
        path: "/",
        title: "Plasmatic – Builders of Orion",
        description:
            "Plasmatic builds Orion, the open-source declarative runtime where engineers and their AI assistants ship business logic, with guardrails, versioning, and one-call rollback enforced by the runtime.",
    },
    "/orion": {
        path: "/orion",
        title: "Orion – Declarative Services Runtime",
        description:
            "Orion turns a JSON definition into a live, governed REST or Kafka service. Safe enough to let an AI write your services; fast enough to run them in production. Open source, Apache-2.0.",
    },
    "/contact": {
        path: "/contact",
        title: "Contact – Plasmatic",
        description:
            "Talk to the Plasmatic team about Orion pilots, enterprise support, or partnerships.",
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
