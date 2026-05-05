#!/usr/bin/env node
// scripts/import-all-mega.mjs
// Script pour importer tous les fichiers MEGA_COMPLET.txt dans la base de données

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Liste des MEGA files à importer
const MEGA_FILES = [
  {
    path: '../src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt',
    subject: 'MACRO',
    subjectName: 'Macroéconomie'
  },
  {
    path: '../src/questions/S1/INSTIT/INSTIT_MEGA_COMPLET.txt',
    subject: 'INSTIT',
    subjectName: 'Institutions'
  },
  {
    path: '../src/questions/S1/STATS/STATS_MEGA_COMPLET.txt',
    subject: 'STATS',
    subjectName: 'Statistiques'
  },
  {
    path: '../src/questions/S1/RIAE/RIAE_MEGA_COMPLET.txt',
    subject: 'RIAE',
    subjectName: 'Relations Internationales'
  },
  {
    path: '../src/questions/S1/HPE/HPE_MEGA_COMPLET.txt',
    subject: 'HPE',
    subjectName: 'Histoire Pensée Économique'
  },
  {
    path: '../src/questions/S1/DROIT/DROIT_MEGA_COMPLET.txt',
    subject: 'DROIT',
    subjectName: 'Droit'
  },
  {
    path: '../src/questions/S1/ANALYSE_ECO/ANALYSE_ECO_MEGA_COMPLET.txt',
    subject: 'ANALYSE_ECO',
    subjectName: 'Analyse Économique'
  }
];

console.log('🚀 Import automatique des fichiers MEGA\n');

let totalQuestions = 0;

for (const file of MEGA_FILES) {
  try {
    const filePath = join(__dirname, file.path);
    const content = readFileSync(filePath, 'utf-8');
    
    // Compter les questions (ligne commençant par @)
    const questions = content.split('\n').filter(line => line.trim().startsWith('@')).length;
    totalQuestions += questions;
    
    console.log(`✅ ${file.subject.padEnd(12)} | ${questions.toString().padStart(4)} questions | ${file.subjectName}`);
  } catch (error) {
    console.log(`❌ ${file.subject.padEnd(12)} | Erreur: ${error.message}`);
  }
}

console.log(`\n📊 Total: ${totalQuestions} questions dans ${MEGA_FILES.length} matières`);
console.log('\n💡 Pour importer dans l\'application:');
console.log('   1. Ouvrez http://localhost:5175/src/admin/admin-panel.html');
console.log('   2. Utilisez le bouton "Import Quick" pour chaque fichier MEGA');
console.log('   OU utilisez la console navigateur avec le code ci-dessous:\n');

console.log('// Code à copier dans la console navigateur (F12):');
console.log('(async function() {');
console.log('  const files = [');
MEGA_FILES.forEach(file => {
  console.log(`    '../questions/S1/${file.subject}/${file.subject}_MEGA_COMPLET.txt',`);
});
console.log('  ];');
console.log('  for (const file of files) {');
console.log('    const resp = await fetch(file);');
console.log('    const text = await resp.text();');
console.log('    const subject = file.split(\'/\')[3];');
console.log('    await importService.importFromText(text, subject);');
console.log('    console.log(`✅ ${subject} importé`);');
console.log('  }');
console.log('  console.log("✅ Import terminé!");');
console.log('})();');
