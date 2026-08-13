// Screenshot rig: full-page captures of every route at every breakpoint.
// Usage: node scripts/shots.mjs [outDir] [--entrance]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "shots";
const WITH_ENTRANCE = process.argv.includes("--entrance");
const BASE = "http://localhost:3450";
const ROUTES = [
  ["home", "/"],
  ["portfolio", "/portfolio/"],
  ["process", "/process/"],
  ["culture", "/culture/"],
  ["media", "/media/"],
  ["build", "/build-with-bluedoor/"],
];
const WIDTHS = [
  ["375", 375, 812],
  ["768", 768, 1024],
  ["1440", 1440, 900],
  ["1920", 1920, 1080],
];

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});

const page = await browser.newPage();
if (!WITH_ENTRANCE) {
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem("bd-entered", "1");
  });
  // layout-truth mode: all reveals render in their final state
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
}

for (const [wname, width, height] of WIDTHS) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  for (const [rname, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle0", timeout: 45000 });
    // walk the page so every whileInView animation has fired
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const total = document.body.scrollHeight;
      for (let y = 0; y < total; y += window.innerHeight * 0.6) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 160));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 500));
    });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: join(OUT, `${rname}-${wname}.png`),
      fullPage: true,
    });
    // fold shot (what a visitor actually sees first)
    await page.screenshot({ path: join(OUT, `${rname}-${wname}-fold.png`) });
  }
}

await browser.close();
console.log("done");
