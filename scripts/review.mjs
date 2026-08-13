// Filmstrip review: viewport-sized frames walking down a route, so each screen
// can be judged the way a visitor meets it (seams and hand-offs included).
// Usage: node scripts/review.mjs [route] [outDir] [width] [port]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const ROUTE = process.argv[2] ?? "/";
const OUT = process.argv[3] ?? "review";
const WIDTH = Number(process.argv[4] ?? 1440);
const PORT = process.argv[5] ?? "3440";
const HEIGHT = WIDTH < 500 ? 812 : 900;

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});

const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
// layout truth: every reveal renders in its final state
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}${ROUTE}`, {
  waitUntil: "networkidle0",
  timeout: 60000,
});

const total = await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  return document.body.scrollHeight;
});

const step = Math.round(HEIGHT * 0.92);
const frames = Math.min(Math.ceil(total / step), 26);
for (let i = 0; i < frames; i++) {
  const y = i * step;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await new Promise((r) => setTimeout(r, 420));
  await page.screenshot({ path: join(OUT, `f${String(i).padStart(2, "0")}.png`) });
}

console.log(JSON.stringify({ route: ROUTE, width: WIDTH, pageHeight: total, frames }));
await browser.close();
