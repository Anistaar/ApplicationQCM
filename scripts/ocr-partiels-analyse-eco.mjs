#!/usr/bin/env node
import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
import path from 'node:path';

const PARTIELS_DIR = path.resolve('src/cours/ANALYSE_ECO/Partiels');

async function ocrImage(worker, filePath) {
  const { data } = await worker.recognize(filePath, 'fra');
  return data.text;
}

async function main() {
  if (!fs.existsSync(PARTIELS_DIR)) {
    console.error('Partiels directory not found:', PARTIELS_DIR);
    process.exit(1);
  }
  const years = fs.readdirSync(PARTIELS_DIR).filter(d => fs.statSync(path.join(PARTIELS_DIR,d)).isDirectory());
  if(years.length===0){ console.error('No year folders in', PARTIELS_DIR); process.exit(1); }

  const worker = await createWorker({ logger: m => process.stderr.write(`OCR AECO: ${m.status||''} ${(m.progress? (m.progress*100).toFixed(0)+'%':'')}\r`) });
  try {
    await worker.loadLanguage('fra');
    await worker.initialize('fra');
    // Simpler segmentation for exam sheets
    await worker.setParameters({ tessedit_pageseg_mode: '1' });

    for(const year of years){
      const yearDir = path.join(PARTIELS_DIR, year);
      const imgs = fs.readdirSync(yearDir).filter(f=>/\.(png|jpg|jpeg)$/i.test(f)).sort((a,b)=>parseInt(a)-parseInt(b));
      if(imgs.length===0) continue;
      console.log(`\nYear ${year}: ${imgs.join(', ')}`);
      for(const img of imgs){
        const imgPath = path.join(yearDir,img);
        const outTxt = path.join(yearDir, img.replace(/\.[^.]+$/, '.txt'));
        console.log('OCR', imgPath, '->', outTxt);
        const text = await ocrImage(worker, imgPath);
        fs.writeFileSync(outTxt, text.replace(/\r\n?/g,'\n'), 'utf8');
      }
    }
  } finally {
    await worker.terminate();
    process.stderr.write('\n');
  }
  console.log('\nAnalyse Éco Partiels OCR complete.');
}

main().catch(e=>{ console.error(e); process.exit(1); });
