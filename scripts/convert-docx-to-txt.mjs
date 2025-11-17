#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const MAP = process.argv.find(a => a.endsWith('.json')) || 'scripts/rename-mapping-macro.json';

async function convertOne(srcDocx, destTxt) {
  if (!fs.existsSync(srcDocx)) {
    return { ok: false, reason: 'missing', src: srcDocx };
  }
  try {
    const { value } = await mammoth.extractRawText({ path: srcDocx });
    fs.mkdirSync(path.dirname(destTxt), { recursive: true });
    // Normalize line endings and trim trailing whitespace
    const text = (value || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').trim() + '\n';
    fs.writeFileSync(destTxt, text, 'utf8');
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || String(e) };
  }
}

async function main() {
  const mapPath = path.resolve(process.cwd(), MAP);
  if (!fs.existsSync(mapPath)) {
    console.error('Mapping file not found:', mapPath);
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  console.log('Converting DOCX -> TXT using mapping', mapPath);
  for (const it of list) {
    const src = path.resolve(process.cwd(), it.originalPath || it.originalFilename);
    const targetDir = path.resolve(process.cwd(), it.targetDir || path.join('src','cours','MACRO'));
    // Ensure .txt extension for destination
    const base = (it.proposedFilename || path.basename(src, path.extname(src)) + '.txt').replace(/\.docx$/i, '.txt');
    const dest = path.join(targetDir, base);
    const res = await convertOne(src, dest);
    if (res.ok) console.log('OK  ', path.relative(process.cwd(), src), '->', path.relative(process.cwd(), dest));
    else console.warn('FAIL', path.relative(process.cwd(), src), '-', res.reason);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
