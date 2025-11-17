#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ARG_APPLY = process.argv.includes('--apply');
const MAP = process.argv.find(a => a.endsWith('.json')) || 'scripts/rename-mapping-macro.json';

function safeRename(src, dest) {
  if (!fs.existsSync(src)) return { ok: false, reason: 'missing' };
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) {
    const dir = path.dirname(dest);
    const base = path.basename(dest, path.extname(dest));
    const ext = path.extname(dest);
    let i = 2;
    let candidate = path.join(dir, `${base}_${i}${ext}`);
    while (fs.existsSync(candidate)) i++, candidate = path.join(dir, `${base}_${i}${ext}`);
    dest = candidate;
  }
  if (ARG_APPLY) fs.renameSync(src, dest);
  return { ok: true, dest };
}

function main() {
  const mapPath = path.resolve(process.cwd(), MAP);
  if (!fs.existsSync(mapPath)) {
    console.error('Mapping file not found:', mapPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(mapPath, 'utf8');
  const list = JSON.parse(raw);
  console.log(`${ARG_APPLY ? 'Applying' : 'Dry-run'} rename mapping from ${mapPath}`);
  for (const it of list) {
    const src = path.resolve(process.cwd(), it.originalPath || it.originalFilename);
    const origExt = path.extname(src) || '';
    // Use proposed filename base but keep original extension
    const proposedBase = it.proposedFilename.replace(/\.txt$/i, '');
    // If proposedFilename contains a path, respect it, else put in same folder as src
    const targetRel = it.targetDir || path.join('src', 'cours', 'MACRO');
    const dest = path.resolve(process.cwd(), targetRel, path.basename(proposedBase) + origExt);

    const res = safeRename(src, dest);
    if (res.ok) console.log(`${it.originalFilename} -> ${path.relative(process.cwd(), res.dest)}`);
    else console.log(`${it.originalFilename} SKIPPED (${res.reason})`);
  }
  console.log('Done.');
}

main();
