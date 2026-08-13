import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
for (const [name, y] of [["rest", 0], ["mid", 500], ["bloom", 900], ["arrived", 1300]]) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: join(OUT, `hero-${name}.png`) });
}
// mobile static variant
await page.setViewport({ width: 390, height: 844 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: join(OUT, `hero-mobile.png`) });
await browser.close();
console.log("done");
