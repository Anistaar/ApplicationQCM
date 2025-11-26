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

// Patterns de détection
const CONFUSION_PATTERNS = {
  negationsMultiples: [
    /ne\s+.*\s+pas\s+.*\s+pas/i,
    /n'est\s+pas\s+(in)?correct/i,
  ],
  termesFlous: [
    /\b(souvent|parfois|généralement|habituellement|peut|pourrait)\b/i,
  ],
  laquelleEstFausse: [
    /laquelle\s+(est|sont)\s+(fausse?|incorrecte?)/i,
  ],
  comparaisonsSansRef: [
    /\b(plus|moins|meilleur|pire|supérieur|inférieur|augmente|diminue)\b(?!.*(que|à|par rapport))/i,
  ],
};

const TROMPEUSE_PATTERNS = [
  /\+\d+%.*\+\d+%.*[−\-]\d+%/,  // Variations composées
  /(\d+).*(\d+).*(\d+)/,         // Multi-step calculations
];

const results = {
  totalFiles: 0,
  totalQuestions: 0,
  byType: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0 },
  byChapter: {},
  issues: {
    confusions: [],
    trompeuses: [],
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
    types: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0 },
    chapter: null,
    issues: {
      confusions: 0,
      trompeuses: 0,
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

    const match = trimmed.match(/^(QCM|QR|VF|DragMatch|OpenQ)\s*\|\|/);
    if (!match) continue;

    const type = match[1];
    results.totalQuestions++;
    results.byType[type]++;
    fileStats.questions++;
    fileStats.types[type]++;

    const parts = trimmed.split('||').map(p => p.trim());
    const question = parts[1] || '';

    // Validation format
    const expectedCols = { QCM: 4, QR: 4, VF: 3, DragMatch: 3, OpenQ: 5 };
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

    // Vérifier explication (colonne 4 pour QCM/QR, colonne 3 pour VF/DragMatch)
    const explanationCol = (type === 'QCM' || type === 'QR') ? 3 : 2;
    if (type !== 'OpenQ' && (!parts[explanationCol] || parts[explanationCol].length < 5)) {
      results.issues.sansExplication.push({
        file: fileName,
        line: lineNum,
        type,
        question: question.substring(0, 80),
      });
      fileStats.issues.sansExplication++;
    }

    // Détecter confusions
    for (const [confType, patterns] of Object.entries(CONFUSION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(question)) {
          results.issues.confusions.push({
            file: fileName,
            line: lineNum,
            type,
            confType,
            question: question.substring(0, 100),
          });
          fileStats.issues.confusions++;
          break;
        }
      }
    }

    // Détecter trompeuses
    for (const pattern of TROMPEUSE_PATTERNS) {
      if (pattern.test(question)) {
        results.issues.trompeuses.push({
          file: fileName,
          line: lineNum,
          type,
          question: question.substring(0, 100),
        });
        fileStats.issues.trompeuses++;
        break;
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
  md += `## 🔴 PROBLÈMES DÉTECTÉS\n\n`;

  // Confusions
  if (results.issues.confusions.length > 0) {
    md += `### Confusions (${results.issues.confusions.length})\n\n`;
    md += `| Fichier | Ligne | Type | Confusion | Question |\n`;
    md += `|---------|-------|------|-----------|----------|\n`;
    for (const issue of results.issues.confusions.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.confType} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.confusions.length > 20) {
      md += `\n*... et ${results.issues.confusions.length - 20} autres.*\n`;
    }
    md += `\n`;
  }

  // Trompeuses
  if (results.issues.trompeuses.length > 0) {
    md += `### Questions trompeuses (${results.issues.trompeuses.length})\n\n`;
    md += `| Fichier | Ligne | Type | Question |\n`;
    md += `|---------|-------|------|----------|\n`;
    for (const issue of results.issues.trompeuses.slice(0, 20)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} |\n`;
    }
    if (results.issues.trompeuses.length > 20) {
      md += `\n*... et ${results.issues.trompeuses.length - 20} autres.*\n`;
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
  
  if (results.issues.formatsInvalides.length > 0) {
    md += `### 🔴 Priorité HAUTE : Corriger ${results.issues.formatsInvalides.length} formats invalides\n`;
    md += `- Action : Ajouter colonnes manquantes (explication pour QCM/QR/VF)\n`;
    md += `- Temps estimé : ~${Math.ceil(results.issues.formatsInvalides.length / 20)}h\n\n`;
  }

  if (results.issues.trompeuses.length > 0) {
    md += `### 🔴 Priorité HAUTE : Simplifier ${results.issues.trompeuses.length} questions trompeuses\n`;
    md += `- Action : Décomposer calculs multi-étapes en séquences\n`;
    md += `- Temps estimé : ~${Math.ceil(results.issues.trompeuses.length / 10)}h\n\n`;
  }

  if (results.issues.confusions.length > 0) {
    md += `### 🟡 Priorité MOYENNE : Clarifier ${results.issues.confusions.length} confusions\n`;
    md += `- Action : Reformuler termes flous, ajouter références\n`;
    md += `- Temps estimé : ~${Math.ceil(results.issues.confusions.length / 15)}h\n\n`;
  }

  if (results.issues.sansExplication.length > 0) {
    md += `### 🟢 Priorité BASSE : Enrichir ${results.issues.sansExplication.length} explications\n`;
    md += `- Action : Ajouter feedback pédagogique\n`;
    md += `- Temps estimé : ~${Math.ceil(results.issues.sansExplication.length / 30)}h\n\n`;
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
