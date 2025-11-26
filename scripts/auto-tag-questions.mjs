#!/usr/bin/env node
/**
 * Auto-tagger les questions sans tags
 * 
 * Stratégie:
 * 1. Parser les questions existantes
 * 2. Détecter thème depuis nom de fichier (ex: stats_chap1 → "Chapitre 1", "Stats")
 * 3. Extraire mots-clés depuis la question (MI3, MA1, etc.)
 * 4. Ajouter tags automatiquement au format "|| theme1, theme2, QCM"
 */

import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const questionsDir = join(projectRoot, 'src', 'questions');

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Extraire thème depuis nom de fichier
 */
function extractThemeFromFilename(filename) {
  const themes = [];
  
  // Pattern pour chapitre
  const chapMatch = filename.match(/chap(?:itre)?[_\s]?(\d+)/i);
  if (chapMatch) {
    themes.push(`Chapitre ${chapMatch[1]}`);
  }
  
  // Pattern pour matière
  if (filename.includes('stats')) themes.push('Stats');
  if (filename.includes('macro')) themes.push('Macro');
  if (filename.includes('micro')) themes.push('Micro');
  if (filename.includes('analyse_eco')) themes.push('Analyse Éco');
  if (filename.includes('instit')) themes.push('Institutions');
  if (filename.includes('droit')) themes.push('Droit');
  if (filename.includes('hpe')) themes.push('HPE');
  if (filename.includes('riae')) themes.push('RIAE');
  
  // Pattern pour difficulté
  if (filename.includes('facile')) themes.push('Facile');
  if (filename.includes('moyen')) themes.push('Moyen');
  if (filename.includes('difficile')) themes.push('Difficile');
  
  // Pattern pour type
  if (filename.includes('examen')) themes.push('Examen');
  if (filename.includes('partiel')) themes.push('Partiel');
  if (filename.includes('train')) themes.push('Entrainement');
  
  return themes;
}

/**
 * Extraire thème depuis contenu de la question
 */
function extractThemeFromContent(questionText) {
  const themes = [];
  
  // Pattern MI/MA (micro/macro)
  const miMatch = questionText.match(/\b(MI\d+)\b/);
  if (miMatch) themes.push(miMatch[1]);
  
  const maMatch = questionText.match(/\b(MA\d+)\b/);
  if (maMatch) themes.push(maMatch[1]);
  
  // Pattern CH (chapitre)
  const chMatch = questionText.match(/\bCH\s*(\d+)\b/i);
  if (chMatch) themes.push(`CH${chMatch[1]}`);
  
  // Mots-clés économie
  if (/\b(ricardo|david ricardo)\b/i.test(questionText)) themes.push('Ricardo');
  if (/\b(smith|adam smith)\b/i.test(questionText)) themes.push('Smith');
  if (/\b(marx|karl marx)\b/i.test(questionText)) themes.push('Marx');
  if (/\b(keynes|keynés)\b/i.test(questionText)) themes.push('Keynes');
  
  // Concepts
  if (/\b(consommation|épargne)\b/i.test(questionText)) themes.push('Consommation');
  if (/\b(investissement|fbcf)\b/i.test(questionText)) themes.push('Investissement');
  if (/\b(pib|produit intérieur)\b/i.test(questionText)) themes.push('PIB');
  if (/\b(élasticité|prix)\b/i.test(questionText)) themes.push('Prix');
  if (/\b(offre|demande)\b/i.test(questionText)) themes.push('Offre-Demande');
  
  return themes;
}

/**
 * Déterminer le type de question
 */
function detectQuestionType(block) {
  // DragMatch: contient des paires A:B
  if (block.includes(':') && block.split('\n').filter(l => l.includes(':')).length >= 3) {
    return 'DragMatch';
  }
  
  // OpenQ: contient "Réponse attendue:" ou "Note:"
  if (/réponse attendue|note:/i.test(block)) {
    return 'OpenQ';
  }
  
  // VF: contient "V:" ou "F:" dans les réponses
  if (/^[VF]:/m.test(block)) {
    return 'VF';
  }
  
  // QR: pas de choix multiples (une seule réponse textuelle)
  const lines = block.split('\n').filter(l => l.trim());
  if (lines.length <= 4 && !block.includes('||')) {
    return 'QR';
  }
  
  // Par défaut: QCM
  return 'QCM';
}

/**
 * Parser et taguer un fichier
 */
async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const filename = basename(filePath, '.txt');
  const fileThemes = extractThemeFromFilename(filename);
  
  const blocks = content.split(/\n{2,}/);
  let modified = false;
  let addedTags = 0;
  
  const newBlocks = blocks.map(block => {
    if (!block.trim()) return block;
    
    // Vérifier si déjà tagué
    const lines = block.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // Si déjà tagué (contient "||" avec virgules), passer
    if (lastLine.includes('||') && lastLine.includes(',')) {
      return block;
    }
    
    // Extraire thèmes
    const contentThemes = extractThemeFromContent(block);
    const allThemes = [...new Set([...fileThemes, ...contentThemes])];
    
    // Si aucun thème, utiliser juste le nom de fichier simplifié
    if (allThemes.length === 0) {
      allThemes.push(filename.replace(/_/g, ' ').replace(/\d+/g, '').trim());
    }
    
    // Déterminer type de question
    const qType = detectQuestionType(block);
    
    // Ajouter tags à la fin
    const tags = allThemes.join(', ') + `, ${qType}`;
    const newBlock = block.trim() + `\n|| ${tags}`;
    
    modified = true;
    addedTags++;
    return newBlock;
  });
  
  if (!modified) {
    return { modified: false, addedTags: 0 };
  }
  
  const newContent = newBlocks.join('\n\n');
  
  if (!DRY_RUN) {
    await fs.writeFile(filePath, newContent, 'utf-8');
  }
  
  return { modified: true, addedTags };
}

/**
 * Scanner récursivement
 */
async function scanDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await scanDirectory(fullPath);
      results.push(...subResults);
    } else if (entry.isFile() && entry.name.endsWith('.txt')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Main
 */
async function main() {
  console.log('🏷️  AUTO-TAGGER DES QUESTIONS\n');
  
  if (DRY_RUN) {
    console.log('⚠️  MODE DRY-RUN: Aucune modification ne sera effectuée\n');
  }
  
  // Scanner tous les fichiers
  const files = await scanDirectory(questionsDir);
  console.log(`📁 Fichiers trouvés: ${files.length}\n`);
  
  let totalModified = 0;
  let totalTagsAdded = 0;
  
  for (const filePath of files) {
    const relativePath = filePath.replace(questionsDir, '').replace(/\\/g, '/');
    
    try {
      const result = await processFile(filePath);
      
      if (result.modified) {
        console.log(`✅ ${relativePath}: ${result.addedTags} question(s) taguée(s)`);
        totalModified++;
        totalTagsAdded += result.addedTags;
      }
    } catch (e) {
      console.error(`❌ Erreur ${relativePath}: ${e.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RÉSUMÉ:`);
  console.log(`   Fichiers modifiés: ${totalModified}`);
  console.log(`   Tags ajoutés: ${totalTagsAdded}`);
  
  if (DRY_RUN) {
    console.log(`\n💡 Pour appliquer les modifications, exécutez:`);
    console.log(`   node scripts/auto-tag-questions.mjs`);
  } else {
    console.log(`\n✅ Modifications appliquées avec succès !`);
    console.log(`\n💡 Exécutez l'audit pour vérifier:`);
    console.log(`   node scripts/audit-all-subjects.mjs`);
  }
}

main().catch(console.error);
