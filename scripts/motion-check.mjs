// Capture the entrance aperture and the DoorReveal at several live states.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "shots-motion";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// 1 — entrance sequence (fresh session)
await page.goto("http://localhost:3450/", { waitUntil: "domcontentloaded" });
let elapsed = 0;
for (const t of [350, 900, 1500, 2100, 2900]) {
  await new Promise((r) => setTimeout(r, t - elapsed));
  elapsed = t;
  await page.screenshot({ path: join(OUT, `entrance-${t}ms.png`) });
}

// 2 — DoorReveal states: scroll into the sticky section stepwise
const doorTop = await page.evaluate(() => {
  for (const s of document.querySelectorAll("section")) {
    if (s.className.includes("h-[260vh]")) return s.offsetTop;
  }
  return 0;
});
for (const frac of [0.15, 0.35, 0.55, 0.75]) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    doorTop + frac * 2.6 * 900
  );
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: join(OUT, `doors-${Math.round(frac * 100)}.png`) });
}

await browser.close();
console.log("done", doorTop);
