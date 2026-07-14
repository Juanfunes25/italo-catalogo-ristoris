const fs = require('fs');
const path = require('path');
const base = require('../data/base_products.json');
const tr = require('./translations.js');
const fichaMap = require('../data/ficha_map.json');
const nombresEs = require('./nombres_es.js');

const imagedCodes = new Set([
  ...fichaMap.items.map(i => i.codigo),
  ...fichaMap.retail_direct_px.map(i => i.codigo),
]);

const out = base.map(p => {
  const t = tr[p.codigo] || {};
  const hasImage = imagedCodes.has(p.codigo);
  const pendiente = p.codigo === '012554';
  return {
    codigo: p.codigo,
    nombre_it: p.nombre_it,
    nombre_es: nombresEs[p.codigo] || null,
    descripcion_it: t.descripcion_it || null,
    descripcion_es: t.descripcion_es || null,
    presentacion: p.presentacion,
    categoria: p.categoria,
    imagen: hasImage ? `data/images/${p.codigo}.jpg` : null,
    precio_ristoris_eur: p.precio_ristoris_eur,
    pendiente_revision: pendiente,
    motivo_pendiente: pendiente ? 'No se encontró ficha del producto (código 012554, Salsa di Salvia e Limone) en el catálogo general Ristoris_Catalogo_2024_LQ_PA.pdf (105 páginas revisadas), ni existe el archivo de ficha técnica dedicada 012554_salsa_salvia_limone.pdf en las fuentes provistas. No se inventó descripción ni imagen.' : null,
  };
});

fs.writeFileSync(path.join(__dirname, '../data/productos.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('Total:', out.length);
console.log('Con imagen:', out.filter(p=>p.imagen).length);
console.log('Con descripcion:', out.filter(p=>p.descripcion_es).length);
console.log('Pendientes:', out.filter(p=>p.pendiente_revision).map(p=>p.codigo));
