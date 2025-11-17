#!/usr/bin/env node
/**
 * Convert all DOCX in a folder to .txt in a target folder, preserving simple slug names.
 * Usage: node scripts/convert-docx-dir.mjs <sourceFolder> <targetFolder>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(s){
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}

async function convertOne(src, dest){
  const { value } = await mammoth.extractRawText({ path: src });
  const text = (value||'').replace(/\r\n?/g,'\n').replace(/\t/g,'    ').trim()+"\n";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text, 'utf8');
}

async function main(){
  const srcDir = path.resolve(process.argv[2] || path.resolve(__dirname, '../src/cours/RIAE/SOURCES'));
  const tgtDir = path.resolve(process.argv[3] || path.resolve(__dirname, '../src/cours/RIAE'));
  if(!fs.existsSync(srcDir)){
    console.error('Source folder not found:', srcDir);
    process.exit(1);
  }
  const files = fs.readdirSync(srcDir).filter(f=>/\.docx$/i.test(f));
  if(files.length===0){ console.log('No DOCX files in', srcDir); return; }
  for(const f of files){
    const base = path.basename(f, path.extname(f));
    const slug = slugify(base)+'.txt';
    const out = path.join(tgtDir, slug);
    try{ await convertOne(path.join(srcDir,f), out); console.log('OK ->', path.basename(out)); }
    catch(e){ console.error('FAIL', f, e.message); }
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
