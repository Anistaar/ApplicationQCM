// src/database/AdaptiveLearning.ts
// Algorithme de séquençage adaptatif type Duolingo
import { progressTracker } from './ProgressTracker';
const DEFAULT_OPTIONS = {
    maxQuestionsPerSession: 5,
    includeReview: true,
    reviewRatio: 0.4, // 40% review, 60% new
    progressiveIncrease: true
};
export class AdaptiveLearning {
    /**
     * Crée un parcours d'apprentissage adaptatif
     */
    async createLearningPath(subject, questions, options = {}) {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        const progress = await progressTracker.getProgress(subject);
        // Grouper les questions par notion
        const questionsByNotion = this.groupQuestionsByNotion(questions);
        // Récupérer les notions existantes
        const existingNotions = Object.values(progress.notions || {});
        // Prioriser les notions
        const prioritized = this.prioritizeNotions(questionsByNotion, existingNotions);
        // Créer les sessions
        const sessions = this.createSessions(prioritized, opts);
        const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0);
        const estimatedTotalDuration = sessions.reduce((sum, s) => sum + s.estimatedDuration, 0);
        const notionsCovered = [...new Set(sessions.flatMap(s => s.focus))];
        return {
            sessions,
            totalQuestions,
            estimatedTotalDuration,
            notionsCovered,
            recommendedOrder: sessions.map((_, i) => i)
        };
    }
    /**
     * Groupe les questions par notion (basé sur les tags)
     */
    groupQuestionsByNotion(questions) {
        const groups = new Map();
        for (const question of questions) {
            // Identifier la notion principale (premier tag non-difficulté)
            const tags = question.tags || [];
            const notion = this.extractMainNotion(tags);
            if (!groups.has(notion)) {
                groups.set(notion, []);
            }
            groups.get(notion).push(question);
        }
        return groups;
    }
    /**
     * Extrait la notion principale des tags
     */
    extractMainNotion(themes) {
        const difficultyTags = ['Facile', 'Moyen', 'Difficile', 'Expert'];
        const typeTags = ['QCM', 'QR', 'VF', 'OpenQ', 'DragMatch'];
        // Chercher le tag le plus spécifique (pas difficulté, pas type)
        for (const theme of themes) {
            if (!difficultyTags.includes(theme) && !typeTags.includes(theme)) {
                return theme;
            }
        }
        return themes[0] || 'General';
    }
    /**
     * Extrait la difficulté d'une question depuis ses tags
     */
    getDifficulty(question) {
        const tags = question.tags || [];
        const difficulties = ['Facile', 'Moyen', 'Difficile', 'Expert'];
        const found = tags.find(tag => difficulties.includes(tag));
        return found || 'Moyen';
    }
    /**
     * Priorise les notions selon la progression de l'utilisateur
     */
    prioritizeNotions(questionsByNotion, existingNotions) {
        const prioritized = [];
        for (const [notion, questions] of questionsByNotion) {
            const existing = existingNotions.find(n => n.notionId === notion || n.tags.includes(notion));
            let priority = 0;
            let mastery = 0;
            if (!existing || existing.totalSeen === 0) {
                // Notion jamais vue → priorité moyenne
                priority = 50;
                mastery = 0;
            }
            else {
                mastery = existing.masteryScore;
                if (existing.masteryScore < 50) {
                    // Notion faible → priorité haute
                    priority = 100 - existing.masteryScore;
                }
                else if (existing.masteryScore < 80) {
                    // Notion en cours → priorité normale
                    priority = 50;
                }
                else {
                    // Notion maîtrisée → priorité basse (révision seulement)
                    priority = 20;
                }
                // Augmenter la priorité si la révision est due
                if (existing.nextReview <= Date.now()) {
                    priority += 30;
                }
            }
            prioritized.push({ notion, questions, priority, mastery });
        }
        // Trier par priorité décroissante
        return prioritized.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Crée les sessions d'apprentissage
     */
    createSessions(prioritized, options) {
        const sessions = [];
        const reviewPool = [];
        let sessionId = 1;
        // Séparer les notions en catégories
        const needsReview = prioritized.filter(p => p.mastery > 0 && p.mastery < 50);
        const inProgress = prioritized.filter(p => p.mastery >= 50 && p.mastery < 80);
        const newNotions = prioritized.filter(p => p.mastery === 0);
        const mastered = prioritized.filter(p => p.mastery >= 80);
        let remainingNew = [...newNotions];
        let remainingReview = [...needsReview];
        let remainingProgress = [...inProgress];
        while (remainingNew.length > 0 || remainingReview.length > 0 || remainingProgress.length > 0) {
            const sessionQuestions = [];
            const sessionFocus = [];
            let sessionType = 'reinforcement';
            // Session 1 : Introduction pure (5 nouvelles)
            if (sessionId === 1 && remainingNew.length > 0) {
                sessionType = 'introduction';
                const notion = remainingNew.shift();
                sessionQuestions.push(...this.selectQuestions(notion.questions, options.maxQuestionsPerSession, 'Facile'));
                sessionFocus.push(notion.notion);
            }
            // Toutes les 3 sessions : Consolidation (5 révisions)
            else if (sessionId % 3 === 0 && (reviewPool.length > 0 || remainingReview.length > 0)) {
                sessionType = 'consolidation';
                // Prendre dans le pool de révision
                const poolQuestions = reviewPool.splice(0, 3);
                sessionQuestions.push(...poolQuestions);
                // Compléter avec des notions à revoir
                if (sessionQuestions.length < options.maxQuestionsPerSession && remainingReview.length > 0) {
                    const reviewNotion = remainingReview.shift();
                    const needed = options.maxQuestionsPerSession - sessionQuestions.length;
                    const reviewDifficulty = reviewNotion.questions[0] ? this.getDifficulty(reviewNotion.questions[0]) : 'Moyen';
                    sessionQuestions.push(...this.selectQuestions(reviewNotion.questions, needed, reviewDifficulty));
                    sessionFocus.push(reviewNotion.notion);
                }
            }
            // Sessions normales : Mix review + nouvelles
            else {
                sessionType = 'reinforcement';
                // 40% review
                const reviewCount = Math.floor(options.maxQuestionsPerSession * options.reviewRatio);
                if (reviewPool.length > 0) {
                    sessionQuestions.push(...reviewPool.splice(0, reviewCount));
                }
                else if (remainingReview.length > 0) {
                    const reviewNotion = remainingReview.shift();
                    sessionQuestions.push(...this.selectQuestions(reviewNotion.questions, reviewCount, 'Facile'));
                    sessionFocus.push(reviewNotion.notion);
                }
                // 60% nouvelles
                const newCount = options.maxQuestionsPerSession - sessionQuestions.length;
                if (remainingNew.length > 0) {
                    const newNotion = remainingNew.shift();
                    const selected = this.selectQuestions(newNotion.questions, newCount, 'Facile');
                    sessionQuestions.push(...selected);
                    sessionFocus.push(newNotion.notion);
                }
                else if (remainingProgress.length > 0) {
                    const progressNotion = remainingProgress.shift();
                    const selected = this.selectQuestions(progressNotion.questions, newCount, 'Moyen');
                    sessionQuestions.push(...selected);
                    sessionFocus.push(progressNotion.notion);
                }
            }
            // Si pas assez de questions, passer au niveau suivant
            if (sessionQuestions.length === 0)
                break;
            // Créer la session
            const avgDifficulty = this.calculateAverageDifficulty(sessionQuestions);
            sessions.push({
                id: sessionId,
                type: sessionType,
                questions: sessionQuestions,
                estimatedDuration: Math.ceil(sessionQuestions.length * 0.6), // 36s par question
                difficulty: avgDifficulty,
                focus: [...new Set(sessionFocus)]
            });
            sessionId++;
            // Limiter à 20 sessions max
            if (sessionId > 20)
                break;
        }
        return sessions;
    }
    /**
     * Sélectionne des questions d'une liste selon des critères
     */
    selectQuestions(questions, count, preferredDifficulty) {
        let filtered = [...questions];
        // Filtrer par difficulté si spécifiée
        if (preferredDifficulty) {
            const withDiff = filtered.filter(q => this.getDifficulty(q) === preferredDifficulty);
            if (withDiff.length >= count) {
                filtered = withDiff;
            }
        }
        // Mélanger et prendre les n premiers
        const shuffled = this.shuffle(filtered);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    /**
     * Calcule la difficulté moyenne d'un ensemble de questions
     */
    calculateAverageDifficulty(questions) {
        const difficultyScores = {
            'Facile': 1,
            'Moyen': 2,
            'Difficile': 3,
            'Expert': 4
        };
        const avg = questions.reduce((sum, q) => sum + (difficultyScores[this.getDifficulty(q)] || 2), 0) / questions.length;
        if (avg <= 1.5)
            return 'Facile';
        if (avg <= 2.5)
            return 'Moyen';
        if (avg <= 3.5)
            return 'Difficile';
        return 'Expert';
    }
    /**
     * Mélange un tableau
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    /**
     * Génère une session de révision rapide (notions dues)
     */
    async createReviewSession(subject, maxQuestions = 10) {
        const notionsDue = await progressTracker.getNotionsDueForReview(subject);
        if (notionsDue.length === 0)
            return null;
        // Pour l'instant, retourner une session simple
        // TODO: récupérer les vraies questions liées à ces notions
        return {
            id: 0,
            type: 'consolidation',
            questions: [],
            estimatedDuration: Math.ceil(maxQuestions * 0.6),
            difficulty: 'Moyen',
            focus: notionsDue.map(n => n.notionId)
        };
    }
}
export const adaptiveLearning = new AdaptiveLearning();
