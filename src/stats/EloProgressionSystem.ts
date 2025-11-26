/**
 * EloProgressionSystem — Système de progression ELO dynamique par thème
 * 
 * Fonctionnalités:
 * - ELO par thème (extrait automatiquement des tags)
 * - ELO par question (difficulté adaptative)
 * - Matchmaking intelligent (questions adaptées au niveau)
 * - Progression infinie avec rangs
 * - Détection de lacunes par thème
 */

import type { Question } from '../types';
import type { QStatExtended } from './StatsManager';
import { keyForQuestion } from '../utils';

// ===== TYPES =====

export interface ThemeElo {
  theme: string;
  elo: number;           // ELO utilisateur sur ce thème (début: 1500)
  matches: number;       // Nombre de questions jouées
  wins: number;          // Nombre de bonnes réponses
  lastPlayed: Date;
  streak: number;        // Série actuelle de bonnes réponses
  bestStreak: number;    // Meilleure série
}

export interface QuestionElo {
  questionId: string;
  elo: number;           // ELO de difficulté de la question (début: 1500)
  attempts: number;      // Fois jouée
  successRate: number;   // % de réussite global
}

export interface EloRank {
  min: number;
  max: number;
  name: string;
  icon: string;
  color: string;
}

export interface UserProgress {
  globalElo: number;           // ELO moyen de tous les thèmes
  themes: Record<string, ThemeElo>;
  questionElos: Record<string, QuestionElo>;
  totalMatches: number;
  lastUpdated: Date;
  achievements: string[];      // Badges débloqués
}

// ===== CONSTANTES =====

export const STARTING_ELO = 1500;
const K_FACTOR = 32;           // Volatilité ELO standard
const K_FACTOR_NEW = 40;       // Plus volatile pour les nouveaux joueurs/questions
const NEW_PLAYER_THRESHOLD = 20; // Considéré "nouveau" jusqu'à 20 parties

export const ELO_RANKS: EloRank[] = [
  { min: 0, max: 800, name: "Bronze", icon: "🥉", color: "#CD7F32" },
  { min: 800, max: 1200, name: "Argent", icon: "🥈", color: "#C0C0C0" },
  { min: 1200, max: 1500, name: "Or", icon: "🥇", color: "#FFD700" },
  { min: 1500, max: 1800, name: "Platine", icon: "💎", color: "#E5E4E2" },
  { min: 1800, max: 2100, name: "Diamant", icon: "💠", color: "#B9F2FF" },
  { min: 2100, max: 2400, name: "Maître", icon: "👑", color: "#9B59B6" },
  { min: 2400, max: Infinity, name: "Grand Maître", icon: "🌟", color: "#F39C12" },
];

// ===== CLASSE PRINCIPALE =====

class EloProgressionSystem {
  private readonly STORAGE_KEY = 't2q_elo_progress_v1';

  /**
   * Charger la progression utilisateur
   */
  async loadProgress(): Promise<UserProgress> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.createInitialProgress();

      const data = JSON.parse(stored);
      // Convertir les dates
      data.lastUpdated = new Date(data.lastUpdated);
      Object.values(data.themes).forEach((theme: any) => {
        theme.lastPlayed = new Date(theme.lastPlayed);
      });

      return data;
    } catch (error) {
      console.error('[EloSystem] Load failed:', error);
      return this.createInitialProgress();
    }
  }

  /**
   * Sauvegarder la progression
   */
  async saveProgress(progress: UserProgress): Promise<void> {
    try {
      progress.lastUpdated = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('[EloSystem] Save failed:', error);
    }
  }

  /**
   * Extraire les thèmes d'une question
   */
  extractThemes(q: Question): string[] {
    const themes = new Set<string>();

    // Méthode 1: Tags explicites dans Question.tags
    if (q.tags && q.tags.length > 0) {
      q.tags.forEach(t => themes.add(t));
    }

    // Méthode 2: Topics (alias parser)
    if (q.topics && q.topics.length > 0) {
      q.topics.forEach(t => themes.add(t));
    }

    // Méthode 3: Parser explication (dernière ligne avec tags)
    // Format: "... || MI3, Ricardo, Calculs, QCM"
    if (q.explication) {
      const lines = q.explication.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // Détecter si c'est une ligne de tags (contient des virgules)
      if (lastLine.includes(',')) {
        const parts = lastLine.split('||');
        const tagsPart = parts[parts.length - 1];
        
        tagsPart
          .split(',')
          .map(t => t.trim())
          .filter(t => t && !['QCM', 'QR', 'VF', 'DragMatch', 'OpenQ', 'FormulaBuilder'].includes(t))
          .forEach(t => themes.add(t));
      }
    }

    // Méthode 4: Parser depuis la question elle-même (mots-clés)
    // Extraire le premier mot significatif (ex: "MI3", "MA1", etc.)
    const questionText = q.question || '';
    const firstWord = questionText.split(/\s+/)[0];
    if (firstWord && /^(MI|MA|CH)\d+/i.test(firstWord)) {
      themes.add(firstWord);
    }

    // Si aucun thème trouvé, utiliser type de question par défaut
    if (themes.size === 0) {
      themes.add(q.type);
    }

    return Array.from(themes);
  }

  /**
   * Mettre à jour ELO après une réponse
   */
  async updateAfterAnswer(
    q: Question,
    correct: boolean,
    timeMs: number
  ): Promise<{ 
    newUserElo: number; 
    newQuestionElo: number; 
    eloChange: number;
    rankChange?: { from: string; to: string };
  }> {
    const progress = await this.loadProgress();
    const qId = keyForQuestion(q);
    const themes = this.extractThemes(q);

    // Récupérer/créer ELO question
    let qElo = progress.questionElos[qId] || {
      questionId: qId,
      elo: STARTING_ELO,
      attempts: 0,
      successRate: 0,
    };

    // Calculer ELO moyen utilisateur sur les thèmes de cette question
    const userThemeElos = themes.map(theme => {
      if (!progress.themes[theme]) {
        progress.themes[theme] = {
          theme,
          elo: STARTING_ELO,
          matches: 0,
          wins: 0,
          lastPlayed: new Date(),
          streak: 0,
          bestStreak: 0,
        };
      }
      return progress.themes[theme].elo;
    });

    const avgUserElo = userThemeElos.reduce((a, b) => a + b, 0) / userThemeElos.length;
    const oldRank = this.getRank(avgUserElo);

    // Calculer modification ELO (avec bonus/malus temps)
    const timeBonus = this.computeTimeBonus(timeMs, correct);
    const eloChange = this.computeEloChange(avgUserElo, qElo.elo, correct, timeBonus);

    // Mettre à jour ELO utilisateur sur TOUS les thèmes de la question
    themes.forEach(theme => {
      const themeData = progress.themes[theme];
      themeData.elo += eloChange;
      themeData.matches++;
      themeData.lastPlayed = new Date();

      if (correct) {
        themeData.wins++;
        themeData.streak++;
        themeData.bestStreak = Math.max(themeData.bestStreak, themeData.streak);
      } else {
        themeData.streak = 0;
      }
    });

    // Mettre à jour ELO question (inverse: si user gagne, question devient plus facile)
    const kFactorQuestion = qElo.attempts < NEW_PLAYER_THRESHOLD ? K_FACTOR_NEW : K_FACTOR;
    const questionEloChange = this.computeEloChange(qElo.elo, avgUserElo, !correct);
    qElo.elo = Math.max(800, Math.min(2800, qElo.elo + questionEloChange));
    qElo.attempts++;
    qElo.successRate = (qElo.successRate * (qElo.attempts - 1) + (correct ? 1 : 0)) / qElo.attempts;

    progress.questionElos[qId] = qElo;
    progress.totalMatches++;

    // Recalculer ELO global
    const allThemeElos = Object.values(progress.themes).map(t => t.elo);
    progress.globalElo = allThemeElos.reduce((a, b) => a + b, 0) / allThemeElos.length;

    // Vérifier achievements
    this.checkAchievements(progress);

    // Détecter changement de rang
    const newRank = this.getRank(progress.globalElo);
    const rankChange = oldRank.name !== newRank.name ? { from: oldRank.name, to: newRank.name } : undefined;

    await this.saveProgress(progress);

    return {
      newUserElo: progress.globalElo,
      newQuestionElo: qElo.elo,
      eloChange,
      rankChange,
    };
  }

  /**
   * Calculer le changement d'ELO
   */
  private computeEloChange(
    playerElo: number, 
    opponentElo: number, 
    won: boolean, 
    bonus: number = 0
  ): number {
    const kFactor = K_FACTOR + bonus; // K peut être boosté par temps rapide
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actual = won ? 1 : 0;
    return Math.round(kFactor * (actual - expected));
  }

  /**
   * Bonus/malus ELO basé sur le temps de réponse
   */
  private computeTimeBonus(timeMs: number, correct: boolean): number {
    if (!correct) return 0; // Pas de bonus si faux

    // Temps de référence: 30s = neutre
    const REFERENCE_TIME = 30000;
    
    if (timeMs < REFERENCE_TIME / 2) {
      // Réponse ultra-rapide (<15s) = +5 K-factor
      return 5;
    } else if (timeMs < REFERENCE_TIME) {
      // Réponse rapide (15-30s) = +2 K-factor
      return 2;
    } else if (timeMs > REFERENCE_TIME * 2) {
      // Réponse lente (>60s) = -3 K-factor
      return -3;
    }
    
    return 0;
  }

  /**
   * Obtenir le rang actuel
   */
  getRank(elo: number): EloRank {
    return ELO_RANKS.find(rank => elo >= rank.min && elo < rank.max) || ELO_RANKS[0];
  }

  /**
   * Obtenir les thèmes les plus faibles
   */
  async getWeakestThemes(limit: number = 3): Promise<ThemeElo[]> {
    const progress = await this.loadProgress();
    return Object.values(progress.themes)
      .filter(t => t.matches >= 5) // Minimum 5 parties pour être significatif
      .sort((a, b) => a.elo - b.elo)
      .slice(0, limit);
  }

  /**
   * Obtenir les thèmes les plus forts
   */
  async getStrongestThemes(limit: number = 3): Promise<ThemeElo[]> {
    const progress = await this.loadProgress();
    return Object.values(progress.themes)
      .filter(t => t.matches >= 5)
      .sort((a, b) => b.elo - a.elo)
      .slice(0, limit);
  }

  /**
   * Matchmaking: sélectionner une question adaptée au niveau
   */
  async selectMatchedQuestion(
    availableQuestions: Question[],
    targetTheme?: string
  ): Promise<Question | null> {
    const progress = await this.loadProgress();
    
    // Filtrer par thème si spécifié
    let candidates = targetTheme 
      ? availableQuestions.filter(q => this.extractThemes(q).includes(targetTheme))
      : availableQuestions;

    if (candidates.length === 0) return null;

    // Calculer ELO cible (moyenne des thèmes de l'utilisateur ± 200)
    const userElo = progress.globalElo;
    const minElo = userElo - 200;
    const maxElo = userElo + 200;

    // Scorer chaque question (préférer ELO proche)
    const scored = candidates.map(q => {
      const qId = keyForQuestion(q);
      const qElo = progress.questionElos[qId]?.elo || STARTING_ELO;
      const distance = Math.abs(qElo - userElo);
      
      // Pénaliser les questions déjà vues récemment
      const attempts = progress.questionElos[qId]?.attempts || 0;
      const recencyPenalty = Math.min(attempts * 50, 300);

      return { question: q, score: -distance - recencyPenalty };
    });

    // Sélectionner la meilleure
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.question || candidates[0];
  }

  /**
   * Prédire probabilité de réussite sur un thème
   */
  async predictSuccessRate(theme: string): Promise<number> {
    const progress = await this.loadProgress();
    const themeData = progress.themes[theme];
    
    if (!themeData || themeData.matches < 3) return 0.5; // Pas assez de données

    // Formule: winrate récent + bonus ELO
    const winRate = themeData.wins / themeData.matches;
    const eloBonus = Math.max(-0.2, Math.min(0.2, (themeData.elo - STARTING_ELO) / 1000));
    
    return Math.max(0, Math.min(1, winRate + eloBonus));
  }

  /**
   * Vérifier et débloquer achievements
   */
  private checkAchievements(progress: UserProgress): void {
    const achievements = new Set(progress.achievements);

    // Achievement: Premier pas (10 parties)
    if (progress.totalMatches >= 10 && !achievements.has('first_steps')) {
      achievements.add('first_steps');
    }

    // Achievement: Centurion (100 parties)
    if (progress.totalMatches >= 100 && !achievements.has('centurion')) {
      achievements.add('centurion');
    }

    // Achievement: Série de 5
    Object.values(progress.themes).forEach(theme => {
      if (theme.streak >= 5 && !achievements.has(`streak_5_${theme.theme}`)) {
        achievements.add(`streak_5_${theme.theme}`);
      }
    });

    // Achievement: Maîtrise d'un thème (ELO > 2000)
    Object.values(progress.themes).forEach(theme => {
      if (theme.elo >= 2000 && !achievements.has(`master_${theme.theme}`)) {
        achievements.add(`master_${theme.theme}`);
      }
    });

    progress.achievements = Array.from(achievements);
  }

  /**
   * Créer progression initiale
   */
  private createInitialProgress(): UserProgress {
    return {
      globalElo: STARTING_ELO,
      themes: {},
      questionElos: {},
      totalMatches: 0,
      lastUpdated: new Date(),
      achievements: [],
    };
  }

  /**
   * Réinitialiser toute la progression
   */
  async resetProgress(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export JSON
   */
  async exportProgress(): Promise<string> {
    const progress = await this.loadProgress();
    return JSON.stringify(progress, null, 2);
  }

  /**
   * Import JSON
   */
  async importProgress(json: string): Promise<void> {
    const progress = JSON.parse(json);
    await this.saveProgress(progress);
  }
}

// Singleton
export const eloSystem = new EloProgressionSystem();
