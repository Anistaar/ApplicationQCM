/**
 * Script correction automatique questions ANALYSE_ECO
 * - Ajoute explications manquantes
 * - Clarifie termes flous ("peut" → "peut notamment")
 * - Note: Calculs multi-étapes non corrigés automatiquement (nécessite refonte pédagogique)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYSE_ECO_PATH = path.join(__dirname, '..', 'src', 'questions', 'S1', 'ANALYSE_ECO');

const corrections = [
  // Explications manquantes
  {
    file: 'analyse_eco_MA1_qcm.txt',
    oldText: 'QCM || IDH ajoute dimensions || V:santé (espérance vie)|V:éducation (scolarisation)|V:revenu par habitant|chômage',
    newText: 'QCM || IDH ajoute dimensions || V:santé (espérance vie)|V:éducation (scolarisation)|V:revenu par habitant|chômage || IDH = Indice Développement Humain, combine 3 dimensions au-delà du PIB',
  },
  {
    file: 'analyse_eco_MA1_qcm.txt',
    oldText: 'QCM || Épargne nette ajustée (ENA) corrige l\'épargne de || V:+ Éducation|V:− Dégradation ressources|V:− Pollution|+ Production brute',
    newText: 'QCM || Épargne nette ajustée (ENA) corrige l\'épargne de || V:+ Éducation|V:− Dégradation ressources|V:− Pollution|+ Production brute || ENA mesure soutenabilité : ajuste pour capital humain et environnemental',
  },
  {
    file: 'analyse_eco_MA2_qcm.txt',
    oldText: 'QCM || Productivité globale des facteurs (PGF) mesure || V:le résidu de croissance non expliqué par K et L|la croissance totale|seulement la productivité du travail|le stock de capital',
    newText: 'QCM || Productivité globale des facteurs (PGF) mesure || V:le résidu de croissance non expliqué par K et L|la croissance totale|seulement la productivité du travail|le stock de capital || PGF = progrès technique + efficacité organisationnelle (résidu de Solow)',
  },
  
  // Termes flous clarifiés
  {
    file: 'analyse_eco_MA2_qcm.txt',
    oldText: 'QCM || Choc de demande négatif peut provenir de ||',
    newText: 'QCM || Choc de demande négatif peut notamment provenir de ||',
  },
  {
    file: 'analyse_eco_MA2_qcm.txt',
    oldText: 'QCM || Si g_Y=0, et g_K, g_L > 0 sur courte période, cela peut refléter ||',
    newText: 'QCM || Si g_Y=0, et g_K, g_L > 0 sur courte période, cela peut typiquement refléter ||',
  },
  {
    file: 'analyse_eco_MI1_qcm.txt',
    oldText: 'QCM || Exemple d\'arbitrage État: subvention aux transports en commun augmente équité mais peut ||',
    newText: 'QCM || Exemple d\'arbitrage État: subvention aux transports en commun augmente équité mais peut typiquement ||',
  },
  {
    file: 'analyse_eco_MI2_qcm.txt',
    oldText: 'QCM || Effet d\'une prime mal calibrée peut ||',
    newText: 'QCM || Effet d\'une prime mal calibrée peut notamment ||',
  },
  {
    file: 'analyse_eco_MI3_qcm.txt',
    oldText: 'QCM || Terres souvent considérées comme ||',
    newText: 'QCM || Terres généralement considérées comme ||',
  },
  {
    file: 'analyse_eco_MI3_qcm.txt',
    oldText: 'QCM || Si coûts de transaction élevés, échange marchandise peut ||',
    newText: 'QCM || Si coûts de transaction élevés, échange marchandise peut typiquement ||',
  },
];

let totalCorrections = 0;

for (const correction of corrections) {
  const filePath = path.join(ANALYSE_ECO_PATH, correction.file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes(correction.oldText)) {
      content = content.replace(correction.oldText, correction.newText);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${correction.file}: Correction appliquée`);
      totalCorrections++;
    } else {
      console.log(`⚠️  ${correction.file}: Texte non trouvé (peut-être déjà corrigé)`);
    }
  } catch (error) {
    console.error(`❌ ${correction.file}: ${error.message}`);
  }
}

console.log(`\n📊 RÉSUMÉ: ${totalCorrections}/${corrections.length} corrections appliquées`);
console.log('\n💡 NOTE: Les 35 questions trompeuses (calculs multi-étapes) nécessitent une refonte manuelle.');
console.log('   Elles restent fonctionnelles mais sont identifiées pour amélioration future.');
