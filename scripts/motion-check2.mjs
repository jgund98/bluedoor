import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2] ?? "shots-motion2";
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
// find sticky sections
const tops = await page.evaluate(() => {
  const out = {};
  for (const s of document.querySelectorAll("section")) {
    if (s.className.includes("h-[320vh]")) out.doors = { top: s.offsetTop, h: s.offsetHeight };
    if (s.getAttribute("style")?.includes("260vh")) out.reels = { top: s.offsetTop, h: s.offsetHeight };
  }
  return out;
});
const states = [];
if (tops.doors) for (const f of [0.3, 0.6, 0.85]) states.push(["doors", tops.doors.top + f * (tops.doors.h - 900), f]);
if (tops.reels) for (const f of [0.2, 0.5, 0.9]) states.push(["reels", tops.reels.top + f * (tops.reels.h - 900), f]);
for (const [name, y, f] of states) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: join(OUT, `${name}-${Math.round(f * 100)}.png`) });
}
console.log("done", JSON.stringify(tops));
await browser.close();
