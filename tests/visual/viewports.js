// Device matrix for screenshot capture.
// Names map 1:1 to playwright project names and screenshot subfolders.
// Breakpoints exercised: 1024 (mobile-nav appears), 768, 640, max-h:600/500 (landscape compact nav).

const VIEWPORTS = [
    { name: "desktop-wide", width: 1920, height: 1080 },
    { name: "desktop", width: 1440, height: 900 },
    { name: "laptop-small", width: 1280, height: 720 }, // exercises max-height: 800 proximity-snap
    { name: "tablet-portrait", width: 820, height: 1180, hasTouch: true, isMobile: false },
    { name: "tablet-landscape", width: 1180, height: 820, hasTouch: true, isMobile: false },
    { name: "ipad-mini-landscape", width: 1024, height: 768, hasTouch: true, isMobile: false },
    { name: "ipad-11-landscape", width: 1194, height: 834, hasTouch: true, isMobile: false },
    { name: "mobile-portrait-large", width: 414, height: 896, hasTouch: true, isMobile: true },
    { name: "mobile-portrait-small", width: 375, height: 667, hasTouch: true, isMobile: true }, // 640 breakpoint
    { name: "mobile-landscape", width: 844, height: 390, hasTouch: true, isMobile: true }, // max-height: 500/600
    { name: "android-landscape-small", width: 720, height: 360, hasTouch: true, isMobile: true },
];

// Width threshold below which the hamburger nav is visible (matches common.css 1024px rule).
const MOBILE_NAV_MAX_WIDTH = 1024;

module.exports = { VIEWPORTS, MOBILE_NAV_MAX_WIDTH };
