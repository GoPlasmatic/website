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
    fullyParallel: false, // single python http.server can't handle parallel workers cleanly
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
        command: "python -m http.server 8000 --directory src",
        url: "http://localhost:8000",
        reuseExistingServer: true,
        timeout: 30_000,
    },

    projects,
});
