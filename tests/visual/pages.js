// Pages and their sections for the screenshot sweep.
//
// `mode: "snap"`  → iterate sections, capture each viewport-only, plus one full-page.
// `mode: "long"`  → single full-page capture, no section iteration.

const PAGES = [
    {
        name: "index",
        path: "/index.html",
        mode: "snap",
        // 8 sections in DOM order; the slugs match data-test-section attributes added in src/index.html.
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
        path: "/orion.html",
        mode: "snap",
        sections: [
            "hero",
            "problem",
            "solution",
            "capabilities",
            "how-it-works",
            "orion",
            "cta",
            "footer",
        ],
    },
    { name: "contact", path: "/contact.html", mode: "long" },
    { name: "privacy", path: "/privacy.html", mode: "long" },
    { name: "terms",   path: "/terms.html",   mode: "long" },
];

module.exports = { PAGES };
