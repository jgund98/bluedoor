// Link preview (iMessage, SMS, WhatsApp, social): one good photograph, the
// logo big and centred, nothing else. node scripts/make-og.cjs
const sharp = require("sharp");
const W = 1200, H = 630, MD = 300;
(async () => {
  const photo = await sharp("public/images/estate-palms-hero.jpg")
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92 })
    .toBuffer();
  const ring = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="s" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#0e1d34" flood-opacity=".45"/></filter></defs>
    <circle cx="${W / 2}" cy="${H / 2}" r="${MD / 2 + 8}" fill="#fdfcfa" filter="url(#s)"/>
  </svg>`);
  const logo = await sharp("public/images/logo.png").resize(MD).png().toBuffer();
  await sharp(photo)
    .composite([{ input: ring }, { input: logo, left: W / 2 - MD / 2, top: H / 2 - MD / 2 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/og-bluedoor-2.jpg");
  console.log("ok");
})();
