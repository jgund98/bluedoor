import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3450/", { waitUntil: "networkidle0" });
const doorTop = await page.evaluate(() => { for (const s of document.querySelectorAll("section")) if (s.className.includes("h-[260vh]")) return s.offsetTop; });
await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), doorTop + 1300);
await new Promise((r) => setTimeout(r, 800));
const info = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img[src="/images/logo.png"]')];
  return imgs.map((img) => {
    const wrap = img.parentElement;
    return {
      cls: img.className.slice(0, 60),
      wrapCls: wrap.className.slice(0, 80),
      wrapStyle: wrap.getAttribute("style"),
      imgOpacity: getComputedStyle(img).opacity,
      wrapOpacity: getComputedStyle(wrap).opacity,
      rect: JSON.stringify(img.getBoundingClientRect()),
      visible: img.getBoundingClientRect().top < 900 && img.getBoundingClientRect().bottom > 0,
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
