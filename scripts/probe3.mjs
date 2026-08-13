import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
await page.evaluate(() => window.scrollTo({ top: 1300, behavior: "instant" }));
await new Promise((r) => setTimeout(r, 800));
const info = await page.evaluate(() => {
  const hero = document.querySelector("section");
  const sticky = hero.firstElementChild;
  const clipEl = hero.querySelector("[style*='clip-path']");
  const overlay = clipEl?.querySelector("div[style*='opacity']");
  return {
    heroTop: hero.offsetTop,
    heroH: hero.offsetHeight,
    scrollY: window.scrollY,
    stickyRect: JSON.stringify(sticky.getBoundingClientRect()),
    clip: clipEl?.style.clipPath?.slice(0, 90),
    overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
