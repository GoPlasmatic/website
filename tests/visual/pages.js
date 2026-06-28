// Pages and their sections for the screenshot sweep.
//
// `mode: "snap"`  → iterate sections, capture each viewport-only, plus one full-page.
// `mode: "long"`  → single full-page capture, no section iteration.

const PAGES = [
    {
        name: "index",
        path: "/",
        mode: "snap",
        // 8 sections in DOM order; the slugs match data-test-section attributes in src/pages/Home.jsx.
        sections: [
            "hero",
            "what-we-do",
            "why-this-matters",
            "approach",
            "orion",
            "architectures",
            "cta",
            "footer",
        ],
    },
    {
        name: "orion",
        path: "/orion",
        mode: "snap",
        sections: [
            "hero",
            "problem",
            "solution",
            "decouple",
            "ai-trust",
            "guardrails",
            "orion",
            "cta",
            "footer",
        ],
    },
    { name: "contact", path: "/contact", mode: "long" },
    { name: "privacy", path: "/privacy", mode: "long" },
    { name: "terms",   path: "/terms",   mode: "long" },
];

module.exports = { PAGES };
