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
// Public enquiries address, also rendered on the Contact page.
export const CONTACT_EMAIL = "enquiries@goplasmatic.io";
// Registered office, matching the address in the Privacy and Terms contact
// blocks. Rendered on the Contact page and expanded into the PostalAddress
// node below — keep the two in step, and keep the site-wide Organization copy
// in index.html (same @id) carrying the same values.
export const POSTAL_ADDRESS = {
    street: "60 Paya Lebar Road, #06-28",
    building: "Paya Lebar Square",
    locality: "Singapore",
    postalCode: "409051",
    country: "SG",
};

// Stable @id values for the JSON-LD graph. Nodes declared on more than one
// route share an @id so consumers merge them into one entity instead of
// treating each page's copy as a competing claim.
export const ORG_ID = `${SITE_URL}/#organization`;
export const ORION_ID = `${SITE_URL}/orion#software`;

// Questions Orion is actually asked, answered in the page's own voice. These
// feed both the rendered FAQ section on /orion and the FAQPage node below, so
// the visible copy and the structured data can never drift apart — Google
// requires them to match, and an answer engine quoting the markup should be
// quoting what a reader sees.
export const ORION_FAQ = [
    {
        q: "What is a governed services platform?",
        a: "A runtime that carries the parts of a service that are not your business logic: the endpoint, validation, retries, rate limiting, credentials, metrics and versioning. You write the logic as a JSON definition; the platform coordinates, observes and controls how it behaves in production.",
    },
    {
        q: "What is Plasmatic Orion?",
        a: "Orion is Plasmatic's governed services platform for teams building software with AI. A JSON definition becomes a live, governed REST or Kafka service, so a change written in minutes can be reviewed as one document, activated in seconds and reversed with one call.",
    },
    {
        q: "Is Orion open source?",
        a: "Yes. Orion is released under the Apache License 2.0 and developed in the open at github.com/GoPlasmatic. Plasmatic sells delivery, support and enterprise engagements around it, not a licence to the runtime.",
    },
    {
        q: "How is Orion different from Temporal, Kong or Drools?",
        a: "Those tools each carry one layer: Temporal handles durable orchestration, Kong handles the API edge, Drools handles rules evaluation. Orion carries the whole service definition, so the endpoint, the transformation, the decision logic and the operational guarantees live in one governed document rather than three systems you integrate yourself.",
    },
    {
        q: "What kinds of services can Orion run?",
        a: "Microservice APIs, decision APIs expressed as JSONLogic condition trees, Kafka event pipelines, webhook and data ingestion that normalizes payloads from providers such as Stripe, GitHub or Shopify, and tools that AI agents call directly over MCP.",
    },
    {
        q: "How does Orion govern what AI changes?",
        a: "Every change moves through the same gate regardless of who wrote it. The AI proposes a definition, a person approves it, and the runtime enforces the lifecycle: draft, dry-run, then explicit activation, with a trace of every decision and a one-call path back to the previous version.",
    },
    {
        q: "Who builds Orion?",
        a: "Plasmatic Solutions Pte. Ltd., a company registered in Singapore. The team that wrote the runtime is the team that deploys it.",
    },
];

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
        // The product schema belongs on the product page. `offers` is what makes
        // Google treat a SoftwareApplication as eligible rather than skipping
        // it, and price 0 is the honest value: the runtime is Apache-2.0 and
        // the commercial relationship is delivery, not a licence.
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "SoftwareApplication",
                    "@id": ORION_ID,
                    name: "Plasmatic Orion",
                    alternateName: "Orion",
                    applicationCategory: "DeveloperApplication",
                    applicationSubCategory: "Governed services platform",
                    operatingSystem: "Linux, macOS",
                    description:
                        "A governed services platform: a JSON definition becomes a live REST or Kafka service, with validation, retries, rate limiting, metrics, versioning and rollback carried by the runtime rather than written per service.",
                    url: `${SITE_URL}/orion`,
                    codeRepository: `${GITHUB_ORG_URL}/Orion`,
                    license: "https://www.apache.org/licenses/LICENSE-2.0",
                    isAccessibleForFree: true,
                    publisher: { "@id": ORG_ID },
                    author: { "@id": ORG_ID },
                    softwareHelp: DOCS_URL,
                    offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                        availability: "https://schema.org/InStock",
                    },
                },
                {
                    "@type": "FAQPage",
                    "@id": `${SITE_URL}/orion#faq`,
                    mainEntity: ORION_FAQ.map(({ q, a }) => ({
                        "@type": "Question",
                        name: q,
                        acceptedAnswer: { "@type": "Answer", text: a },
                    })),
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": `${SITE_URL}/orion#breadcrumb`,
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "Home",
                            item: `${SITE_URL}/`,
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: "Orion",
                            item: `${SITE_URL}/orion`,
                        },
                    ],
                },
            ],
        },
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
                    "@id": ORG_ID,
                    name: SITE_NAME,
                    legalName: LEGAL_NAME,
                    description:
                        "Plasmatic builds Orion, the governed services platform for teams building software with AI.",
                    url: `${SITE_URL}/`,
                    logo: `${SITE_URL}/favicon.svg`,
                    foundingDate: "2025",
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: `${POSTAL_ADDRESS.street}, ${POSTAL_ADDRESS.building}`,
                        addressLocality: POSTAL_ADDRESS.locality,
                        postalCode: POSTAL_ADDRESS.postalCode,
                        addressCountry: POSTAL_ADDRESS.country,
                    },
                    contactPoint: {
                        "@type": "ContactPoint",
                        email: CONTACT_EMAIL,
                        contactType: "sales",
                        url: `${SITE_URL}/contact`,
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
                    worksFor: { "@id": ORG_ID },
                    sameAs: ["https://www.linkedin.com/in/akmmuthu/"],
                    image: `${SITE_URL}/team/akmmuthu.jpg`,
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/about#harishankar`,
                    name: "Harishankar Narayanan",
                    jobTitle: "Co-founder, Engineering and Technology Strategy",
                    worksFor: { "@id": ORG_ID },
                    sameAs: ["https://www.linkedin.com/in/code42tiger/"],
                    image: `${SITE_URL}/team/harishankar.jpg`,
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/about#vinay`,
                    name: "Vinay Raja",
                    jobTitle: "Co-founder, Product and Experience",
                    worksFor: { "@id": ORG_ID },
                    sameAs: ["https://www.linkedin.com/in/vinayraja/"],
                    image: `${SITE_URL}/team/vinay.jpg`,
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
    // Not a navigable route: the catch-all <Route path="*"> renders it, and
    // tools/prerender.mjs emits it as dist/404.html, which Cloudflare serves
    // with a real 404 status. `noindex` covers the client-rendered case, where
    // an in-app navigation to a dead link swaps in NotFound without a new
    // response. Deliberately absent from sitemap.xml.
    "/404": {
        path: "/404",
        title: "Page not found – Plasmatic",
        description:
            "The address you followed is not a page on this site. Find Orion, the team, or the documentation instead.",
        noindex: true,
    },
};
