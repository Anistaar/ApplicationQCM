// src/database/ImportService.ts
// Service pour importer des fichiers text2quiz vers la base de données

import { parseText2Quiz } from '../parser';
import { questionDB, type QuestionRecord } from './QuestionDatabase';
import type { Question } from '../types';

export interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
  details: string[];
}

export interface ImportOptions {
  subject: string;
  source: string;
  autoDetectThemes?: boolean;
  defaultThemes?: string[];
  overwriteExisting?: boolean;
}

/**
 * Génère un UUID simple pour les questions
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Détecte la difficulté d'une question à partir de ses tags
 */
function detectDifficulty(tags: string[]): 'Facile' | 'Moyen' | 'Difficile' | 'Expert' {
  const lowerTags = tags.map(t => t.toLowerCase());
  
  if (lowerTags.includes('expert')) return 'Expert';
  if (lowerTags.includes('difficile')) return 'Difficile';
  if (lowerTags.includes('moyen')) return 'Moyen';
  if (lowerTags.includes('facile')) return 'Facile';
  
  return 'Moyen'; // Par défaut
}

/**
 * Extrait les thèmes d'une question
 */
function extractThemes(question: Question, options: ImportOptions): string[] {
  let themes: string[] = [];

  // Thèmes par défaut
  if (options.defaultThemes) {
    themes.push(...options.defaultThemes);
  }

  // Thèmes depuis les tags/topics de la question
  if (options.autoDetectThemes) {
    if (question.tags) {
      themes.push(...question.tags);
    }
    
    // Gérer topics (array du parser)
    if (question.topics) {
      themes.push(...question.topics);
    }
  }

  // Dédupliquer
  return [...new Set(themes)];
}

/**
 * Convertit une Question en QuestionRecord
 */
function questionToRecord(
  question: Question,
  options: ImportOptions
): QuestionRecord {
  const themes = extractThemes(question, options);
  const difficulty = detectDifficulty(themes);

  return {
    id: generateUUID(),
    question,
    themes,
    subject: options.subject,
    difficulty,
    source: options.source,
    dateAdded: Date.now(),
    dateModified: Date.now()
  };
}

/**
 * Importe un fichier text2quiz dans la base de données
 */
export async function importText2QuizFile(
  content: string,
  options: ImportOptions
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    errors: 0,
    skipped: 0,
    details: []
  };

  try {
    // Parser le contenu
    const questions = parseText2Quiz(content);
    
    if (questions.length === 0) {
      result.details.push('❌ Aucune question trouvée dans le fichier');
      return result;
    }

    result.details.push(`📄 ${questions.length} question(s) détectée(s)`);

    // Importer chaque question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        const record = questionToRecord(question, options);
        
        // Vérifier si la question existe déjà (par contenu)
        if (!options.overwriteExisting) {
          const existing = await questionDB.getAllQuestions();
          const duplicate = existing.find(q => 
            q.question.question === question.question &&
            q.subject === options.subject
          );
          
          if (duplicate) {
            result.skipped++;
            continue;
          }
        }

        await questionDB.addQuestion(record);
        result.success++;
      } catch (error) {
        result.errors++;
        result.details.push(`❌ Question ${i + 1}: ${(error as Error).message}`);
      }
    }

    // Mettre à jour les statistiques
    await questionDB.updateThemeStatistics();
    await questionDB.updateSubjectStatistics();

    result.details.push(
      `✅ ${result.success} question(s) importée(s)`,
      `⏭️ ${result.skipped} question(s) ignorée(s) (doublons)`,
      `❌ ${result.errors} erreur(s)`
    );

    return result;
  } catch (error) {
    result.errors++;
    result.details.push(`❌ Erreur globale: ${(error as Error).message}`);
    return result;
  }
}

/**
 * Importe plusieurs fichiers en batch
 */
export async function importMultipleFiles(
  files: Array<{ content: string; options: ImportOptions }>
): Promise<ImportResult> {
  const totalResult: ImportResult = {
    success: 0,
    errors: 0,
    skipped: 0,
    details: []
  };

  for (const file of files) {
    totalResult.details.push(`\n📁 Import: ${file.options.source}`);
    
    const result = await importText2QuizFile(file.content, file.options);
    
    totalResult.success += result.success;
    totalResult.errors += result.errors;
    totalResult.skipped += result.skipped;
    totalResult.details.push(...result.details);
  }

  return totalResult;
}

/**
 * Récupère les thèmes uniques depuis un fichier text2quiz
 */
export function extractThemesFromFile(content: string): string[] {
  const questions = parseText2Quiz(content);
  const themes = new Set<string>();

  questions.forEach(q => {
    if (q.tags) {
      q.tags.forEach((tag: string) => {
        const trimmed = tag.trim();
        if (trimmed) themes.add(trimmed);
      });
    }
    if (q.topics) {
      q.topics.forEach((topic: string) => {
        const trimmed = topic.trim();
        if (trimmed) themes.add(trimmed);
      });
    }
  });

  return Array.from(themes).sort();
}

/**
 * Analyse un fichier text2quiz et retourne des statistiques
 */
export interface FileAnalysis {
  questionCount: number;
  themes: string[];
  types: Record<string, number>;
  hasExplanations: number;
  averageAnswers: number;
}

export function analyzeText2QuizFile(content: string): FileAnalysis {
  const questions = parseText2Quiz(content);
  
  const types: Record<string, number> = {};
  let hasExplanations = 0;
  let totalAnswers = 0;

  questions.forEach(q => {
    // Compter les types
    types[q.type] = (types[q.type] || 0) + 1;
    
    // Compter les explications
    if (q.explication) hasExplanations++;
    
    // Compter les réponses
    if ('answers' in q && Array.isArray(q.answers)) {
      totalAnswers += q.answers.length;
    }
  });

  return {
    questionCount: questions.length,
    themes: extractThemesFromFile(content),
    types,
    hasExplanations,
    averageAnswers: questions.length > 0 ? totalAnswers / questions.length : 0
  };
}
