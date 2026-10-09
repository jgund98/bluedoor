// Screenshot rig: node scripts/shot.mjs --w=1440 --routes=/today,/approvals --out=shots
// Logs in once with the demo account, then captures each route full-page.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const base = args.base ?? "http://localhost:3485";
const width = Number(args.w ?? 1440);
const height = Number(args.h ?? 900);
const mobile = width < 700;
const routes = (args.routes ?? "/today").split(",");
const out = args.out ?? "shots";
const full = args.full !== "false";
const noLogin = args.login === "false";
mkdirSync(out, { recursive: true });

const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"];
const browser = await puppeteer.launch({ executablePath: chrome.find(Boolean), headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });

if (!noLogin) {
  await page.goto(`${base}/login`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', args.email ?? "jordan@epicdevsolutions.com");
  await page.type('input[name="code"]', args.code ?? process.env.ADMIN_ACCESS_CODE ?? "jordan123");
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }), page.keyboard.press("Enter")]);
}

// --demo=1 expands the route list with the live vendor and homeowner links from /demo.
if (args.demo) {
  await page.goto(`${base}/demo`, { waitUntil: "networkidle0" });
  const links = await page.$$eval('a[href^="/v/"],a[href^="/vendor/"],a[href^="/r/"],a[href^="/home/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  routes.push(...links);
}

// --expand=1 adds the first estate, vendor, visit and service detail pages.
if (args.expand) {
  for (const [list, prefix] of [["/estates", "/estates/"], ["/vendors", "/vendors/"], ["/visits", "/visits/"], ["/services", "/services/"]]) {
    await page.goto(`${base}${list}`, { waitUntil: "networkidle0" });
    const href = await page.$$eval(`a[href^="${prefix}"]`, (as, p) => as.map((a) => a.getAttribute("href")).find((h) => h && h !== p && !h.endsWith("/new")), prefix);
    if (href) routes.push(href);
  }
}

const report = [];
for (const r of routes) {
  const url = r.startsWith("http") ? r : `${base}${r}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((res) => setTimeout(res, 600));
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth > doc.clientWidth + 1;
    const wide = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1 && getComputedStyle(el).position !== "fixed").slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`);
    return { overflow, wide, h: doc.scrollHeight, title: document.title };
  });
  const name = (r.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root") + `_${width}.png`;
  await page.screenshot({ path: path.join(out, name), fullPage: full });
  report.push({ route: r, ...metrics, file: name });
}
console.table(report.map((r) => ({ route: r.route, overflow: r.overflow, height: r.h, wide: r.wide.join(" | ").slice(0, 80) })));
await browser.close();
