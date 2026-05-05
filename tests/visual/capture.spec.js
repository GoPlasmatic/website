// Iterates pages × sections per Playwright project (one project per viewport).
// Outputs PNGs under tests/visual/__screenshots__/<viewport>/<page>/...

const { test } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const { PAGES } = require("./pages");
const { MOBILE_NAV_MAX_WIDTH } = require("./viewports");
const {
    preparePage,
    waitForSceneReady,
    scrollToSection,
    runLayoutProbes,
} = require("./helpers");

const SHOT_ROOT = path.join(__dirname, "__screenshots__");

// Pages that boot a Three.js scene and therefore emit document.body.dataset.sceneReady.
const SCENE_PAGES = new Set(["index", "orion"]);

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function pageDir(viewportName, pageName) {
    const dir = path.join(SHOT_ROOT, viewportName, pageName);
    ensureDir(dir);
    return dir;
}

for (const pg of PAGES) {
    test(`capture ${pg.name}`, async ({ page }, testInfo) => {
        const viewportName = testInfo.project.name;
        const dir = pageDir(viewportName, pg.name);

        await page.goto(pg.path, { waitUntil: "load" });
        await waitForSceneReady(page, SCENE_PAGES.has(pg.name));
        await preparePage(page);
        // Allow any post-prepare layout settle (fonts, lucide icons).
        await page.waitForLoadState("networkidle").catch(() => {});

        const probes = await runLayoutProbes(page);

        if (pg.mode === "snap" && pg.sections) {
            for (let i = 0; i < pg.sections.length; i++) {
                const slug = pg.sections[i];
                await scrollToSection(page, slug);
                const fname = `${String(i).padStart(2, "0")}-${slug}.png`;
                await page.screenshot({
                    path: path.join(dir, fname),
                    fullPage: false,
                });
            }
            // One full-page capture for context.
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.evaluate(
                () =>
                    new Promise((r) =>
                        requestAnimationFrame(() => requestAnimationFrame(r)),
                    ),
            );
            await page.screenshot({
                path: path.join(dir, "_fullpage.png"),
                fullPage: true,
            });
        } else {
            await page.screenshot({
                path: path.join(dir, "_fullpage.png"),
                fullPage: true,
            });
        }

        // Mobile-nav open state — only on viewports where the hamburger is visible.
        const vp = page.viewportSize();
        if (vp && vp.width <= MOBILE_NAV_MAX_WIDTH) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.evaluate(
                () =>
                    new Promise((r) =>
                        requestAnimationFrame(() => requestAnimationFrame(r)),
                    ),
            );
            const toggle = page.locator(".nav-toggle").first();
            if (await toggle.count()) {
                await toggle.click().catch(() => {});
                await page.evaluate(
                    () =>
                        new Promise((r) =>
                            requestAnimationFrame(() => requestAnimationFrame(r)),
                        ),
                );
                await page.screenshot({
                    path: path.join(dir, "_nav-open.png"),
                    fullPage: false,
                });
            }
        }

        // Probes go alongside the screenshots so the user can see flagged issues per viewport.
        const probesPath = path.join(SHOT_ROOT, viewportName, "_probes.json");
        const existing = fs.existsSync(probesPath)
            ? JSON.parse(fs.readFileSync(probesPath, "utf8"))
            : {};
        existing[pg.name] = probes;
        fs.writeFileSync(probesPath, JSON.stringify(existing, null, 2));
    });
}
