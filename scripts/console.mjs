// Report console errors/warnings and failed requests for a route.
import puppeteer from "puppeteer-core";

const ROUTE = process.argv[2] ?? "/";
const PORT = process.argv[3] ?? "3440";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
});
const page = await browser.newPage();
const out = [];
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) out.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => out.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => out.push(`[404/failed] ${r.url()}`));
page.on("response", (r) => {
  if (r.status() >= 400) out.push(`[${r.status()}] ${r.url()}`);
});

await page.evaluateOnNewDocument(() => sessionStorage.setItem("bd-entered", "1"));
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`http://localhost:${PORT}${ROUTE}`, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(async () => {
  const total = document.body.scrollHeight;
  for (let y = 0; y < total; y += window.innerHeight) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 200));
  }
});
await new Promise((r) => setTimeout(r, 1000));
console.log(out.length ? out.join("\n") : "clean");
await browser.close();
