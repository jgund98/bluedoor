import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:"new",protocolTimeout:240000});
const p = await b.newPage();
await p.setViewport({width:390,height:844});
await p.goto("http://localhost:3455/",{waitUntil:"load",timeout:120000});
await new Promise(r=>setTimeout(r,3000));
const h = await p.evaluate(()=>({doc:document.body.scrollHeight, secs:[...document.querySelectorAll('main > *')].map(s=>({t:s.tagName,top:Math.round(s.getBoundingClientRect().top+scrollY),h:Math.round(s.getBoundingClientRect().height)}))}));
console.log(JSON.stringify(h));
await b.close();
