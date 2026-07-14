const fs = require('fs');
const path = require('path');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/excel_raw.json'), 'utf8'));

const products = raw.filter(r => r['Descripción'] !== null && r['Código']).map(r => ({
  codigo: String(r['Código']).trim(),
  nombre_it: String(r['Descripción']).trim(),
  presentacion: r['Presentación'] ? String(r['Presentación']).trim() : null,
  precio_ristoris_eur: typeof r['Precio Unit. (€)'] === 'number' ? r['Precio Unit. (€)'] : null,
  categoria: r['Categoría'] ? String(r['Categoría']).trim() : null,
}));

console.log('Total products:', products.length);
const cats = [...new Set(products.map(p => p.categoria))];
console.log('Categories:', cats.length, cats);

fs.writeFileSync(path.join(__dirname, '../data/base_products.json'), JSON.stringify(products, null, 2), 'utf8');
