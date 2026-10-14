// Link preview (iMessage, SMS, WhatsApp, social): one photograph whose middle
// is a pale facade, so the navy medallion reads on its own, big and centred.
// No ring or border on the logo. node scripts/make-og.cjs
const sharp = require("sharp");
const W = 1200, H = 630, MD = 300;
(async () => {
  const logo = await sharp("public/images/logo.png").resize(MD).png().toBuffer();
  await sharp("public/images/estate-colonial.jpg")
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: logo, left: W / 2 - MD / 2, top: H / 2 - MD / 2 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/og-bluedoor-3.jpg");
  console.log("ok");
})();
