#!/usr/bin/env node
import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
import path from 'node:path';

const PARTIELS_DIR = path.resolve('src/cours/STATS/Partiels');
const OUTPUT_DIR = PARTIELS_DIR; // write alongside images as .txt

async function ocrImage(worker, filePath) {
  const { data } = await worker.recognize(filePath, 'fra');
  return data.text;
}

async function main() {
  if (!fs.existsSync(PARTIELS_DIR)) {
    console.error('Partiels directory not found:', PARTIELS_DIR);
    process.exit(1);
  }

  const years = fs.readdirSync(PARTIELS_DIR).filter((d) => fs.statSync(path.join(PARTIELS_DIR, d)).isDirectory());
  if (years.length === 0) {
    console.error('No year folders found under', PARTIELS_DIR);
    process.exit(1);
  }

  const worker = await createWorker({ logger: (m) => process.stderr.write(`OCR: ${m.status || ''} ${m.progress ? (m.progress*100).toFixed(0)+'%' : ''}\r`) });
  try {
    await worker.loadLanguage('fra');
    await worker.initialize('fra');
    await worker.setParameters({ tessedit_pageseg_mode: '1' });

    for (const year of years) {
      const yearDir = path.join(PARTIELS_DIR, year);
      const files = fs
        .readdirSync(yearDir)
        .filter((f) => /\.(png|jpg|jpeg|tif|tiff|bmp)$/i.test(f))
        .sort((a, b) => parseInt(a) - parseInt(b));

      if (files.length === 0) continue;

      console.log(`\nProcessing year ${year}: ${files.join(', ')}`);

      for (const f of files) {
        const imgPath = path.join(yearDir, f);
        const base = f.replace(/\.[^.]+$/, '');
        const outPath = path.join(yearDir, `${base}.txt`);
        console.log(`\nOCR ${imgPath} -> ${outPath}`);
        const text = await ocrImage(worker, imgPath);
        fs.writeFileSync(outPath, text, 'utf8');
      }
    }
  } finally {
    await worker.terminate();
    process.stderr.write('\n');
  }

  console.log('\nOCR complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
