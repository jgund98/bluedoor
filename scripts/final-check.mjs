import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2200));
// hero door states
for (const [name, y] of [["closed", 0], ["crack", 220], ["sweep", 700], ["open", 1450], ["hold", 1950]]) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await new Promise((r) => setTimeout(r, 650));
  await page.screenshot({ path: join(OUT, `hd-${name}.png`) });
}
// arch plate states (find the 300vh linen section = DoorReveal)
const archTop = await page.evaluate(() => {
  const secs = [...document.querySelectorAll("section")].filter(s => s.className.includes("h-[300vh]"));
  return secs.length > 1 ? secs[1].offsetTop : (secs[0]?.offsetTop ?? 0);
});
for (const f of [0.1, 0.45, 0.8]) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), archTop + f * (2700 - 900));
  await new Promise((r) => setTimeout(r, 650));
  await page.screenshot({ path: join(OUT, `arch-${Math.round(f*100)}.png`) });
}
// finale video band
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 1600, behavior: "instant" }));
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: join(OUT, `finale.png`) });
// mobile
await page.setViewport({ width: 390, height: 844 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: join(OUT, `m-doors.png`) });
await new Promise((r) => setTimeout(r, 2600));
await page.screenshot({ path: join(OUT, `m-settled.png`) });
await browser.close();
console.log("done", archTop);
