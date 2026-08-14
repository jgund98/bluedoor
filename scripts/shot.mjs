// Verification rig — the Browser pane can't composite here, so we drive a
// real headless Chrome instead.
//
//   node scripts/shot.mjs --route=/ --w=1440 --h=900 --y=0,700,1600 --out=shots
//   node scripts/shot.mjs --route=/culture/ --full            (full-page)
//
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const flag = (k) => process.argv.includes(`--${k}`);

const BASE = arg("base", "http://localhost:3455");
const route = arg("route", "/");
const width = Number(arg("w", 1440));
const height = Number(arg("h", 900));
const out = arg("out", "shots");
const tag = arg("tag", route.replace(/\W+/g, "") || "home");
const full = flag("full");
const still = flag("still"); // freeze reveal animations in their end state
const ys = arg("y", "0")
  .split(",")
  .filter(Boolean)
  .map((n) => Math.round(Number(n)));

mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  protocolTimeout: 240000,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
if (still) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
});
// wait for fonts + every image that is already in the DOM (never hang on it)
await page.evaluate(async () => {
  const cap = (pr, ms) => Promise.race([pr, new Promise((r) => setTimeout(r, ms))]);
  await cap(document.fonts.ready, 8000);
  await cap(
    Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }),
      ),
    ),
    12000,
  );
});
await new Promise((r) => setTimeout(r, 800));

if (full) {
  // walk the page so every in-view reveal has fired
  await page.evaluate(async () => {
    const total = document.body.scrollHeight;
    for (let y = 0; y < total; y += window.innerHeight * 0.5) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  const file = join(out, `${tag}-${width}-full.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(file);
} else {
  for (const y of ys) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await new Promise((r) => setTimeout(r, 900));
    const file = join(out, `${tag}-${width}-y${y}.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
}

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
if (errors.length) console.log("PAGE ERRORS:", errors);

await browser.close();
