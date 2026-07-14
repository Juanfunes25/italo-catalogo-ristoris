const fs = require('fs');
const path = require('path');

const PDF_PATH = 'C:/Users/HomePC/Downloads/Ristoris_Catalogo_2024_LQ_PA.pdf';

class NapiCanvasFactory {
  create(width, height) {
    const { createCanvas } = require('@napi-rs/canvas');
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(c, w, h) { c.canvas.width = w; c.canvas.height = h; }
  destroy(c) { c.canvas.width = 0; c.canvas.height = 0; c.canvas = null; c.context = null; }
}

async function main() {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const loadingTask = pdfjsLib.getDocument({ data, isEvalSupported: false, canvasFactory: new NapiCanvasFactory() });
  const pdf = await loadingTask.promise;
  const out = {};
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ');
    out[i] = text;
  }
  fs.writeFileSync(path.join(__dirname, '../data/pdf_text_by_page.json'), JSON.stringify(out, null, 1), 'utf8');
  console.log('Done, pages:', pdf.numPages);
}
main().catch(e => { console.error(e); process.exit(1); });
