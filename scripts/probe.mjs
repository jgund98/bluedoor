// Diagnose: scroll like a human to the Why section, inspect headline spans.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });

// human-ish scroll: wheel events down the page
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 600 });
  await new Promise((r) => setTimeout(r, 120));
}
await new Promise((r) => setTimeout(r, 1500));

const report = await page.evaluate(() => {
  const out = [];
  // the Why headline spans (inside espresso section)
  document.querySelectorAll("h2").forEach((h2) => {
    const spans = h2.querySelectorAll("span > span");
    const first = spans[0];
    if (!first) return;
    const cs = getComputedStyle(first);
    const rect = h2.getBoundingClientRect();
    out.push({
      text: h2.textContent?.slice(0, 40),
      spanTransform: cs.transform,
      inlineStyle: first.getAttribute("style"),
      topInDoc: Math.round(rect.top + window.scrollY),
    });
  });
  return { scrollY: window.scrollY, docH: document.body.scrollHeight, headlines: out };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
