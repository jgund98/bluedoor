import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2], WIDTH = Number(process.argv[3]), PORT = process.argv[4], ROUTE = process.argv[5];
const HEIGHT = WIDTH < 500 ? 844 : 900;
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, isMobile: WIDTH < 500, hasTouch: WIDTH < 500 });
const t0 = Date.now();
await page.goto("http://localhost:" + PORT + ROUTE, { waitUntil: "networkidle0", timeout: 60000 });
const loadMs = Date.now() - t0;
const total = await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; return document.body.scrollHeight; });
const step = Math.round(HEIGHT * 0.9);
const frames = Math.min(Math.ceil(total / step), 16);
for (let i = 0; i < frames; i++) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), i * step);
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: join(OUT, "f" + String(i).padStart(2, "0") + ".png") });
}
console.log(JSON.stringify({ loadMs, pageHeight: total, frames, errors }));
await browser.close();
