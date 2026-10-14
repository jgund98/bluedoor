// Verification for the 2026-10-14 feedback pass. Captures each changed
// section at desktop and phone size and reports overflow problems.
//   node scripts/verify-oct14.mjs --out=DIR [--only=name]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").slice(k.length + 3) || d;
const OUT = arg("out", "shots-oct14");
const ONLY = arg("only", "");
const BASE = arg("base", "http://localhost:3451");
mkdirSync(OUT, { recursive: true });

const sizes = [
  { tag: "desk", w: 1440, h: 900, mobile: false },
  { tag: "phone", w: 390, h: 844, mobile: true },
];

// [name, route, find-text, extra scroll offset in viewport heights]
const shots = [
  ["home-whatwedo", "/", "Building, renovating,", -0.15],
  ["home-atelier", "/", "Watercolor studies", -0.1],
  ["culture-mast", "/culture/", "Boutique by design.", -0.25],
  ["culture-spread", "/culture/", "Bluedoor is led by", -0.1],
  ["culture-runs", "/culture/", "Daily on the site,", -0.1],
  ["culture-partners", "/culture/", "We keep close", -0.25],
  ["process-funnel", "/process/", "The builder as the funnel", -0.15],
  ["process-handoff", "/process/", "The hand-off", -0.15],
  ["build-head", "/build-with-bluedoor/", "A select few homes,", -0.2],
  ["build-sign", "/build-with-bluedoor/", "Bluedoor Building", -0.5],
];

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  protocolTimeout: 240000,
  args: ["--hide-scrollbars"],
});
const settle = (ms) => new Promise((r) => setTimeout(r, ms));
for (const s of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1, isMobile: s.mobile, hasTouch: s.mobile });
  let at = "";
  for (const [name, route, text, off] of shots) {
    if (ONLY && !name.includes(ONLY)) continue;
    if (at !== route) {
      await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 120000 });
      await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
      at = route;
    }
    const y = await page.evaluate((t) => {
      const els = [...document.querySelectorAll("h1,h2,h3,p,span,li,a")].filter((e) => e.textContent.trim().startsWith(t) && e.offsetParent);
      const e = els[0];
      return e ? e.getBoundingClientRect().top + scrollY : null;
    }, text);
    if (y == null) { console.log(`${s.tag} ${name}: TEXT NOT FOUND "${text}"`); continue; }
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.max(0, y + off * s.h));
    await settle(1600);
    // let lazy images in view finish
    await page.evaluate(async () => {
      const vis = [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      await Promise.race([Promise.all(vis.map((i) => i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))), new Promise((r) => setTimeout(r, 6000))]);
    });
    await settle(500);
    await page.screenshot({ path: `${OUT}/${s.tag}-${name}.png` });
    console.log(`${s.tag} ${name}: ok`);
  }
  // page-level overflow audit on every route touched
  for (const route of [...new Set(shots.map((x) => x[1])), "/portfolio/"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 120000 });
    const r = await page.evaluate(() => {
      const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
      const clipped = [...document.querySelectorAll("h1,h2,h3,p,span,a,li,label,button")]
        .filter((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible" && e.clientWidth > 0)
        .map((e) => e.textContent.trim().slice(0, 40));
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && b.width > 0 && getComputedStyle(e).position !== "fixed"; }).length;
      return { hscroll: sw > cw, clipped: clipped.slice(0, 5), wideEls: wide };
    });
    console.log(`${s.tag} audit ${route}:`, JSON.stringify(r));
  }
  await page.close();
}
await browser.close();
