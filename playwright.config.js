// @ts-check
const { defineConfig } = require("@playwright/test");
const { VIEWPORTS } = require("./tests/visual/viewports");

const projects = VIEWPORTS.map((vp) => ({
    name: vp.name,
    use: {
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        hasTouch: vp.hasTouch ?? false,
        isMobile: vp.isMobile ?? false,
        userAgent: vp.userAgent,
    },
}));

module.exports = defineConfig({
    testDir: "tests/visual",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false, // keep deterministic capture ordering against one dev server
    workers: 1,
    reporter: [["list"]],
    outputDir: "test-results",

    use: {
        baseURL: "http://localhost:8000",
        reducedMotion: "reduce",
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
    },

    webServer: {
        // Vite dev server (port 8000 via vite.config.js); it serves index.html
        // for deep routes (/orion, …) so client-side routing works under test.
        command: "npm run dev",
        url: "http://localhost:8000",
        reuseExistingServer: true,
        timeout: 60_000,
    },

    projects,
});
