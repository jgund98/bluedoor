import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const p = await b.newPage();
const errs = [];
p.on("pageerror", e => errs.push("pageerror: " + e.message));
p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.goto("http://localhost:3700/97", { waitUntil: "networkidle0", timeout: 60000 });
await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
const rep = [];
const snap = async (label) => {
  const r = await p.evaluate(() => {
    const card = document.querySelector("form.f97-card");
    const q = card && card.querySelector("h3");
    const firstControl = card && card.querySelector("button:not([type=submit]), input");
    const cr = card ? card.getBoundingClientRect() : null;
    const qr = q ? q.getBoundingClientRect() : null;
    const fr = firstControl ? firstControl.getBoundingClientRect() : null;
    return {
      question: q ? q.textContent.slice(0, 34) : null,
      cardTop: cr ? Math.round(cr.top) : null,
      questionTop: qr ? Math.round(qr.top) : null,
      firstControlTop: fr ? Math.round(fr.top) : null,
      viewportH: window.innerHeight,
    };
  });
  rep.push({ label, ...r, questionVisible: r.questionTop !== null && r.questionTop >= 0 && r.questionTop < r.viewportH, firstControlVisible: r.firstControlTop !== null && r.firstControlTop >= 0 && r.firstControlTop < r.viewportH });
};
// jump via hero CTA
await p.evaluate(() => document.querySelector("a[href='#start']").click());
await new Promise(r => setTimeout(r, 1000));
await snap("after CTA -> step1");
// pick a trade
await p.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Roofing").click());
await new Promise(r => setTimeout(r, 1000));
await snap("step2");
// no website
await p.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.includes("No, not yet")).click());
await new Promise(r => setTimeout(r, 1000));
await snap("step3");
const tapTargets = await p.evaluate(() => {
  const small = [];
  document.querySelectorAll("form.f97-card button, form.f97-card input, form.f97-card a").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.height < 44) small.push((el.textContent || el.type || el.tagName).trim().slice(0,24) + " h=" + Math.round(r.height));
  });
  return small;
});
console.log(JSON.stringify({ rep, tapTargetsUnder44px: tapTargets, errors: errs }, null, 1));
await b.close();
