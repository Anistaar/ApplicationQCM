/**
 * Script audit automatique COMPLET - Analyse 120 fichiers questions
 * 
 * Détecte:
 * - Questions trompeuses (calculs multi-étapes, pièges)
 * - Questions ambiguës (doubles négations, "laquelle est fausse")
 * - Multi-concepts (> 1 notion par question)
 * - Explications manquantes
 * - Formats invalides
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_DIR = path.join(__dirname, '..', 'src', 'questions');

// Patterns problématiques
const PATTERNS = {
  trompeuse: [
    /\+\d+%.*\+\d+%.*[−\-]\d+%/, // Variations composées
    /(\d+).*(\d+).*(\d+)/, // Calculs multi-étapes (3+ nombres)
    /(inflation|déflateur).*\d+.*\d+/, // Confusion inflation
  ],
  ambigue: [
    /laquelle est fausse/i,
    /n'est\s+pas\s+(in)?correct/i, // Double négation
    /ne\s+.*\s+pas\s+.*\s+pas/i, // Triple négation
    /sauf|excepté|à l'exception/i, // Formulations négatives
  ],
  multiConcept: [
    /\bet\b.*\bet\b.*\bet\b/i, // 3+ "et" = multi-concepts
    /d'une part.*d'autre part/i,
    /premièrement.*deuxièmement/i,
  ],
};

// Résultats
const results = {
  totalFiles: 0,
  totalQuestions: 0,
  byType: { QCM: 0, QR: 0, VF: 0, DragMatch: 0, OpenQ: 0, Unknown: 0 },
  issues: {
    trompeuses: [],
    ambigues: [],
    multiConcepts: [],
    sansExplication: [],
    formatsInvalides: [],
  },
  byFolder: {},
};

/**
 * Scanner récursif de fichiers
 */
function scanDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanDirectory(fullPath, baseDir);
    } else if (file.name.endsWith('.txt') && file.name !== 'README.md') {
      analyzeFile(fullPath, baseDir);
    }
  }
}

/**
 * Analyser un fichier de questions
 */
function analyzeFile(filePath, baseDir) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(baseDir, filePath);
  const folder = relativePath.split(path.sep)[0] || 'root';

  results.totalFiles++;

  if (!results.byFolder[folder]) {
    results.byFolder[folder] = {
      files: 0,
      questions: 0,
      trompeuses: 0,
      ambigues: 0,
      multiConcepts: 0,
      sansExplication: 0,
    };
  }
  results.byFolder[folder].files++;

  const lines = content.split('\n');
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Détecter type de question
    const match = trimmed.match(/^(QCM|QR|VF|DragMatch|OpenQ)\s*\|\|/);
    if (!match) continue;

    const type = match[1];
    results.totalQuestions++;
    results.byType[type] = (results.byType[type] || 0) + 1;
    results.byFolder[folder].questions++;

    const parts = trimmed.split('||').map(p => p.trim());
    const question = parts[1] || '';
    const explication = parts[parts.length - 1] || '';

    // Analyse problèmes
    
    // 1. Questions trompeuses
    for (const pattern of PATTERNS.trompeuse) {
      if (pattern.test(question)) {
        results.issues.trompeuses.push({
          file: relativePath,
          line: lineNum,
          type,
          question: question.substring(0, 100),
          reason: 'Calcul multi-étapes ou piège arithmétique',
        });
        results.byFolder[folder].trompeuses++;
        break;
      }
    }

    // 2. Questions ambiguës
    for (const pattern of PATTERNS.ambigue) {
      if (pattern.test(question)) {
        results.issues.ambigues.push({
          file: relativePath,
          line: lineNum,
          type,
          question: question.substring(0, 100),
          reason: 'Formulation ambiguë (négation, "laquelle est fausse")',
        });
        results.byFolder[folder].ambigues++;
        break;
      }
    }

    // 3. Multi-concepts
    for (const pattern of PATTERNS.multiConcept) {
      if (pattern.test(question)) {
        results.issues.multiConcepts.push({
          file: relativePath,
          line: lineNum,
          type,
          question: question.substring(0, 100),
          reason: 'Multi-concepts (>1 notion)',
        });
        results.byFolder[folder].multiConcepts++;
        break;
      }
    }

    // 4. Sans explication (sauf VF simples)
    if (type !== 'VF' && explication.length < 10) {
      results.issues.sansExplication.push({
        file: relativePath,
        line: lineNum,
        type,
        question: question.substring(0, 80),
      });
      results.byFolder[folder].sansExplication++;
    }

    // 5. Format invalide (nombre de colonnes incorrect)
    const expectedCols = {
      QCM: 4, // QCM || Q || Réponses || Explication
      QR: 4,
      VF: 3, // VF || Q || V/F || Explication
      DragMatch: 3,
      OpenQ: 5, // OpenQ || Q || Keywords || Explication || Référence
    };

    if (parts.length < expectedCols[type]) {
      results.issues.formatsInvalides.push({
        file: relativePath,
        line: lineNum,
        type,
        expected: expectedCols[type],
        actual: parts.length,
      });
    }
  }
}

/**
 * Générer rapport Markdown
 */
function generateReport() {
  let md = `# 🔍 AUDIT AUTOMATIQUE COMPLET - 120 Fichiers Questions\n\n`;
  md += `**Date**: ${new Date().toLocaleString('fr-FR')}\n`;
  md += `**Script**: scripts/audit-complet.mjs\n\n`;
  md += `---\n\n`;

  // Résumé global
  md += `## 📊 RÉSUMÉ GLOBAL\n\n`;
  md += `| Métrique | Valeur |\n`;
  md += `|----------|--------|\n`;
  md += `| **Fichiers analysés** | ${results.totalFiles} |\n`;
  md += `| **Questions totales** | ${results.totalQuestions} |\n`;
  md += `| **Questions trompeuses** | 🔴 ${results.issues.trompeuses.length} |\n`;
  md += `| **Questions ambiguës** | 🟡 ${results.issues.ambigues.length} |\n`;
  md += `| **Multi-concepts** | 🟡 ${results.issues.multiConcepts.length} |\n`;
  md += `| **Sans explication** | 🟢 ${results.issues.sansExplication.length} |\n`;
  md += `| **Formats invalides** | 🔴 ${results.issues.formatsInvalides.length} |\n\n`;

  // Répartition types
  md += `## 📚 RÉPARTITION PAR TYPE\n\n`;
  md += `| Type | Nombre | % |\n`;
  md += `|------|--------|---|\n`;
  for (const [type, count] of Object.entries(results.byType).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / results.totalQuestions) * 100).toFixed(1);
    md += `| **${type}** | ${count} | ${pct}% |\n`;
  }
  md += `\n`;

  // Statistiques par dossier
  md += `## 📁 STATISTIQUES PAR DOSSIER\n\n`;
  md += `| Dossier | Fichiers | Questions | Trompeuses | Ambiguës | Multi-concepts | Sans expl. |\n`;
  md += `|---------|----------|-----------|------------|----------|----------------|------------|\n`;
  for (const [folder, stats] of Object.entries(results.byFolder).sort((a, b) => b[1].questions - a[1].questions)) {
    md += `| **${folder}** | ${stats.files} | ${stats.questions} | ${stats.trompeuses} | ${stats.ambigues} | ${stats.multiConcepts} | ${stats.sansExplication} |\n`;
  }
  md += `\n`;

  // Détails problèmes
  md += `## 🔴 QUESTIONS TROMPEUSES (${results.issues.trompeuses.length})\n\n`;
  if (results.issues.trompeuses.length === 0) {
    md += `✅ Aucune question trompeuse détectée.\n\n`;
  } else {
    md += `| Fichier | Ligne | Type | Question | Raison |\n`;
    md += `|---------|-------|------|----------|--------|\n`;
    for (const issue of results.issues.trompeuses.slice(0, 50)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} | ${issue.reason} |\n`;
    }
    if (results.issues.trompeuses.length > 50) {
      md += `\n*... et ${results.issues.trompeuses.length - 50} autres.*\n`;
    }
    md += `\n`;
  }

  md += `## 🟡 QUESTIONS AMBIGUËS (${results.issues.ambigues.length})\n\n`;
  if (results.issues.ambigues.length === 0) {
    md += `✅ Aucune question ambiguë détectée.\n\n`;
  } else {
    md += `| Fichier | Ligne | Type | Question | Raison |\n`;
    md += `|---------|-------|------|----------|--------|\n`;
    for (const issue of results.issues.ambigues.slice(0, 50)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} | ${issue.reason} |\n`;
    }
    if (results.issues.ambigues.length > 50) {
      md += `\n*... et ${results.issues.ambigues.length - 50} autres.*\n`;
    }
    md += `\n`;
  }

  md += `## 🟡 MULTI-CONCEPTS (${results.issues.multiConcepts.length})\n\n`;
  if (results.issues.multiConcepts.length === 0) {
    md += `✅ Principe "1 notion = 1 question" respecté.\n\n`;
  } else {
    md += `| Fichier | Ligne | Type | Question | Raison |\n`;
    md += `|---------|-------|------|----------|--------|\n`;
    for (const issue of results.issues.multiConcepts.slice(0, 30)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} | ${issue.reason} |\n`;
    }
    if (results.issues.multiConcepts.length > 30) {
      md += `\n*... et ${results.issues.multiConcepts.length - 30} autres.*\n`;
    }
    md += `\n`;
  }

  md += `## 🔴 FORMATS INVALIDES (${results.issues.formatsInvalides.length})\n\n`;
  if (results.issues.formatsInvalides.length === 0) {
    md += `✅ Tous les formats sont valides.\n\n`;
  } else {
    md += `| Fichier | Ligne | Type | Attendu | Actuel |\n`;
    md += `|---------|-------|------|---------|--------|\n`;
    for (const issue of results.issues.formatsInvalides.slice(0, 30)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.expected} cols | ${issue.actual} cols |\n`;
    }
    if (results.issues.formatsInvalides.length > 30) {
      md += `\n*... et ${results.issues.formatsInvalides.length - 30} autres.*\n`;
    }
    md += `\n`;
  }

  // Recommandations
  md += `## 💡 RECOMMANDATIONS\n\n`;
  
  if (results.issues.trompeuses.length > 0) {
    md += `### 🔴 Priorité HAUTE: Questions trompeuses (${results.issues.trompeuses.length})\n`;
    md += `- Découper calculs multi-étapes en séquences (3 questions simples)\n`;
    md += `- Ajouter question concept AVANT calcul (ex: "Comment déflater un PIB ?")\n`;
    md += `- Éviter pièges arithmétiques non pédagogiques\n\n`;
  }

  if (results.issues.ambigues.length > 0) {
    md += `### 🟡 Priorité MOYENNE: Questions ambiguës (${results.issues.ambigues.length})\n`;
    md += `- Remplacer "Laquelle est fausse ?" par VF séquentiels\n`;
    md += `- Reformuler doubles négations en affirmations positives\n`;
    md += `- Privilégier questions directes\n\n`;
  }

  if (results.issues.multiConcepts.length > 0) {
    md += `### 🟡 Priorité MOYENNE: Multi-concepts (${results.issues.multiConcepts.length})\n`;
    md += `- Respecter principe "1 notion = 1 question"\n`;
    md += `- Séparer propositions reliées par "et"\n`;
    md += `- Créer séquences thématiques au lieu d'agrégation\n\n`;
  }

  md += `---\n\n`;
  md += `**Prochain audit**: Après corrections, relancer \`npm run audit:questions\`\n`;

  return md;
}

// Exécution
console.log('🔍 Audit automatique des questions...\n');
scanDirectory(QUESTIONS_DIR);
const report = generateReport();

// Sauvegarder rapport
const outputPath = path.join(__dirname, '..', 'AUDIT_COMPLET.md');
fs.writeFileSync(outputPath, report, 'utf-8');

console.log(report);
console.log(`\n✅ Rapport sauvegardé: ${outputPath}`);
