/**
 * PlacementQuiz — Quiz de placement pour calibrer l'ELO initial
 *
 * Stratégie:
 * - 10 questions calibrées (ELO connu)
 * - Algorithme de recherche binaire pour trouver le niveau
 * - Ajuste l'ELO initial de l'utilisateur par thème
 * - Questions couvrant tous les rangs (800-2400)
 */
import { eloSystem, STARTING_ELO } from './EloProgressionSystem';
import { keyForQuestion } from '../utils';
export class PlacementQuiz {
    constructor() {
        this.PLACEMENT_QUESTIONS_COUNT = 10;
        this.MIN_ELO = 800;
        this.MAX_ELO = 2400;
    }
    /**
     * Démarrer un quiz de placement pour un thème
     */
    async startPlacement(theme, allQuestions) {
        // Filtrer les questions du thème
        const themeQuestions = allQuestions.filter(q => (q.tags || q.topics || []).includes(theme));
        if (themeQuestions.length < this.PLACEMENT_QUESTIONS_COUNT) {
            console.warn(`Pas assez de questions pour placement sur ${theme} (besoin: ${this.PLACEMENT_QUESTIONS_COUNT}, dispo: ${themeQuestions.length})`);
            return null;
        }
        // Charger les ELO des questions (si disponibles)
        const progress = await eloSystem.loadProgress();
        const questionsWithElo = themeQuestions.map(q => ({
            question: q,
            elo: progress.questionElos[keyForQuestion(q)]?.elo || STARTING_ELO,
        }));
        // Trier par ELO et sélectionner une distribution équilibrée
        questionsWithElo.sort((a, b) => a.elo - b.elo);
        // Sélectionner questions couvrant tout le spectre
        const selected = [];
        const step = Math.floor(questionsWithElo.length / this.PLACEMENT_QUESTIONS_COUNT);
        for (let i = 0; i < this.PLACEMENT_QUESTIONS_COUNT && i * step < questionsWithElo.length; i++) {
            selected.push(questionsWithElo[i * step].question);
        }
        // Si pas assez, compléter avec les restantes
        while (selected.length < this.PLACEMENT_QUESTIONS_COUNT && selected.length < themeQuestions.length) {
            const remaining = themeQuestions.filter(q => !selected.includes(q));
            if (remaining.length === 0)
                break;
            selected.push(remaining[0]);
        }
        return {
            theme,
            questions: selected,
            currentIndex: 0,
            answers: [],
            eloEstimate: STARTING_ELO,
            eloRange: [this.MIN_ELO, this.MAX_ELO],
            completed: false,
        };
    }
    /**
     * Enregistrer une réponse et ajuster l'estimation ELO
     */
    recordAnswer(session, correct) {
        session.answers.push(correct);
        session.currentIndex++;
        // Ajuster l'estimation par recherche binaire adaptative
        const [minElo, maxElo] = session.eloRange;
        const mid = (minElo + maxElo) / 2;
        if (correct) {
            // Bonne réponse → niveau potentiellement plus haut
            session.eloRange = [mid, maxElo];
            session.eloEstimate = (mid + maxElo) / 2;
        }
        else {
            // Mauvaise réponse → niveau potentiellement plus bas
            session.eloRange = [minElo, mid];
            session.eloEstimate = (minElo + mid) / 2;
        }
        // Marquer comme complété si toutes les questions répondues
        if (session.currentIndex >= session.questions.length) {
            session.completed = true;
        }
        return session;
    }
    /**
     * Calculer le résultat final du placement
     */
    async finalizePlacement(session) {
        const correctCount = session.answers.filter(a => a).length;
        const totalCount = session.answers.length;
        const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
        // Ajustement final basé sur la précision
        let finalElo = session.eloEstimate;
        // Bonus/malus selon performance globale
        if (accuracy >= 0.9) {
            finalElo += 100; // Très forte performance
        }
        else if (accuracy >= 0.7) {
            finalElo += 50; // Bonne performance
        }
        else if (accuracy <= 0.3) {
            finalElo -= 100; // Performance faible
        }
        else if (accuracy <= 0.5) {
            finalElo -= 50; // Performance moyenne-faible
        }
        // Borner entre MIN et MAX
        finalElo = Math.max(this.MIN_ELO, Math.min(this.MAX_ELO, finalElo));
        // Calculer confiance (plus de questions = plus de confiance)
        const confidence = Math.min(1, totalCount / this.PLACEMENT_QUESTIONS_COUNT);
        // Appliquer l'ELO calculé au thème de l'utilisateur
        const progress = await eloSystem.loadProgress();
        if (!progress.themes[session.theme]) {
            progress.themes[session.theme] = {
                theme: session.theme,
                elo: finalElo,
                matches: totalCount,
                wins: correctCount,
                lastPlayed: new Date(),
                streak: session.answers[session.answers.length - 1] ? 1 : 0,
                bestStreak: Math.max(...this.calculateStreaks(session.answers)),
            };
        }
        else {
            // Mettre à jour avec moyenne pondérée (placement pèse 50%)
            const currentElo = progress.themes[session.theme].elo;
            progress.themes[session.theme].elo = (currentElo + finalElo) / 2;
            progress.themes[session.theme].matches += totalCount;
            progress.themes[session.theme].wins += correctCount;
        }
        // Recalculer ELO global
        const allThemeElos = Object.values(progress.themes).map(t => t.elo);
        progress.globalElo = allThemeElos.reduce((a, b) => a + b, 0) / allThemeElos.length;
        await eloSystem.saveProgress(progress);
        return {
            theme: session.theme,
            estimatedElo: Math.round(finalElo),
            confidence,
            questionsAnswered: totalCount,
            correctAnswers: correctCount,
        };
    }
    /**
     * Calculer les séries de bonnes réponses
     */
    calculateStreaks(answers) {
        const streaks = [];
        let current = 0;
        for (const answer of answers) {
            if (answer) {
                current++;
            }
            else {
                if (current > 0)
                    streaks.push(current);
                current = 0;
            }
        }
        if (current > 0)
            streaks.push(current);
        return streaks.length > 0 ? streaks : [0];
    }
    /**
     * Vérifier si un placement est recommandé pour un thème
     */
    async shouldRecommendPlacement(theme) {
        const progress = await eloSystem.loadProgress();
        const themeData = progress.themes[theme];
        // Recommander si:
        // 1. Aucune donnée sur ce thème
        if (!themeData)
            return true;
        // 2. Moins de 5 parties jouées (pas assez de données)
        if (themeData.matches < 5)
            return true;
        // 3. Grand écart entre ELO et performance récente
        const expectedWinRate = 0.5; // Théorique à ELO équilibré
        const actualWinRate = themeData.wins / themeData.matches;
        const gap = Math.abs(expectedWinRate - actualWinRate);
        if (gap > 0.3)
            return true; // 30% d'écart
        return false;
    }
    /**
     * Obtenir les thèmes recommandés pour placement
     */
    async getRecommendedThemes(allQuestions) {
        // Extraire tous les thèmes uniques
        const allThemes = new Set();
        for (const q of allQuestions) {
            const themes = q.tags || q.topics || [];
            themes.forEach(t => allThemes.add(t));
        }
        const recommended = [];
        for (const theme of allThemes) {
            if (await this.shouldRecommendPlacement(theme)) {
                recommended.push(theme);
            }
        }
        return recommended;
    }
    /**
     * Sauvegarder session placement (pour reprendre plus tard)
     */
    saveSession(session) {
        const key = `t2q_placement_${session.theme}`;
        localStorage.setItem(key, JSON.stringify(session));
    }
    /**
     * Charger session placement
     */
    loadSession(theme) {
        try {
            const key = `t2q_placement_${theme}`;
            const stored = localStorage.getItem(key);
            if (!stored)
                return null;
            const session = JSON.parse(stored);
            // Reconstituer les dates
            if (session.theme)
                return session;
            return null;
        }
        catch {
            return null;
        }
    }
    /**
     * Supprimer session placement
     */
    clearSession(theme) {
        const key = `t2q_placement_${theme}`;
        localStorage.removeItem(key);
    }
}
// Singleton
export const placementQuiz = new PlacementQuiz();
