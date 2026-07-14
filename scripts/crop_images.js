const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ficha_map.json'), 'utf8'));
const OUT_DIR = path.join(__dirname, '../data/images');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const PAGES_DIR = path.join(__dirname, '../scratch_pages');

const SCALE = 1.72; // displayed(2000w) -> original(3444w approx, actually 3444/2000=1.722)

async function cropOne(codigo, page, box, direct) {
  const pagePath = path.join(PAGES_DIR, `page_${String(page).padStart(3, '0')}.png`);
  const img = sharp(pagePath);
  const meta = await img.metadata();
  let [x0, y0, x1, y1] = box;
  if (!direct) {
    x0 *= SCALE; y0 *= SCALE; x1 *= SCALE; y1 *= SCALE;
  }
  x0 = Math.max(0, Math.round(x0));
  y0 = Math.max(0, Math.round(y0));
  x1 = Math.min(meta.width, Math.round(x1));
  y1 = Math.min(meta.height, Math.round(y1));
  const w = x1 - x0, h = y1 - y0;
  if (w <= 0 || h <= 0) { console.log('BAD BOX', codigo); return; }
  const outPath = path.join(OUT_DIR, `${codigo}.jpg`);
  await sharp(pagePath).extract({ left: x0, top: y0, width: w, height: h }).jpeg({ quality: 88 }).toFile(outPath);
  console.log('Cropped', codigo, '->', outPath, w, 'x', h);
}

async function main() {
  for (const it of map.items) {
    await cropOne(it.codigo, it.page, it.box, !!it.direct);
  }
  for (const it of map.retail_direct_px) {
    await cropOne(it.codigo, it.page, it.box, true);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
