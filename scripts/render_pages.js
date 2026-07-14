// Renders PDF pages to PNG using pdfjs-dist + @napi-rs/canvas
const fs = require('fs');
const path = require('path');

const PDF_PATH = 'C:/Users/HomePC/Downloads/Ristoris_Catalogo_2024_LQ_PA.pdf';
const OUT_DIR = path.join(__dirname, '../scratch_pages');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

class NapiCanvasFactory {
  create(width, height) {
    const { createCanvas } = require('@napi-rs/canvas');
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function main() {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const loadingTask = pdfjsLib.getDocument({ data, isEvalSupported: false, canvasFactory: new NapiCanvasFactory() });
  const pdf = await loadingTask.promise;
  console.log('Num pages:', pdf.numPages);

  const args = process.argv.slice(2);
  let pages;
  if (args.length > 0) {
    pages = args.map(Number);
  } else {
    pages = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  }

  const scale = 2.5;
  for (const pageNum of pages) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvasFactory = new NapiCanvasFactory();
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
    await page.render({ canvasContext: canvasAndContext.context, viewport, canvasFactory }).promise;
    const buf = canvasAndContext.canvas.toBuffer('image/png');
    const outPath = path.join(OUT_DIR, `page_${String(pageNum).padStart(3, '0')}.png`);
    fs.writeFileSync(outPath, buf);
    console.log('Rendered', outPath, viewport.width, viewport.height);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
