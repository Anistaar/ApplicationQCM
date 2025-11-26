/**
 * Script détection questions à CONFUSION
 * 
 * Critères spécifiques:
 * - Formulations ambiguës (négations multiples)
 * - Termes flous ("souvent", "parfois", "généralement")
 * - Comparaisons sans référence claire
 * - Questions "toutes sauf" / "aucune sauf"
 * - Vocabulaire technique sans contexte
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_DIR = path.join(__dirname, '..', 'src', 'questions');

// Patterns confusion spécifiques
const CONFUSION_PATTERNS = {
  negationsMultiples: {
    patterns: [
      /ne\s+.*\s+pas\s+.*\s+pas/i,
      /n'est\s+pas\s+(in)?correct/i,
      /pas\s+.*\s+jamais/i,
      /ni\s+.*\s+ni\s+.*\s+ni/i,
    ],
    severity: 'HAUTE',
    solution: 'Reformuler en affirmation positive',
  },
  
  termesFlous: {
    patterns: [
      /\b(souvent|parfois|généralement|habituellement|fréquemment|rarement)\b/i,
      /\b(la plupart|certains|quelques|beaucoup)\b.*\bsont\b/i,
      /\b(peut|pourrait|devrait)\b(?!.*\bpas\b)/i,
      /\b(en général|dans l'ensemble|globalement)\b/i,
    ],
    severity: 'MOYENNE',
    solution: 'Préciser fréquence ou conditions exactes',
  },
  
  laquelleEstFausse: {
    patterns: [
      /laquelle\s+(est|sont)\s+(fausse?|incorrecte?)/i,
      /quelle.*n'est\s+pas/i,
      /parmi.*sauf/i,
    ],
    severity: 'HAUTE',
    solution: 'Remplacer par VF séquentiels ou QCM affirmatif',
  },
  
  toutesExcepte: {
    patterns: [
      /toutes?\s+(les|ces)\s+.*\s+sauf/i,
      /toutes?\s+.*\s+excepté/i,
      /toutes?\s+.*\s+à l'exception/i,
      /aucune?\s+.*\s+sauf/i,
    ],
    severity: 'HAUTE',
    solution: 'Reformuler en question directe',
  },
  
  comparaisonsSansReference: {
    patterns: [
      /\b(plus|moins|meilleur|pire)\b(?!.*que)/i,
      /\b(supérieur|inférieur)\b(?!.*à)/i,
      /\b(augmente|diminue)\b(?!.*(que|par rapport))/i,
    ],
    severity: 'MOYENNE',
    solution: 'Ajouter référence explicite (par rapport à quoi ?)',
  },
  
  vocabulaireTechniqueSansContexte: {
    patterns: [
      /\bex ante\b/i,
      /\bex post\b/i,
      /\bceteris paribus\b/i,
      /\bmutatis mutandis\b/i,
    ],
    severity: 'FAIBLE',
    solution: 'Ajouter définition entre parenthèses',
  },
};

const results = {
  totalFiles: 0,
  totalQuestions: 0,
  confusionIssues: {
    negationsMultiples: [],
    termesFlous: [],
    laquelleEstFausse: [],
    toutesExcepte: [],
    comparaisonsSansReference: [],
    vocabulaireTechniqueSansContexte: [],
  },
  byFolder: {},
  corrections: [], // Suggestions auto-fix
};

/**
 * Scanner récursif
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
 * Analyser fichier pour confusions
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
      confusions: 0,
    };
  }
  results.byFolder[folder].files++;

  const lines = content.split('\n');
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(QCM|QR|VF|DragMatch|OpenQ)\s*\|\|/);
    if (!match) continue;

    const type = match[1];
    results.totalQuestions++;
    results.byFolder[folder].questions++;

    const parts = trimmed.split('||').map(p => p.trim());
    const question = parts[1] || '';

    // Analyser chaque type de confusion
    for (const [confusionType, config] of Object.entries(CONFUSION_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(question)) {
          results.confusionIssues[confusionType].push({
            file: relativePath,
            line: lineNum,
            type,
            question: question.substring(0, 150),
            severity: config.severity,
            solution: config.solution,
            originalLine: trimmed,
          });
          
          results.byFolder[folder].confusions++;
          
          // Générer suggestion auto-fix si possible
          if (confusionType === 'laquelleEstFausse') {
            generateAutoFix(confusionType, {
              file: relativePath,
              line: lineNum,
              originalLine: trimmed,
              question,
              type,
            });
          }
          
          break; // Un seul problème par question
        }
      }
    }
  }
}

/**
 * Générer suggestions auto-fix
 */
function generateAutoFix(confusionType, issue) {
  if (confusionType === 'laquelleEstFausse' && issue.type === 'QCM') {
    // Extraire réponses du QCM
    const parts = issue.originalLine.split('||').map(p => p.trim());
    if (parts.length >= 3) {
      const answers = parts[2].split('|').map(a => a.trim().replace(/^V:/, ''));
      
      // Proposer séquence VF
      const vfSequence = answers.map((ans, idx) => {
        const isCorrect = parts[2].includes(`V:${ans}`) ? 'F' : 'V'; // Inversé car "fausse"
        return `VF || ${ans.replace(/^(La |Le |Les |L')/i, '')} || ${isCorrect} || Dérivé de: ${issue.question.substring(0, 50)}`;
      });
      
      results.corrections.push({
        file: issue.file,
        line: issue.line,
        type: 'REMPLACER_PAR_VF',
        original: issue.originalLine,
        suggested: vfSequence,
      });
    }
  }
}

/**
 * Générer rapport
 */
function generateReport() {
  let md = `# 🔍 ANALYSE QUESTIONS À CONFUSION\n\n`;
  md += `**Date**: ${new Date().toLocaleString('fr-FR')}\n`;
  md += `**Fichiers analysés**: ${results.totalFiles}\n`;
  md += `**Questions totales**: ${results.totalQuestions}\n\n`;
  md += `---\n\n`;

  // Compteur total confusions
  const totalConfusions = Object.values(results.confusionIssues).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  md += `## 📊 RÉSUMÉ CONFUSIONS\n\n`;
  md += `| Type Confusion | Nombre | Sévérité | Solution |\n`;
  md += `|----------------|--------|----------|----------|\n`;
  
  for (const [type, config] of Object.entries(CONFUSION_PATTERNS)) {
    const count = results.confusionIssues[type].length;
    const icon = config.severity === 'HAUTE' ? '🔴' : config.severity === 'MOYENNE' ? '🟡' : '🟢';
    md += `| **${type}** | ${icon} ${count} | ${config.severity} | ${config.solution} |\n`;
  }
  
  md += `\n**TOTAL CONFUSIONS: ${totalConfusions} questions (${((totalConfusions / results.totalQuestions) * 100).toFixed(1)}%)**\n\n`;

  // Stats par dossier
  md += `## 📁 PAR DOSSIER\n\n`;
  md += `| Dossier | Fichiers | Questions | Confusions | % |\n`;
  md += `|---------|----------|-----------|------------|---|\n`;
  for (const [folder, stats] of Object.entries(results.byFolder).sort((a, b) => b[1].confusions - a[1].confusions)) {
    const pct = stats.questions > 0 ? ((stats.confusions / stats.questions) * 100).toFixed(1) : '0.0';
    md += `| **${folder}** | ${stats.files} | ${stats.questions} | ${stats.confusions} | ${pct}% |\n`;
  }
  md += `\n`;

  // Détails par type
  for (const [confusionType, issues] of Object.entries(results.confusionIssues)) {
    if (issues.length === 0) continue;
    
    const config = CONFUSION_PATTERNS[confusionType];
    const icon = config.severity === 'HAUTE' ? '🔴' : config.severity === 'MOYENNE' ? '🟡' : '🟢';
    
    md += `## ${icon} ${confusionType.toUpperCase()} (${issues.length})\n\n`;
    md += `**Sévérité**: ${config.severity}  \n`;
    md += `**Solution**: ${config.solution}\n\n`;
    
    md += `| Fichier | Ligne | Type | Question | Sévérité |\n`;
    md += `|---------|-------|------|----------|----------|\n`;
    
    for (const issue of issues.slice(0, 30)) {
      md += `| \`${issue.file}\` | ${issue.line} | ${issue.type} | ${issue.question.replace(/\|/g, '\\|')} | ${issue.severity} |\n`;
    }
    
    if (issues.length > 30) {
      md += `\n*... et ${issues.length - 30} autres.*\n`;
    }
    md += `\n`;
  }

  // Suggestions auto-fix
  if (results.corrections.length > 0) {
    md += `## 🔧 SUGGESTIONS AUTO-FIX (${results.corrections.length})\n\n`;
    md += `Les corrections suivantes peuvent être appliquées automatiquement:\n\n`;
    
    for (const correction of results.corrections.slice(0, 10)) {
      md += `### ${correction.file}:${correction.line}\n\n`;
      md += `**Type**: ${correction.type}\n\n`;
      md += `**Original**:\n\`\`\`\n${correction.original}\n\`\`\`\n\n`;
      md += `**Suggéré** (${correction.suggested.length} questions VF):\n\`\`\`\n${correction.suggested.join('\n')}\n\`\`\`\n\n`;
      md += `---\n\n`;
    }
    
    if (results.corrections.length > 10) {
      md += `*... et ${results.corrections.length - 10} autres corrections disponibles.*\n\n`;
    }
    
    md += `**Pour appliquer**: \`node scripts/apply-confusion-fixes.mjs\`\n\n`;
  }

  // Recommandations
  md += `## 💡 PLAN D'ACTION\n\n`;
  md += `### Priorité 1: Négations multiples + "Laquelle est fausse" (HAUTE)\n`;
  md += `- ${results.confusionIssues.negationsMultiples.length + results.confusionIssues.laquelleEstFausse.length} questions\n`;
  md += `- Impact: Confusion maximale, déduction par élimination\n`;
  md += `- Temps: ~2h corrections manuelles ou 10min script auto-fix\n\n`;
  
  md += `### Priorité 2: Termes flous + Comparaisons sans référence (MOYENNE)\n`;
  md += `- ${results.confusionIssues.termesFlous.length + results.confusionIssues.comparaisonsSansReference.length} questions\n`;
  md += `- Impact: Ambiguïté modérée, réponses contestables\n`;
  md += `- Temps: ~3h ajouts précisions\n\n`;
  
  md += `### Priorité 3: Vocabulaire technique (FAIBLE)\n`;
  md += `- ${results.confusionIssues.vocabulaireTechniqueSansContexte.length} questions\n`;
  md += `- Impact: Barrière compréhension débutants\n`;
  md += `- Temps: ~1h ajouts définitions inline\n\n`;

  return md;
}

// Exécution
console.log('🔍 Analyse confusions en cours...\n');
scanDirectory(QUESTIONS_DIR);
const report = generateReport();

// Sauvegarder rapport
const outputPath = path.join(__dirname, '..', 'AUDIT_CONFUSIONS.md');
fs.writeFileSync(outputPath, report, 'utf-8');

// Sauvegarder corrections JSON pour script auto-fix
const correctionsPath = path.join(__dirname, 'confusion-fixes.json');
fs.writeFileSync(
  correctionsPath,
  JSON.stringify(results.corrections, null, 2),
  'utf-8'
);

console.log(report);
console.log(`\n✅ Rapport: ${outputPath}`);
console.log(`✅ Corrections: ${correctionsPath} (${results.corrections.length} suggestions)`);
