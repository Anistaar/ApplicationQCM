#!/usr/bin/env node
/**
 * Convert all PDFs in a folder to .txt next to them.
 * Usage: node scripts/convert-pdf-to-txt.mjs <folder>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertFile(pdfPath){
  const buf = fs.readFileSync(pdfPath);
  const data = await pdfParse(buf);
  let text = (data.text || '').replace(/\r\n/g, '\n');
  // normalize repeated blank lines
  text = text.split('\n').map(l=>l.replace(/\s+$/,'')).join('\n');
  const base = path.basename(pdfPath).replace(/\.pdf$/i,'');
  const slug = base
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g,'');
  // Deduce a chapter label from filename
  const chapitreMatch = /chap(i)?tre\s*(\d+)/i.exec(base) || /(\d+)/.exec(base);
  const chapIndex = chapitreMatch ? chapitreMatch[2] || chapitreMatch[1] : undefined;
  const titleReadable = base.replace(/[_-]+/g, ' ').trim();
  const header = `chapter: Statistiques > ${titleReadable}`;
  const outName = chapIndex ? `stats_chap${chapIndex}_${slug}.txt` : `stats_${slug}.txt`;
  const outPath = path.join(path.dirname(pdfPath), outName);
  const out = `${header}\n\n${text}\n`;
  fs.writeFileSync(outPath, out, 'utf8');
  return outPath;
}

async function main(){
  const folder = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../src/cours/STATS');
  if(!fs.existsSync(folder)){
    console.error('Folder not found:', folder);
    process.exit(1);
  }
  const files = fs.readdirSync(folder).filter(f=>/\.pdf$/i.test(f));
  if(files.length===0){
    console.log('No PDF files in', folder);
    return;
  }
  console.log('Converting', files.length, 'PDFs...');
  for(const f of files){
    const p = path.join(folder, f);
    try{
      const out = await convertFile(p);
      console.log('OK ->', path.basename(out));
    }catch(err){
      console.error('FAIL', f, err.message);
    }
  }
  console.log('Done.');
}

main().catch(e=>{ console.error(e); process.exit(1); });
