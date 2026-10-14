const sharp = require("module").createRequire("C:/Users/Lucky/bluedoor/package.json")("sharp");
const P = "C:/Users/Lucky/bluedoor/public/images/";
const W = 1200, H = 630;
async function archAt(photo,pos,cx,aw,top,withRing){const r=aw/2,ah=H-top,ax=cx-aw/2;const img=await sharp(P+photo).resize(aw,ah,{fit:"cover",position:pos}).toBuffer();const mask=Buffer.from(`<svg width="${aw}" height="${ah}"><path d="M0,${ah} L0,${r} A${r},${r} 0 0 1 ${aw},${r} L${aw},${ah} Z" fill="#fff"/></svg>`);const arched=await sharp(img).composite([{input:mask,blend:"dest-in"}]).png().toBuffer();const c=Math.max(8,aw*0.028);const ring=(rr)=>`M${cx-rr},${H} L${cx-rr},${top+r} A${rr},${rr} 0 0 1 ${cx+rr},${top+r} L${cx+rr},${H}`;const cas=`<path d="${ring(r+c/2)}" fill="none" stroke="#efe9de" stroke-width="${c}"/><path d="${ring(r+c-0.5)}" fill="none" stroke="#5b5346" stroke-opacity=".35" stroke-width="1"/><path d="${ring(r+c*0.6)}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.4"/><path d="${ring(r+0.5)}" fill="none" stroke="#0e1d34" stroke-opacity=".35" stroke-width="1"/>`;return {arched,ax,top,cas,shadow:`<path d="M${ax},${H} L${ax},${top+r} A${r},${r} 0 0 1 ${ax+aw},${top+r} L${ax+aw},${H} Z" fill="#000" opacity=".16" filter="url(#sh)"/>`}}
async function arcade(center,left,right,out){const md=236;const C=await archAt(center[0],center[1],W/2,420,170);const L=await archAt(left[0],left[1],W/2-400,250,318);const R=await archAt(right[0],right[1],W/2+400,250,318);const my=170;
const bg=Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="58%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f7f4ee"/><stop offset="1" stop-color="#ece6db"/></radialGradient><filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#14294a" flood-opacity=".28"/></filter></defs><rect width="${W}" height="${H}" fill="url(#g)"/><line x1="40" y1="${my}" x2="${W/2-md/2-26}" y2="${my}" stroke="#224b82" stroke-opacity=".28" stroke-width="1.5"/><line x1="${W/2+md/2+26}" y1="${my}" x2="${W-40}" y2="${my}" stroke="#224b82" stroke-opacity=".28" stroke-width="1.5"/>${L.shadow}${R.shadow}${C.shadow}</svg>`);
const cas=Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#14294a" flood-opacity=".28"/></filter></defs>${L.cas}${R.cas}${C.cas}<circle cx="${W/2}" cy="${my}" r="${md/2+9}" fill="#fdfcfa" filter="url(#sh)"/></svg>`);
const logo=await sharp(P+"logo.png").resize(md).png().toBuffer();
await sharp(bg).composite([{input:L.arched,left:L.ax,top:L.top},{input:R.arched,left:R.ax,top:R.top},{input:C.arched,left:C.ax,top:C.top},{input:cas,left:0,top:0},{input:logo,left:W/2-md/2,top:my-md/2}]).jpeg({quality:90,mozjpeg:true}).toFile(out)}
async function make(photo, pos, out) {
  // the arch: a doorway rising from the bottom edge, true semicircular head
  const aw = 420, r = aw / 2, top = 170, ax = (W - aw) / 2;
  const archPath = `M${ax},${H} L${ax},${top + r} A${r},${r} 0 0 1 ${ax + aw},${top + r} L${ax + aw},${H} Z`;
  const ah = H - top;
  const img = await sharp(P + photo).resize(aw, ah, { fit: "cover", position: pos }).modulate({ saturation: 1.05 }).toBuffer();
  const mask = Buffer.from(`<svg width="${aw}" height="${ah}"><path d="M0,${ah} L0,${r} A${r},${r} 0 0 1 ${aw},${r} L${aw},${ah} Z" fill="#fff"/></svg>`);
  const arched = await sharp(img).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const c = 12; // casing, one width all the way round
  const ring = (rr) => `M${W / 2 - rr},${H} L${W / 2 - rr},${top + r} A${rr},${rr} 0 0 1 ${W / 2 + rr},${top + r} L${W / 2 + rr},${H}`;
  const md = 236, my = top; // the medallion as keystone, centred on the crown
  const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="58%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f7f4ee"/><stop offset="1" stop-color="#ece6db"/></radialGradient>
      <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#14294a" flood-opacity=".28"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <!-- the doorplate hairline, breaking around the medallion -->
    <line x1="64" y1="${my}" x2="${W / 2 - md / 2 - 26}" y2="${my}" stroke="#224b82" stroke-opacity=".28" stroke-width="1.5"/>
    <line x1="${W / 2 + md / 2 + 26}" y1="${my}" x2="${W - 64}" y2="${my}" stroke="#224b82" stroke-opacity=".28" stroke-width="1.5"/>
    <path d="${archPath}" fill="#000" opacity=".18" filter="url(#sh)"/>
  </svg>`);
  const casing = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <path d="${ring(r + c / 2)}" fill="none" stroke="#efe9de" stroke-width="${c}"/>
    <path d="${ring(r + c - 0.5)}" fill="none" stroke="#5b5346" stroke-opacity=".35" stroke-width="1"/>
    <path d="${ring(r + c * 0.6)}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.4"/>
    <path d="${ring(r + 0.5)}" fill="none" stroke="#0e1d34" stroke-opacity=".35" stroke-width="1"/>
    <circle cx="${W / 2}" cy="${my}" r="${md / 2 + 9}" fill="#fdfcfa" filter="url(#sh)"/>
  </svg>`);
  const logo = await sharp(P + "logo.png").resize(md).png().toBuffer();
  await sharp(bg)
    .composite([
      { input: arched, left: ax, top },
      { input: casing, left: 0, top: 0 },
      { input: logo, left: W / 2 - md / 2, top: my - md / 2 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(out);
}
// Link preview (iMessage, SMS, WhatsApp, social). node scripts/make-og.cjs
(async()=>{await arcade(["estate-palms-hero.jpg","centre"],["door-arched.jpg","centre"],["foyer-arched.jpg","centre"],"C:/Users/Lucky/bluedoor/public/og-bluedoor.jpg");console.log("ok")})();
