import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto("https://www.epicdevsolutions.com/97", { waitUntil: "networkidle0", timeout: 60000 });
await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
const countdown = await p.evaluate(() => {
  const el = [...document.querySelectorAll("p")].find(x => x.textContent.includes("offer ends in"));
  return el ? el.textContent.trim().replace(/\s+/g, " ") : null;
});
await p.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Roofing").click());
await new Promise(r => setTimeout(r, 800));
await p.evaluate(() => [...document.querySelectorAll("button")].find(x => x.textContent.includes("No, not yet")).click());
await new Promise(r => setTimeout(r, 900));
const step3 = await p.evaluate(() => {
  const lbl = [...document.querySelectorAll("label")].find(x => x.textContent.includes("text me"));
  const hint = [...document.querySelectorAll("p")].find(x => x.textContent.includes("How we reach you"));
  const submit = document.querySelector("button[type=submit]");
  return {
    consent: lbl ? lbl.textContent.trim().replace(/\s+/g, " ") : null,
    phoneHint: hint ? hint.textContent.trim().replace(/\s+/g, " ") : null,
    submitType: submit ? submit.type : null,
    isRealForm: !!document.querySelector("form.f97-card"),
  };
});
console.log(JSON.stringify({ countdown, ...step3 }, null, 1));
await b.close();
