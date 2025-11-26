/**
 * Audit ciblé d'une matière spécifique
 * Usage: node scripts/audit-matiere.mjs ANALYSE_ECO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const matiere = process.argv[2];
if (!matiere) {
  console.error('Usage: node scripts/audit-matiere.mjs <MATIERE>');
  process.exit(1);
}

const MATIERE_PATH = path.join(__dirname, '..', 'src', 'questions', 'S1', matiere);

if (!fs.existsSync(MATIERE_PATH)) {
  console.error(`❌ Dossier non trouvé: ${MATIERE_PATH}`);
  process.exit(1);
}

// Patterns de détection de VRAIS problèmes
const CRITICAL_PATTERNS = {
  // Questions non terminées ou mal formées
  phrasesIncompletes: [
    /\|\|.*\|\|.*\|\|\s*$/,  // Colonnes vides
    /\|\|\s*\|\|/,           // Double || sans contenu
    /^\s*\|\|/,              // Commence par ||
  ],
  
  // Questions illisibles (AUTORISE symboles math: Σ Δ ± × ÷ ≥ ≤ → ↑ ↓ € ≈ ⇒)
  caracteresEtranges: [
    /\?{3,}/,                // Multiple ???
    /\.{4,}/,                // Multiple ....
    /_{3,}/,                 // Multiple ___
    /[\x00-\x08\x0B\x0C\x0E-\x1F]/,  // Caractères de contrôle corrompus
  ],
  
  // Calculs suspects (exclure décimales: 0,5×5=2,5 ne doit pas matcher "5×5=2")
  calculsFaux: [
    /(?<![,.])\d+\s*[+\-×÷]\s*\d+\s*=\s*\d+(?![,.])/,  // Lookbehind/lookahead pour éviter décimales
  ],
  
  // Questions sans sens
  phrasesCassees: [
    /\b[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}/,  // MOTS TOUT EN MAJUSCULES
    /\s{5,}/,                                 // Espaces multiples
    /\([^)]{100,}/,                          // Parenthèses jamais fermées
  ],
  
  // Ponctuation bizarre
  ponctuationDouble: [
    /[?.!,;:]{2,}/,
    /\s+[?.!,;:]/,  // Espace avant ponctuation
  ],
};

const results = {
  totalFiles: 0,
  totalQuestions: 0,
  byType: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0, FormulaBuilder: 0 },
  byChapter: {},
  issues: {
    phrasesIncompletes: [],
    caracteresEtranges: [],
    calculsFaux: [],
    phrasesCassees: [],
    ponctuationDouble: [],
    formatsInvalides: [],
    sansExplication: [],
  },
  files: [],
};

/**
 * Analyser tous les fichiers
 */
function analyzeMatiere() {
  const files = fs.readdirSync(MATIERE_PATH)
    .filter(f => f.endsWith('.txt') && f !== 'README.md')
    .sort();

  for (const file of files) {
    const filePath = path.join(MATIERE_PATH, file);
    analyzeFile(filePath, file);
  }
}

/**
 * Analyser un fichier
 */
function analyzeFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  results.totalFiles++;
  
  const fileStats = {
    name: fileName,
    questions: 0,
    types: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0, FormulaBuilder: 0 },
    chapter: null,
    issues: {
      phrasesIncompletes: 0,
      caracteresEtranges: 0,
      calculsFaux: 0,
      phrasesCassees: 0,
      ponctuationDouble: 0,
      formatsInvalides: 0,
      sansExplication: 0,
    },
  };

  let lineNum = 0;
  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    
    // Détecter chapitre
    const chapterMatch = trimmed.match(/^chapter\s*:\s*(.+)$/i);
    if (chapterMatch) {
      fileStats.chapter = chapterMatch[1];
      continue;
    }

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(QCM|QR|VF|DragMatch|OpenQ|FormulaBuilder)\s*\|\|/);
    if (!match) continue;

    const type = match[1];
    results.totalQuestions++;
    results.byType[type]++;
    fileStats.questions++;
    fileStats.types[type]++;

    const parts = trimmed.split('||').map(p => p.trim());
    const question = parts[1] || '';
    const fullLine = trimmed;

    // Validation format
    const expectedCols = { QCM: 4, QR: 4, VF: 3, DragMatch: 3, OpenQ: 5, FormulaBuilder: 5 };
    if (parts.length < expectedCols[type]) {
      results.issues.formatsInvalides.push({
        file: fileName,
        line: lineNum,
        type,
        expected: expectedCols[type],
        actual: parts.length,
      });
      fileStats.issues.formatsInvalides++;
    }

    // Vérifier si c'est une PHRASE (commence par majuscule, se termine par ponctuation)
    if (type === 'QCM' || type === 'QR' || type === 'VF') {
      const startsWithCapital = /^[A-ZÀ-Ÿ]/.test(question);
      const endsWithPunctuation = /[.?!:]$/.test(question);
      if (!startsWithCapital || !endsWithPunctuation) {
        results.issues.phrasesCassees.push({
          file: fileName,
          line: lineNum,
          type,
          issue: !startsWithCapital ? 'Pas de majuscule' : 'Pas de ponctuation',
          question: question.substring(0, 80),
        });
        fileStats.issues.phrasesCassees++;
      }
    }

    // Détecter problèmes critiques
    for (const [issueType, patterns] of Object.entries(CRITICAL_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(fullLine) || pattern.test(question)) {
          // Vérifier si c'est un vrai calcul faux
          if (issueType === 'calculsFaux') {
            const calcMatch = fullLine.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
            if (calcMatch) {
              const [, a, op, b, result] = calcMatch.map((v, i) => i === 2 ? v : parseInt(v));
              let expected = 0;
              if (op === '+') expected = a + b;
              else if (op === '−' || op === '-') expected = a - b;
              else if (op === '×' || op === '*') expected = a * b;
              else if (op === '÷' || op === '/') expected = Math.floor(a / b);
              
              // Vérifier contexte: ignorer si c'est une partie d'un calcul plus long
              const calcText = calcMatch[0];
              const beforeCalc = fullLine.substring(0, calcMatch.index);
              const afterCalc = fullLine.substring(calcMatch.index + calcText.length);
              const hasCalcBefore = /\d+\s*[+\-×÷]\s*$/.test(beforeCalc);
              const hasCalcAfter = /^\s*[+\-×÷]\s*\d+/.test(afterCalc);
              
              // Signaler seulement si calcul isolé ET faux
              if (expected !== result && !hasCalcBefore && !hasCalcAfter) {
                results.issues[issueType].push({
                  file: fileName,
                  line: lineNum,
                  type,
                  calcul: calcMatch[0],
                  attendu: expected,
                  trouve: result,
                  question: question.substring(0, 80),
                });
                fileStats.issues[issueType]++;
              }
            }
          } else {
            results.issues[issueType].push({
              file: fileName,
              line: lineNum,
              type,
              match: fullLine.match(pattern)?.[0] || 'détecté',
              question: question.substring(0, 80),
            });
            fileStats.issues[issueType]++;
          }
          break;
        }
      }
    }
  }

  // Grouper par chapitre
  const chapter = fileStats.chapter || 'Sans chapitre';
  if (!results.byChapter[chapter]) {
    results.byChapter[chapter] = {
      files: 0,
      questions: 0,
      types: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0 },
      issues: 0,
    };
  }
  results.byChapter[chapter].files++;
  results.byChapter[chapter].questions += fileStats.questions;
  for (const [t, count] of Object.entries(fileStats.types)) {
    results.byChapter[chapter].types[t] += count;
  }
  const totalIssues = Object.values(fileStats.issues).reduce((a, b) => a + b, 0);
  results.byChapter[chapter].issues += totalIssues;

  results.files.push(fileStats);
}

/**
 * Générer rapport
 */
function generateReport() {
  let md = `# 📊 AUDIT MATIÈRE : ${matiere}\n\n`;
  md += `**Date** : ${new Date().toLocaleString('fr-FR')}\n`;
  md += `**Dossier** : \`src/questions/S1/${matiere}/\`\n\n`;
  md += `---\n\n`;

  // Résumé global
  md += `## 📈 RÉSUMÉ GLOBAL\n\n`;
  md += `| Métrique | Valeur |\n`;
  md += `|----------|--------|\n`;
  md += `| **Fichiers** | ${results.totalFiles} |\n`;
  md += `| **Questions totales** | ${results.totalQuestions} |\n`;
  
  const totalIssues = Object.values(results.issues).reduce((sum, arr) => sum + arr.length, 0);
  const issuesPct = ((totalIssues / results.totalQuestions) * 100).toFixed(1);
  md += `| **Problèmes détectés** | ${totalIssues} (${issuesPct}%) |\n\n`;

  // Répartition par type
  md += `### Types de questions\n\n`;
  md += `| Type | Nombre | % |\n`;
  md += `|------|--------|---|\n`;
  for (const [type, count] of Object.entries(results.byType).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / results.totalQuestions) * 100).toFixed(1);
    md += `| **${type}** | ${count} | ${pct}% |\n`;
  }
  md += `\n`;

  // Par chapitre
  md += `## 📚 PAR CHAPITRE\n\n`;
  md += `| Chapitre | Fichiers | Questions | QCM | QR | VF | DragMatch | OpenQ | Problèmes |\n`;
  md += `|----------|----------|-----------|-----|----|----|-----------|-------|----------|\n`;
  for (const [chapter, stats] of Object.entries(results.byChapter).sort((a, b) => b[1].questions - a[1].questions)) {
    md += `| **${chapter}** | ${stats.files} | ${stats.questions} | ${stats.types.QCM} | ${stats.types.QR} | ${stats.types.VF} | ${stats.types.DragMatch} | ${stats.types.OpenQ} | ${stats.issues} |\n`;
  }
  md += `\n`;

  // Problèmes détaillés
  md += `## 🔴 PROBLÈMES CRITIQUES\n\n`;

  // Phrases incomplètes
  if (results.issues.phrasesIncompletes.length > 0) {
    md += `### 🔴 Phrases incomplètes (${results.issues.phrasesIncompletes.length})\n\n`;
    md += `| Fichier | Ligne | Type | Problème | Question |\n`;
    md += `|---------|-------|------|----------|----------|\n`;
    for (const issue of results.issues.phrasesIncompletes.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.match} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.phrasesIncompletes.length > 20) {
      md += `\n*... et ${results.issues.phrasesIncompletes.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Calculs faux
  if (results.issues.calculsFaux.length > 0) {
    md += `### 🔴 Calculs FAUX (${results.issues.calculsFaux.length})\n\n`;
    md += `| Fichier | Ligne | Type | Calcul | Attendu | Trouvé | Question |\n`;
    md += `|---------|-------|------|--------|---------|--------|----------|\n`;
    for (const issue of results.issues.calculsFaux.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | \`${issue.calcul}\` | **${issue.attendu}** | ❌ ${issue.trouve} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.calculsFaux.length > 20) {
      md += `\n*... et ${results.issues.calculsFaux.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Caractères étranges
  if (results.issues.caracteresEtranges.length > 0) {
    md += `### 🔴 Caractères étranges (${results.issues.caracteresEtranges.length})\n\n`;
    md += `| Fichier | Ligne | Type | Caractères | Question |\n`;
    md += `|---------|-------|------|------------|----------|\n`;
    for (const issue of results.issues.caracteresEtranges.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | \`${issue.match}\` | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.caracteresEtranges.length > 20) {
      md += `\n*... et ${results.issues.caracteresEtranges.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Phrases cassées
  if (results.issues.phrasesCassees.length > 0) {
    md += `### 🟠 Phrases cassées (${results.issues.phrasesCassees.length})\n\n`;
    md += `| Fichier | Ligne | Type | Problème | Question |\n`;
    md += `|---------|-------|------|----------|----------|\n`;
    for (const issue of results.issues.phrasesCassees.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.issue || issue.match} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.phrasesCassees.length > 20) {
      md += `\n*... et ${results.issues.phrasesCassees.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Ponctuation double
  if (results.issues.ponctuationDouble.length > 0) {
    md += `### 🟡 Ponctuation double (${results.issues.ponctuationDouble.length})\n\n`;
    md += `| Fichier | Ligne | Type | Problème | Question |\n`;
    md += `|---------|-------|------|----------|----------|\n`;
    for (const issue of results.issues.ponctuationDouble.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.match} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.ponctuationDouble.length > 20) {
      md += `\n*... et ${results.issues.ponctuationDouble.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Formats invalides
  if (results.issues.formatsInvalides.length > 0) {
    md += `### Formats invalides (${results.issues.formatsInvalides.length})\n\n`;
    md += `| Fichier | Ligne | Type | Attendu | Réel |\n`;
    md += `|---------|-------|------|---------|------|\n`;
    for (const issue of results.issues.formatsInvalides.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.expected} cols | ${issue.actual} cols |\n`;
    }
    if (results.issues.formatsInvalides.length > 20) {
      md += `\n*... et ${results.issues.formatsInvalides.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Sans explication
  if (results.issues.sansExplication.length > 0) {
    md += `### Sans explication (${results.issues.sansExplication.length})\n\n`;
    md += `| Fichier | Ligne | Type | Question |\n`;
    md += `|---------|-------|------|----------|\n`;
    for (const issue of results.issues.sansExplication.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.sansExplication.length > 20) {
      md += `\n*... et ${results.issues.sansExplication.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Détail par fichier
  md += `## 📁 DÉTAIL PAR FICHIER\n\n`;
  md += `| Fichier | Questions | QCM | QR | VF | DragMatch | OpenQ | Problèmes |\n`;
  md += `|---------|-----------|-----|----|----|-----------|-------|----------|\n`;
  for (const file of results.files.sort((a, b) => b.questions - a.questions)) {
    const totalIssues = Object.values(file.issues).reduce((a, b) => a + b, 0);
    const icon = totalIssues > 5 ? '🔴' : totalIssues > 0 ? '🟡' : '✅';
    md += `| ${icon} \`${file.name}\` | ${file.questions} | ${file.types.QCM} | ${file.types.QR} | ${file.types.VF} | ${file.types.DragMatch} | ${file.types.OpenQ} | ${totalIssues} |\n`;
  }
  md += `\n`;

  // Recommandations
  md += `## 💡 RECOMMANDATIONS\n\n`;
  
  const criticalCount = results.issues.phrasesIncompletes.length + results.issues.calculsFaux.length + results.issues.caracteresEtranges.length;
  
  if (criticalCount > 0) {
    md += `### 🔴 URGENCE : ${criticalCount} problèmes CRITIQUES à corriger immédiatement\n\n`;
  }

  if (results.issues.calculsFaux.length > 0) {
    md += `#### 🔴 Priorité MAXIMALE : ${results.issues.calculsFaux.length} calculs FAUX\n`;
    md += `- **Impact** : Les étudiants apprennent des informations FAUSSES\n`;
    md += `- **Action** : Vérifier et corriger TOUS les calculs\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.calculsFaux.length / 5)}h\n\n`;
  }

  if (results.issues.phrasesIncompletes.length > 0) {
    md += `#### 🔴 Priorité CRITIQUE : ${results.issues.phrasesIncompletes.length} phrases incomplètes\n`;
    md += `- **Impact** : Questions impossibles à lire ou comprendre\n`;
    md += `- **Action** : Compléter les colonnes manquantes, réécrire si nécessaire\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.phrasesIncompletes.length / 10)}h\n\n`;
  }

  if (results.issues.caracteresEtranges.length > 0) {
    md += `#### 🔴 Priorité CRITIQUE : ${results.issues.caracteresEtranges.length} caractères corrompus\n`;
    md += `- **Impact** : Texte illisible ou bizarre\n`;
    md += `- **Action** : Remplacer par caractères corrects\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.caracteresEtranges.length / 15)}h\n\n`;
  }

  if (results.issues.phrasesCassees.length > 0) {
    md += `### 🟠 Priorité HAUTE : ${results.issues.phrasesCassees.length} phrases mal formatées\n`;
    md += `- **Action** : Normaliser majuscules, espaces et ponctuation\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.phrasesCassees.length / 20)}h\n\n`;
  }

  if (results.issues.formatsInvalides.length > 0) {
    md += `### 🟡 Priorité MOYENNE : ${results.issues.formatsInvalides.length} formats invalides\n`;
    md += `- **Action** : Ajouter colonnes manquantes\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.formatsInvalides.length / 20)}h\n\n`;
  }

  if (results.issues.ponctuationDouble.length > 0) {
    md += `### 🟢 Priorité BASSE : ${results.issues.ponctuationDouble.length} problèmes de ponctuation\n`;
    md += `- **Action** : Nettoyer ponctuation en double\n`;
    md += `- **Temps estimé** : ~${Math.ceil(results.issues.ponctuationDouble.length / 30)}h\n\n`;
  }

  // Score qualité
  const qualityScore = Math.max(0, 100 - (issuesPct * 10)).toFixed(0);
  md += `## 🎯 SCORE QUALITÉ : ${qualityScore}/100\n\n`;
  
  if (qualityScore >= 90) {
    md += `✅ **Excellent** : Peu de corrections nécessaires\n`;
  } else if (qualityScore >= 70) {
    md += `🟡 **Bon** : Quelques améliorations recommandées\n`;
  } else if (qualityScore >= 50) {
    md += `🟠 **Moyen** : Corrections importantes à prévoir\n`;
  } else {
    md += `🔴 **À améliorer** : Révision complète recommandée\n`;
  }

  return md;
}

// Exécution
console.log(`🔍 Audit de la matière ${matiere}...\n`);
analyzeMatiere();
const report = generateReport();

// Sauvegarder
const outputPath = path.join(__dirname, '..', `AUDIT_${matiere}.md`);
fs.writeFileSync(outputPath, report, 'utf-8');

console.log(report);
console.log(`\n✅ Rapport sauvegardé: ${outputPath}`);
