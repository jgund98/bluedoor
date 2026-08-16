import puppeteer from "puppeteer-core";
const PORT = "3700";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const out = [];
for (const [name, w, h] of [["desktop",1440,900],["mobile",390,844]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 });
  await page.goto("http://localhost:" + PORT + "/97", { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  // click the hero CTA
  await page.evaluate(() => document.querySelector("a[href='#start']").click());
  await new Promise(r => setTimeout(r, 1200));
  const res = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h2")].find(e => e.textContent.includes("Let's see what yours"));
    const r = h.getBoundingClientRect();
    return { headingTopFromViewport: Math.round(r.top), scrollY: Math.round(window.scrollY) };
  });
  out.push({ view: name, ...res });
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
