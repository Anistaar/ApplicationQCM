import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const institDir = path.join(repoRoot, 'src', 'questions', 'S1', 'INSTIT');
const outFile = path.join(institDir, 'INSTIT_QUESTIONS_COMPLETE_v2.txt');

const QUESTION_PREFIX = /^(QCM|VF|QR|DRAGMATCH|OPENQ|FORMULABUILDER)\b/i;

function readQuestionLines(filePath) {
  // Many legacy question banks were authored in Windows-1252/ANSI.
  // Reading them as UTF-8 can produce mojibake (�). latin1 is compatible
  // for the usual French accented characters.
  const raw = fs.readFileSync(filePath, 'latin1');
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => QUESTION_PREFIX.test(l));
}

/**
 * Sections: we reset themes for each section using @themes: ...
 * so tags don't "bleed" across sections.
 */
const SECTIONS = [
  {
    title: 'CHAPITRE 1 — FMI',
    themes: ['FMI'],
    files: ['FMI_QCM_EXHAUSTIF_v1.txt']
  },
  {
    title: 'CHAPITRE 2 — OMC',
    themes: ['OMC'],
    files: ['OMC_QCM_EXHAUSTIF_v1.txt']
  },
  {
    title: 'CHAPITRE 3 — Banque Mondiale',
    themes: ['BM'],
    files: ['BM_QCM_EXHAUSTIF_v1.txt']
  },
  {
    title: 'CHAPITRE 4 — Théories institutionnelles',
    themes: ['Théorie'],
    files: [
      'BANQUE_QUESTIONS_SUPPLEMENTAIRES_v1.txt',
      'TRAIN_Asymetrie_Signaux_v1.txt',
      'TRAIN_CoutsTransaction_v1.txt',
      'TRAIN_DroitsPropriete_Communs_v1.txt'
    ]
  },
  {
    title: 'CHAPITRE 5 — Gouvernance',
    themes: ['Gouvernance'],
    files: ['TRAIN_Definitions_Gouvernance_v1.txt']
  },
  {
    title: 'CHAPITRE 6 — Statistiques publiques (INSEE/Eurostat/IPC)',
    themes: ['Stats'],
    files: ['TRAIN_Stats_IPC_v1.txt']
  },
  {
    title: 'CHAPITRE 7 — Comptabilité (IFRS/ANC)',
    themes: ['Compta'],
    files: ['TRAIN_Comptabilite_IFRS_v1.txt']
  },
  {
    title: 'TRAIN — Comparatifs (FMI/OMC/BM) & pièges',
    themes: ['FMI', 'OMC', 'BM'],
    files: ['TRAIN_OMC_FMI_BM_v1.txt', 'TRAIN_Pieges_Comparatifs_v1.txt']
  },
  {
    title: 'EXAMENS — Annales',
    themes: ['FMI', 'OMC', 'BM', 'Théorie', 'Gouvernance', 'Stats', 'Compta'],
    files: ['INSTIT_Examen_2023.txt', 'INSTIT_Examen_2024.txt', 'INSTIT_ALL.txt']
  }
];

let total = 0;
const chunks = [];

chunks.push(
  '### BANQUE INSTITUTIONS ÉCONOMIQUES — COMPLETE',
  '### Version 2.0 — Consolidée automatiquement (scripts/build-instit-v2.mjs)',
  `### Générée le ${new Date().toISOString().slice(0, 10)}`,
  '',
  '@themes: Institutions',
  ''
);

for (const section of SECTIONS) {
  const sectionFilesAbs = section.files.map((f) => path.join(institDir, f));
  const missing = sectionFilesAbs.filter((p) => !fs.existsSync(p));
  if (missing.length) {
    throw new Error(`Fichiers manquants pour ${section.title}: ${missing.join(', ')}`);
  }

  chunks.push(
    '### ========================================',
    `### ${section.title}`,
    `### Sources: ${section.files.join(', ')}`,
    `@themes: Institutions, ${section.themes.join(', ')}`,
    ''
  );

  for (const abs of sectionFilesAbs) {
    const lines = readQuestionLines(abs);
    total += lines.length;
    chunks.push(...lines, '');
  }
}

fs.writeFileSync(outFile, chunks.join('\n'), 'utf8');
console.log(`✅ Généré: ${path.relative(repoRoot, outFile)} (${total} questions)`);
