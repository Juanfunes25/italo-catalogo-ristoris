const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const map = require('./image_map.json');
const outDir = path.join(__dirname, '..', 'data', 'images');
const backupDir = path.join(__dirname, '..', 'data', 'images_pdf_backup');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Referer': 'https://www.ristoris.it/'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main() {
  const codes = Object.keys(map);
  const results = [];
  for (const codigo of codes) {
    const url = map[codigo];
    const destPath = path.join(outDir, `${codigo}.jpg`);
    const backupPath = path.join(backupDir, `${codigo}.jpg`);
    try {
      // backup original PDF-crop image if not already backed up
      if (fs.existsSync(destPath) && !fs.existsSync(backupPath)) {
        fs.copyFileSync(destPath, backupPath);
      }
      const buf = await fetchBuffer(url);
      const meta = await sharp(buf).metadata();
      await sharp(buf)
        .flatten({ background: { r: 250, g: 249, b: 246 } }) // light neutral background matching card bg
        .resize({ width: 900, height: 1060, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(destPath);
      results.push({ codigo, url, status: 'ok', width: meta.width, height: meta.height, format: meta.format });
      console.log(`OK   ${codigo}  <- ${url}  (${meta.width}x${meta.height} ${meta.format})`);
    } catch (err) {
      results.push({ codigo, url, status: 'error', error: String(err) });
      console.log(`FAIL ${codigo}  <- ${url}  :: ${err}`);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'fetch_results.json'), JSON.stringify(results, null, 2));
  const ok = results.filter(r => r.status === 'ok').length;
  const fail = results.filter(r => r.status === 'error').length;
  console.log(`\nDone. OK: ${ok}  FAIL: ${fail}`);
}

main();
