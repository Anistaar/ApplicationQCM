#!/usr/bin/env node
/**
 * Classify questions from BANQUE_QUESTIONS_MACRO_v1.txt into chapter files.
 * - Reads src/cours/MACRO/BANQUE_QUESTIONS_MACRO_v1.txt
 * - Detects target chapter by simple keyword heuristics
 * - Ensures each chapter file has a leading `chapter:` header if missing
 * - Appends questions in Text2Quiz format preserving lines
 *
 * Usage:
 *  - Dry-run (default): node scripts/classify-macro-bank.mjs
 *  - Apply:            APPLY=1 node scripts/classify-macro-bank.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const srcDir = path.resolve(root, 'src/cours/MACRO');
const bankPath = path.join(srcDir, 'BANQUE_QUESTIONS_MACRO_v1.txt');

const chapters = [
  {
    slug: 'macro_chap0_intro.txt',
    title: 'Chapitre 0 > Introduction',
    keywords: [
      'INTRODUCTION', 'macroéconomie', 'agrégat', 'statique', 'dynamique', 'modèle',
      'État', 'stabilisation', 'redistribution', 'affectation'
    ]
  },
  {
    slug: 'macro_chap1_consommation.txt',
    title: 'Chapitre 1 > Consommation',
    keywords: [
      'CONSOMMATION', 'Keynes', 'PMC', 'PME', 'cycle de vie', 'Modigliani',
      'revenu permanent', 'Friedman', 'Duesenberry', 'épargne', 'propension'
    ]
  },
  {
    slug: 'macro_chap2_investissement.txt',
    title: 'Chapitre 2 > Investissement',
    keywords: [
      'INVESTISSEMENT', 'accélérateur', 'VAN', 'TRI', 'Tobin', 'efficacité marginale',
      'financement', 'effet de levier', 'q de Tobin', 'autofinancement'
    ]
  },
  {
    slug: 'macro_chap3_modele_classique_reel.txt',
    title: 'Chapitre 3 > Modèle classique (réel)',
    keywords: [
      'CLASSIQUE', 'loi de Say', 'dichotomie', 'marché du travail', 'salaire réel',
      'plein emploi', 'chômage volontaire'
    ]
  },
  {
    slug: 'macro_chap3_theorie_quantitative_monnaie.txt',
    title: 'Chapitre 3bis > Théorie quantitative de la monnaie',
    keywords: [
      'monnaie', 'quantitative', 'MV=PY', 'encaisses réelles', 'Fisher', 'Cambridge'
    ]
  },
  {
    slug: 'macro_chap4_modele_keynesien.txt',
    title: 'Chapitre 4 > Modèle keynésien',
    keywords: [
      'KEYNES', 'keynésien', 'demande effective', 'sous-emploi', 'anticipations',
      'théorie générale'
    ]
  }
];

const APPLY = process.env.APPLY === '1' || process.argv.includes('--apply');

function normalize(s){
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, ' ');
}

function chooseChapter(line){
  const n = normalize(line);
  // Prefer specific QCM lines; skip headers/empty
  if(!n.trim()) return null;
  if(!/qcm\s*\|\|/i.test(line)) return null;
  let best = null;
  for(const ch of chapters){
    let score = 0;
    for(const kw of ch.keywords){
      const kn = normalize(kw);
      if(kn.split(' ').every(tok => n.includes(tok))) score += 1;
    }
    if(score>0 && (!best || score>best.score)) best = { ch, score };
  }
  return best?.ch || null;
}

function ensureHeader(filePath, title){
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if(/^\s*chapter:\s*/i.test(content)) return content;
  const header = `chapter: ${title}\n\n`;
  return header + content;
}

function main(){
  if(!fs.existsSync(bankPath)){
    console.error('Bank file not found:', bankPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(bankPath, 'utf8').split(/\r?\n/);

  const assignments = new Map(chapters.map(c=>[c.slug, []]));
  const skipped = [];

  for(const line of lines){
    const ch = chooseChapter(line);
    if(ch){
      assignments.get(ch.slug).push(line);
    }else{
      // keep headers and blanks unassigned
      if(/qcm\s*\|\|/i.test(line)) skipped.push(line);
    }
  }

  // Summary
  console.log('Classification summary (dry-run by default)');
  for(const ch of chapters){
    const count = assignments.get(ch.slug).length;
    console.log(` - ${ch.slug}: ${count}`);
  }
  console.log(` - skipped (unclassified): ${skipped.length}`);

  if(!APPLY){
    console.log('\nDry-run complete. Set APPLY=1 or use --apply to write changes.');
    return;
  }

  // Apply writes
  for(const ch of chapters){
    const filePath = path.join(srcDir, ch.slug);
    const ensured = ensureHeader(filePath, ch.title);
    if(!fs.existsSync(filePath)){
      fs.writeFileSync(filePath, ensured, 'utf8');
    }else if(ensured !== fs.readFileSync(filePath, 'utf8')){
      fs.writeFileSync(filePath, ensured, 'utf8');
    }
    const qLines = assignments.get(ch.slug);
    if(qLines.length){
      const appendBlock = '\n' + qLines.join('\n') + '\n';
      fs.appendFileSync(filePath, appendBlock, 'utf8');
    }
  }

  if(skipped.length){
    const out = path.join(srcDir, 'macro_unclassified.txt');
    fs.writeFileSync(out, skipped.join('\n') + '\n', 'utf8');
    console.log('Wrote unclassified to', out);
  }

  console.log('Apply complete.');
}

main();
