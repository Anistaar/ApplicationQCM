#!/usr/bin/env node
/**
 * Audit complet de toutes les matières
 * Vérifie:
 * - Qualité des questions (syntax, calculs, etc.)
 * - Présence de tags/topics pour intégration ELO
 * - Couverture thématique
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const questionsDir = join(projectRoot, 'src', 'questions');

// Toutes les matières à auditer
const SUBJECTS = [
  'ANALYSE_ECO',
  'DROIT',
  'HPE',
  'INSTIT',
  'MACRO',
  'RIAE',
  'STATS'
];

const SEMESTERS = ['S1', 'S2', 'S3', 'S4'];

/**
 * Chercher tous les fichiers de questions
 */
async function findQuestionFiles(subjectName) {
  const files = [];
  
  for (const semester of SEMESTERS) {
    const semesterPath = join(questionsDir, semester, subjectName);
    
    try {
      const stat = await fs.stat(semesterPath);
      if (!stat.isDirectory()) continue;
      
      const entries = await fs.readdir(semesterPath);
      for (const entry of entries) {
        if (entry.endsWith('.txt')) {
          files.push(join(semesterPath, entry));
        }
      }
    } catch (e) {
      // Dossier n'existe pas, passer
      continue;
    }
  }
  
  return files;
}

/**
 * Parser une question simple (format text2quiz)
 */
function parseSimpleQuestion(block) {
  const lines = block.split('\n').filter(l => l.trim());
  if (lines.length < 3) return null;
  
  const question = lines[0];
  const lastLine = lines[lines.length - 1];
  
  // Extraire tags depuis dernière ligne
  // Format: "|| CH1, Ricardo, Calculs, QCM"
  let tags = [];
  if (lastLine.includes('||')) {
    const parts = lastLine.split('||');
    const tagsPart = parts[parts.length - 1];
    tags = tagsPart
      .split(',')
      .map(t => t.trim())
      .filter(t => t && !['QCM', 'QR', 'VF', 'DragMatch', 'OpenQ'].includes(t));
  }
  
  return {
    question,
    tags,
    text: block
  };
}

/**
 * Analyser un fichier
 */
async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const blocks = content.split(/\n{2,}/).filter(b => b.trim());
  
  const questions = blocks.map(parseSimpleQuestion).filter(Boolean);
  
  const withTags = questions.filter(q => q.tags.length > 0);
  const withoutTags = questions.filter(q => q.tags.length === 0);
  
  // Extraire tous les tags uniques
  const allTags = new Set();
  questions.forEach(q => q.tags.forEach(t => allTags.add(t)));
  
  return {
    filePath,
    total: questions.length,
    withTags: withTags.length,
    withoutTags: withoutTags.length,
    coveragePercent: questions.length > 0 ? (withTags.length / questions.length) * 100 : 0,
    uniqueThemes: allTags.size,
    themes: Array.from(allTags),
    questionsWithoutTags: withoutTags.slice(0, 3) // Exemples
  };
}

/**
 * Exécuter audit qualité (script existant)
 */
function runQualityAudit(subjectName) {
  try {
    const output = execSync(
      `node scripts/audit-matiere.mjs ${subjectName}`,
      { cwd: projectRoot, encoding: 'utf-8', stdio: 'pipe' }
    );
    
    // Parser output pour extraire statistiques
    const criticalMatch = output.match(/PROBLÈMES CRITIQUES : (\d+)/);
    const warningsMatch = output.match(/AVERTISSEMENTS : (\d+)/);
    
    return {
      success: true,
      critical: criticalMatch ? parseInt(criticalMatch[1]) : 0,
      warnings: warningsMatch ? parseInt(warningsMatch[1]) : 0,
      output: output.split('\n').slice(0, 10).join('\n') // Premiers 10 lignes
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Audit complet d'une matière
 */
async function auditSubject(subjectName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 AUDIT: ${subjectName}`);
  console.log('='.repeat(60));
  
  // 1. Trouver fichiers
  const files = await findQuestionFiles(subjectName);
  console.log(`\n📁 Fichiers trouvés: ${files.length}`);
  
  if (files.length === 0) {
    console.log('⚠️  Aucun fichier de questions trouvé');
    return {
      subject: subjectName,
      files: 0,
      totalQuestions: 0,
      tagCoverage: 0,
      qualityIssues: 0
    };
  }
  
  // 2. Analyser présence de tags
  const analyses = await Promise.all(files.map(analyzeFile));
  
  const totalQuestions = analyses.reduce((sum, a) => sum + a.total, 0);
  const totalWithTags = analyses.reduce((sum, a) => sum + a.withTags, 0);
  const overallCoverage = totalQuestions > 0 ? (totalWithTags / totalQuestions) * 100 : 0;
  
  console.log(`\n📊 COUVERTURE DES TAGS:`);
  console.log(`   Total questions: ${totalQuestions}`);
  console.log(`   Avec tags: ${totalWithTags} (${overallCoverage.toFixed(1)}%)`);
  console.log(`   Sans tags: ${totalQuestions - totalWithTags}`);
  
  // Afficher détails par fichier
  analyses.forEach(a => {
    const filename = a.filePath.split(/[/\\]/).pop();
    const status = a.coveragePercent === 100 ? '✅' : a.coveragePercent > 80 ? '⚠️' : '❌';
    console.log(`   ${status} ${filename}: ${a.withTags}/${a.total} (${a.coveragePercent.toFixed(0)}%)`);
    
    if (a.questionsWithoutTags.length > 0) {
      console.log(`      Exemples sans tags:`);
      a.questionsWithoutTags.forEach(q => {
        const preview = q.question.substring(0, 60) + '...';
        console.log(`        - ${preview}`);
      });
    }
  });
  
  // Thèmes uniques
  const allThemes = new Set();
  analyses.forEach(a => a.themes.forEach(t => allThemes.add(t)));
  console.log(`\n🏷️  THÈMES UNIQUES: ${allThemes.size}`);
  console.log(`   ${Array.from(allThemes).slice(0, 10).join(', ')}${allThemes.size > 10 ? '...' : ''}`);
  
  // 3. Audit qualité (calculs, syntax, etc.)
  console.log(`\n🔍 AUDIT QUALITÉ:`);
  const qualityResult = runQualityAudit(subjectName);
  
  if (qualityResult.success) {
    const status = qualityResult.critical === 0 ? '✅' : '❌';
    console.log(`   ${status} Problèmes critiques: ${qualityResult.critical}`);
    console.log(`   ⚠️  Avertissements: ${qualityResult.warnings}`);
  } else {
    console.log(`   ❌ Erreur lors de l'audit: ${qualityResult.error}`);
  }
  
  return {
    subject: subjectName,
    files: files.length,
    totalQuestions,
    withTags: totalWithTags,
    tagCoverage: overallCoverage,
    uniqueThemes: allThemes.size,
    qualityCritical: qualityResult.success ? qualityResult.critical : -1,
    qualityWarnings: qualityResult.success ? qualityResult.warnings : -1
  };
}

/**
 * Main
 */
async function main() {
  console.log('🚀 AUDIT COMPLET DE TOUTES LES MATIÈRES');
  console.log('Vérification de la qualité et de la couverture des tags pour ELO\n');
  
  const results = [];
  
  for (const subject of SUBJECTS) {
    const result = await auditSubject(subject);
    results.push(result);
  }
  
  // Résumé global
  console.log(`\n${'='.repeat(60)}`);
  console.log('📈 RÉSUMÉ GLOBAL');
  console.log('='.repeat(60));
  
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalWithTags = results.reduce((sum, r) => sum + r.withTags, 0);
  const overallCoverage = totalQuestions > 0 ? (totalWithTags / totalQuestions) * 100 : 0;
  
  console.log(`\n📚 Questions totales: ${totalQuestions}`);
  console.log(`✅ Avec tags: ${totalWithTags} (${overallCoverage.toFixed(1)}%)`);
  console.log(`❌ Sans tags: ${totalQuestions - totalWithTags}`);
  
  // Classement par couverture
  console.log(`\n🏆 CLASSEMENT PAR COUVERTURE:`);
  const sorted = [...results].sort((a, b) => b.tagCoverage - a.tagCoverage);
  sorted.forEach((r, i) => {
    const icon = r.tagCoverage === 100 ? '🥇' : r.tagCoverage > 90 ? '🥈' : r.tagCoverage > 80 ? '🥉' : '📊';
    console.log(`   ${i + 1}. ${icon} ${r.subject.padEnd(15)} ${r.tagCoverage.toFixed(1)}% (${r.withTags}/${r.totalQuestions})`);
  });
  
  // Problèmes de qualité
  const withQualityIssues = results.filter(r => r.qualityCritical > 0);
  if (withQualityIssues.length > 0) {
    console.log(`\n⚠️  MATIÈRES AVEC PROBLÈMES CRITIQUES:`);
    withQualityIssues.forEach(r => {
      console.log(`   - ${r.subject}: ${r.qualityCritical} problème(s)`);
    });
  } else {
    console.log(`\n✅ Aucun problème critique détecté`);
  }
  
  // Recommandations
  console.log(`\n💡 RECOMMANDATIONS:`);
  
  const lowCoverage = results.filter(r => r.tagCoverage < 90);
  if (lowCoverage.length > 0) {
    console.log(`   1. Améliorer la couverture des tags pour:`);
    lowCoverage.forEach(r => {
      console.log(`      - ${r.subject}: ${r.tagCoverage.toFixed(0)}% couvert`);
    });
  }
  
  if (withQualityIssues.length > 0) {
    console.log(`   2. Corriger les problèmes de qualité dans:`);
    withQualityIssues.forEach(r => {
      console.log(`      - ${r.subject}: ${r.qualityCritical} problème(s) critique(s)`);
    });
  }
  
  if (overallCoverage === 100 && withQualityIssues.length === 0) {
    console.log(`   ✅ Système prêt pour déploiement ELO complet !`);
  }
  
  console.log();
}

main().catch(console.error);
