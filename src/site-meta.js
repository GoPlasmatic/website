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
// "What Orion is not for" — the page that names Temporal, Kong and Drools.
export const DOCS_COMPARISON_URL = `${DOCS_URL}/comparison.html`;

// Public GitHub organisation, linked from the nav, the footer and the About
// repository strip.
export const GITHUB_ORG_URL = "https://github.com/GoPlasmatic";

// Registered entity, matching the Privacy and Terms pages (UEN 202602426M).
export const LEGAL_NAME = "Plasmatic Solutions Pte. Ltd.";

export const ROUTES = {
    "/": {
        path: "/",
        title: "Plasmatic – Builders of Orion",
        description:
            "Plasmatic builds Orion, the governed services platform for teams building software with AI, so engineers and AI assistants can build, change and ship faster.",
    },
    "/orion": {
        path: "/orion",
        title: "Orion – Governed Services Platform",
        description:
            "Orion is the governed services platform for teams building software with AI: a JSON definition becomes a live, governed REST or Kafka service. Apache-2.0.",
    },
    "/about": {
        path: "/about",
        title: "About Plasmatic: the team behind Orion",
        description:
            "Plasmatic builds Orion, the governed services platform. Three people, open source under Apache 2.0, and the team that wrote the runtime is the team that deploys it.",
        // Injected into <head> by useJsonLd at runtime and by the
        // route-prerender plugin at build time. The Organization node shares
        // the @id declared in index.html, so the two merge rather than
        // competing; keep `logo` identical in both places.
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": `${SITE_URL}/#organization`,
                    name: SITE_NAME,
                    legalName: LEGAL_NAME,
                    url: `${SITE_URL}/`,
                    logo: `${SITE_URL}/favicon.svg`,
                    foundingDate: "2025",
                    address: {
                        "@type": "PostalAddress",
                        addressCountry: "SG",
                    },
                    // The LinkedIn company URL is deliberately absent until it
                    // is confirmed: sameAs is what resolves Plasmatic as an
                    // entity distinct from the other companies using the name,
                    // so a wrong URL there is worse than an omitted one.
                    sameAs: [GITHUB_ORG_URL],
                    founder: [
                        { "@id": `${SITE_URL}/about#muthu` },
                        { "@id": `${SITE_URL}/about#harishankar` },
                        { "@id": `${SITE_URL}/about#vinay` },
                    ],
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/about#muthu`,
                    name: "AKM Muthaalagan",
                    jobTitle: "Founder and CEO",
                    worksFor: { "@id": `${SITE_URL}/#organization` },
                    sameAs: ["https://www.linkedin.com/in/akmmuthu/"],
                    image: `${SITE_URL}/team/akmmuthu.jpg`,
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/about#harishankar`,
                    name: "Harishankar Narayanan",
                    jobTitle: "Co-founder, Engineering and Technology Strategy",
                    worksFor: { "@id": `${SITE_URL}/#organization` },
                    sameAs: ["https://www.linkedin.com/in/code42tiger/"],
                    image: `${SITE_URL}/team/harishankar.jpg`,
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/about#vinay`,
                    name: "Vinay Raja",
                    jobTitle: "Co-founder, Product and Experience",
                    worksFor: { "@id": `${SITE_URL}/#organization` },
                    sameAs: ["https://www.linkedin.com/in/vinayraja/"],
                    image: `${SITE_URL}/team/vinay.jpg`,
                },
                {
                    "@type": "SoftwareApplication",
                    name: "Plasmatic Orion",
                    applicationCategory: "DeveloperApplication",
                    operatingSystem: "Linux, macOS",
                    codeRepository: `${GITHUB_ORG_URL}/Orion`,
                    license: "https://www.apache.org/licenses/LICENSE-2.0",
                    publisher: { "@id": `${SITE_URL}/#organization` },
                },
            ],
        },
    },
    "/contact": {
        path: "/contact",
        title: "Contact – Plasmatic",
        description:
            "Talk to the Plasmatic team about Orion pilots, enterprise support or partnerships.",
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
