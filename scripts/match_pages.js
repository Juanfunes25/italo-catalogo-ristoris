const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/base_products.json'), 'utf8'));
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pdf_text_by_page.json'), 'utf8'));

function norm(s) {
  return s.toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build normalized page texts
const normPages = {};
for (const [num, text] of Object.entries(pages)) {
  normPages[num] = norm(text);
}

// Also search for product code directly (helps RT codes & numeric codes)
const results = [];
for (const p of products) {
  const nameNorm = norm(p.nombre_it);
  const words = nameNorm.split(' ').filter(w => w.length > 2);
  const candidates = [];
  for (const [num, text] of Object.entries(normPages)) {
    let score = 0;
    // full name match
    if (text.includes(nameNorm)) score += 100;
    // code match
    if (text.includes(p.codigo.toUpperCase())) score += 50;
    // word overlap
    let wordHits = 0;
    for (const w of words) {
      if (text.includes(w)) wordHits++;
    }
    score += wordHits * (10 / Math.max(words.length,1)) * 10;
    if (score > 0) candidates.push({ page: Number(num), score, wordHits, totalWords: words.length });
  }
  candidates.sort((a, b) => b.score - a.score);
  results.push({ codigo: p.codigo, nombre_it: p.nombre_it, categoria: p.categoria, top: candidates.slice(0, 5) });
}

fs.writeFileSync(path.join(__dirname, '../data/page_candidates.json'), JSON.stringify(results, null, 1), 'utf8');
console.log('Products with no candidates at all:', results.filter(r => r.top.length === 0).map(r => r.codigo));
console.log('Products with weak top score (<50):', results.filter(r => r.top.length && r.top[0].score < 50).map(r => `${r.codigo} (${r.nombre_it}) best=${r.top[0].score}@p${r.top[0].page}`));
