// src/database/ImportService.ts
// Service pour importer des fichiers text2quiz vers la base de données
import { parseText2Quiz } from '../parser';
import { questionDB } from './QuestionDatabase';
/**
 * Génère un UUID simple pour les questions
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Détecte la difficulté d'une question à partir de ses tags
 */
function detectDifficulty(tags) {
    const lowerTags = tags.map(t => t.toLowerCase());
    if (lowerTags.includes('expert'))
        return 'Expert';
    if (lowerTags.includes('difficile'))
        return 'Difficile';
    if (lowerTags.includes('moyen'))
        return 'Moyen';
    if (lowerTags.includes('facile'))
        return 'Facile';
    return 'Moyen'; // Par défaut
}
/**
 * Extrait les thèmes d'une question
 */
function extractThemes(question, options) {
    let themes = [];
    // Thèmes par défaut
    if (options.defaultThemes) {
        themes.push(...options.defaultThemes);
    }
    // Thèmes depuis les tags/topics de la question
    if (options.autoDetectThemes) {
        // Gérer tags (string ou array)
        if (question.tags) {
            if (Array.isArray(question.tags)) {
                themes.push(...question.tags);
            }
            else if (typeof question.tags === 'string') {
                const parsedTags = question.tags.split(',').map(t => t.trim()).filter(t => t);
                themes.push(...parsedTags);
            }
        }
        // Gérer topics (array du parser)
        if (question.topics && Array.isArray(question.topics)) {
            themes.push(...question.topics);
        }
    }
    // Dédupliquer
    return [...new Set(themes)];
}
/**
 * Convertit une Question en QuestionRecord
 */
function questionToRecord(question, options) {
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
export async function importText2QuizFile(content, options) {
    const result = {
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
                    const duplicate = existing.find(q => q.question.question === question.question &&
                        q.subject === options.subject);
                    if (duplicate) {
                        result.skipped++;
                        continue;
                    }
                }
                await questionDB.addQuestion(record);
                result.success++;
            }
            catch (error) {
                result.errors++;
                result.details.push(`❌ Question ${i + 1}: ${error.message}`);
            }
        }
        // Mettre à jour les statistiques
        await questionDB.updateThemeStatistics();
        await questionDB.updateSubjectStatistics();
        result.details.push(`✅ ${result.success} question(s) importée(s)`, `⏭️ ${result.skipped} question(s) ignorée(s) (doublons)`, `❌ ${result.errors} erreur(s)`);
        return result;
    }
    catch (error) {
        result.errors++;
        result.details.push(`❌ Erreur globale: ${error.message}`);
        return result;
    }
}
/**
 * Importe plusieurs fichiers en batch
 */
export async function importMultipleFiles(files) {
    const totalResult = {
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
export function extractThemesFromFile(content) {
    const questions = parseText2Quiz(content);
    const themes = new Set();
    questions.forEach(q => {
        if (q.tags) {
            q.tags.split(',').forEach(tag => {
                const trimmed = tag.trim();
                if (trimmed)
                    themes.add(trimmed);
            });
        }
    });
    return Array.from(themes).sort();
}
export function analyzeText2QuizFile(content) {
    const questions = parseText2Quiz(content);
    const types = {};
    let hasExplanations = 0;
    let totalAnswers = 0;
    questions.forEach(q => {
        // Compter les types
        types[q.type] = (types[q.type] || 0) + 1;
        // Compter les explications
        if (q.explanation)
            hasExplanations++;
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
