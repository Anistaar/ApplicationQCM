import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'src', 'cours');

function walkTxt(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkTxt(full, out);
    else if (e.isFile() && /\.txt$/i.test(e.name)) out.push(full);
  }
  return out;
}

function readFirstLine(p) {
  try {
    const fd = fs.openSync(p, 'r');
    const buf = Buffer.alloc(4096);
    const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    const s = buf.slice(0, bytes).toString('utf8');
    return (s.split(/\r?\n/, 1)[0] || '').trim();
  } catch {
    return '';
  }
}

function detectTypes(content) {
  const hasDM = /\bDragMatch\s*\|\|/i.test(content);
  const hasOthers = /(\bQCM\b|\bVF\b|\bQR\b)\s*\|\|/i.test(content);
  return { onlyDragMatch: hasDM && !hasOthers, hasAny: hasDM || hasOthers };
}

function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_|_$/g, '')
    .replace(/__+/g, '_');
}

function proposeName(absPath) {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, '/');
  const folder = path.dirname(rel);
  const file = path.basename(rel);
  const content = fs.readFileSync(absPath, 'utf8');
  const first = readFirstLine(absPath);
  const m = /^chapter\s*:\s*(.+)$/i.exec(first);
  const { onlyDragMatch } = detectTypes(content);

  const baseSlug = (() => {
    if (m) {
      const parts = m[1].split('>').map(s => s.trim()).filter(Boolean);
      if (parts.length) return slugify(parts.join('_'));
    }
    const noExt = file.replace(/\.txt$/i, '');
    return slugify(noExt);
  })();

  const version = (() => {
    const v = /_v(\d+)\.txt$/i.exec(file);
    return v ? `_v${v[1]}` : '';
  })();

  const typeSuffix = onlyDragMatch ? '_DragMatch' : '';
  const toFile = `${baseSlug}${typeSuffix}${version}.txt`;
  const toAbs = path.join(ROOT, folder, toFile);
  if (path.basename(absPath) === toFile) return null;
  return { to: toAbs, reason: `${rel} → ${path.join(folder, toFile).replace(/\\/g,'/')}` };
}

function main() {
  const apply = process.argv.includes('--apply');
  const files = walkTxt(ROOT);
  const plan = [];
  for (const f of files) {
    const p = proposeName(f);
    if (p) plan.push({ from: f, to: p.to, reason: p.reason });
  }

  if (plan.length === 0) {
    console.log('Aucune proposition de renommage: tous les fichiers semblent déjà normalisés.');
    return;
  }

  console.log(`Propositions (${plan.length}):`);
  for (const p of plan) console.log('- ' + p.reason);

  if (!apply) {
    console.log('\nDry-run. Ajoute --apply pour appliquer.');
    return;
  }

  for (const p of plan) {
    fs.mkdirSync(path.dirname(p.to), { recursive: true });
    fs.renameSync(p.from, p.to);
    console.log('Renommé: ' + p.reason);
  }
  console.log('Terminé. Relance le build pour régénérer la liste des cours.');
}

main();
