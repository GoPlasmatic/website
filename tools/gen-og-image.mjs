// Renders the social-share card reference/og-image.svg -> public/og-image.png
// (1200x630). Social platforms don't render SVG previews, so we ship a PNG.
// Run: node tools/gen-og-image.mjs   (uses the dev-dependency Playwright chromium)

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(resolve(root, "reference/og-image.svg"), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0}</style>` +
        svg,
    { waitUntil: "networkidle" },
);
const el = await page.$("svg");
await el.screenshot({ path: resolve(root, "public/og-image.png") });
await browser.close();
console.log("wrote public/og-image.png");
