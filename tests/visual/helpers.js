// Shared helpers for the screenshot harness.

// CSS injected on every page to neutralise CSS-driven motion/transition and
// force reveal-on-scroll elements to their final visible state. Without this,
// the IntersectionObserver in common.js leaves elements invisible whenever
// they're scrolled out of view at capture time.
const FREEZE_CSS = `
*, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
}
.reveal, .reveal-left, .reveal-right, .reveal-blur,
[class*="reveal"] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
}
/* Hide the floating "Scroll to explore" hint — moves between captures, polluting diffs */
#scrollHint, .scroll-hint { display: none !important; }
`;

async function preparePage(page) {
    await page.addStyleTag({ content: FREEZE_CSS });
    await page.evaluate(() => {
        document
            .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-blur")
            .forEach((el) => el.classList.add("visible"));
        // Disable mandatory scroll-snap so programmatic scrollIntoView lands precisely.
        document.documentElement.classList.remove("snap-ready");
    });
}

// Wait for the scene-ready signal set by home-scene.js / orion-scene.js after
// their first composer.render(). Pages without scenes (contact, privacy, terms)
// won't set it, so we time-box the wait and fall back to networkidle.
async function waitForSceneReady(page, hasScene) {
    if (!hasScene) return;
    try {
        await page.waitForFunction(
            () => document.body.dataset.sceneReady === "true",
            null,
            { timeout: 10_000 },
        );
    } catch {
        // Scene didn't signal ready — proceed; the freeze CSS still applies.
    }
}

async function scrollToSection(page, slug) {
    await page.evaluate((s) => {
        const el = document.querySelector(`[data-test-section="${s}"]`);
        if (!el) return;
        el.scrollIntoView({ block: "start", behavior: "instant" });
    }, slug);
    // Two RAF ticks let scroll-driven scenes (orion) update camera + render.
    await page.evaluate(
        () =>
            new Promise((r) =>
                requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
    );
}

// Cheap programmatic layout checks. Returns plain JSON the harness writes to disk.
async function runLayoutProbes(page) {
    return await page.evaluate(() => {
        const probes = {
            viewport: { width: innerWidth, height: innerHeight },
            issues: [],
        };

        // 1. Horizontal overflow on the document.
        if (document.documentElement.scrollWidth > innerWidth + 1) {
            probes.issues.push({
                type: "horizontal-overflow",
                detail: `documentElement.scrollWidth=${document.documentElement.scrollWidth} > innerWidth=${innerWidth}`,
            });
        }

        // 2. Specific elements escaping the right edge.
        const watch = document.querySelectorAll(
            ".btn-primary, .btn-secondary, .nav, .section-container, .card",
        );
        watch.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            if (r.right > innerWidth + 1) {
                probes.issues.push({
                    type: "element-clipped-right",
                    selector: el.tagName.toLowerCase() +
                        (el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""),
                    right: Math.round(r.right),
                    innerWidth,
                });
            }
        });

        // 3. Snap-padding sanity: scroll-padding-top should equal --nav-offset.
        const cs = getComputedStyle(document.documentElement);
        const padTop = cs.scrollPaddingTop;
        const navOffset = cs.getPropertyValue("--nav-offset").trim();
        if (padTop && navOffset && padTop !== navOffset) {
            probes.issues.push({
                type: "scroll-padding-mismatch",
                scrollPaddingTop: padTop,
                navOffset,
            });
        }

        // 4. Zero-height visible headings inside test sections.
        document
            .querySelectorAll("[data-test-section] h1, [data-test-section] h2")
            .forEach((el) => {
                if (
                    el.offsetHeight === 0 &&
                    el.textContent &&
                    el.textContent.trim() !== ""
                ) {
                    probes.issues.push({
                        type: "zero-height-heading",
                        text: el.textContent.trim().slice(0, 80),
                    });
                }
            });

        return probes;
    });
}

module.exports = {
    FREEZE_CSS,
    preparePage,
    waitForSceneReady,
    scrollToSection,
    runLayoutProbes,
};
