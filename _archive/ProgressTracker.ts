// src/database/ProgressTracker.ts
// Système de tracking de progression et spaced repetition

export interface NotionMastery {
  notionId: string;
  name: string;
  masteryScore: number; // 0-100
  totalSeen: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastReview: number;
  nextReview: number;
  interval: number; // en jours
  currentDifficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  questionIds: string[];
  tags: string[];
  history: MasteryHistory[];
}

export interface MasteryHistory {
  date: number;
  score: number;
  questionsAnswered: number;
  correctRate: number;
}

export interface UserProgress {
  userId: string;
  subjects: Record<string, SubjectProgress>;
  dailyGoals: {
    questionsPerDay: number;
    currentStreak: number;
    longestStreak: number;
    lastActivity: number;
  };
}

export interface SubjectProgress {
  totalQuestions: number;
  questionsAnswered: number;
  correctRate: number;
  currentLevel: number;
  experiencePoints: number;
  notions: Record<string, NotionMastery>;
  sessionHistory: SessionRecord[];
}

export interface SessionRecord {
  date: number;
  duration: number;
  questionsAnswered: number;
  correctAnswers: number;
  notionsReviewed: string[];
  averageDifficulty: string;
  sessionType: 'adaptive' | 'targeted' | 'review' | 'marathon';
}

const STORAGE_KEY = 'text2quiz_progress';
const DB_NAME = 'Text2QuizProgressDB';
const DB_VERSION = 1;

class ProgressTracker {
  private db: IDBDatabase | null = null;
  private cache: UserProgress | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadCache();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'userId' });
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  private async loadCache(): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.cache = JSON.parse(stored);
    } else {
      this.cache = this.createDefaultProgress();
      await this.save();
    }
  }

  private createDefaultProgress(): UserProgress {
    return {
      userId: 'user_' + Date.now(),
      subjects: {},
      dailyGoals: {
        questionsPerDay: 20,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: 0
      }
    };
  }

  async getProgress(subject?: string): Promise<UserProgress | SubjectProgress> {
    if (!this.cache) await this.loadCache();
    
    if (subject) {
      if (!this.cache!.subjects[subject]) {
        this.cache!.subjects[subject] = this.createDefaultSubjectProgress();
      }
      return this.cache!.subjects[subject];
    }
    
    return this.cache!;
  }

  private createDefaultSubjectProgress(): SubjectProgress {
    return {
      totalQuestions: 0,
      questionsAnswered: 0,
      correctRate: 0,
      currentLevel: 1,
      experiencePoints: 0,
      notions: {},
      sessionHistory: []
    };
  }

  async updateNotionMastery(
    subject: string,
    notionId: string,
    wasCorrect: boolean,
    questionId: string
  ): Promise<NotionMastery> {
    const subjectProgress = await this.getProgress(subject) as SubjectProgress;
    
    let notion = subjectProgress.notions[notionId];
    if (!notion) {
      notion = this.createDefaultNotion(notionId);
      subjectProgress.notions[notionId] = notion;
    }

    const now = Date.now();
    notion.totalSeen++;

    if (wasCorrect) {
      notion.correctAnswers++;
      notion.masteryScore = Math.min(100, notion.masteryScore + 10);
      
      // Spaced repetition: augmenter l'intervalle
      if (notion.masteryScore >= 80) {
        notion.interval = Math.min(30, notion.interval * 2);
      } else {
        notion.interval = Math.min(14, notion.interval * 1.5);
      }
    } else {
      notion.wrongAnswers++;
      notion.masteryScore = Math.max(0, notion.masteryScore - 15);
      
      // Reset intervalle
      notion.interval = 1;
    }

    // Mettre à jour les dates
    notion.lastReview = now;
    notion.nextReview = now + (notion.interval * 24 * 60 * 60 * 1000);

    // Ajuster la difficulté
    const successRate = notion.correctAnswers / (notion.correctAnswers + notion.wrongAnswers);
    if (successRate >= 0.9 && notion.totalSeen >= 5) {
      notion.currentDifficulty = this.increaseDifficulty(notion.currentDifficulty);
    } else if (successRate <= 0.5 && notion.totalSeen >= 3) {
      notion.currentDifficulty = this.decreaseDifficulty(notion.currentDifficulty);
    }

    // Ajouter à l'historique
    notion.history.push({
      date: now,
      score: notion.masteryScore,
      questionsAnswered: notion.totalSeen,
      correctRate: successRate
    });

    // Limiter l'historique à 50 entrées
    if (notion.history.length > 50) {
      notion.history = notion.history.slice(-50);
    }

    // Ajouter la question si pas déjà présente
    if (!notion.questionIds.includes(questionId)) {
      notion.questionIds.push(questionId);
    }

    await this.save();
    return notion;
  }

  private createDefaultNotion(notionId: string): NotionMastery {
    return {
      notionId,
      name: notionId,
      masteryScore: 0,
      totalSeen: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastReview: 0,
      nextReview: Date.now(),
      interval: 1,
      currentDifficulty: 'Facile',
      questionIds: [],
      tags: [],
      history: []
    };
  }

  private increaseDifficulty(current: NotionMastery['currentDifficulty']): NotionMastery['currentDifficulty'] {
    const levels: NotionMastery['currentDifficulty'][] = ['Facile', 'Moyen', 'Difficile', 'Expert'];
    const index = levels.indexOf(current);
    return index < levels.length - 1 ? levels[index + 1] : current;
  }

  private decreaseDifficulty(current: NotionMastery['currentDifficulty']): NotionMastery['currentDifficulty'] {
    const levels: NotionMastery['currentDifficulty'][] = ['Facile', 'Moyen', 'Difficile', 'Expert'];
    const index = levels.indexOf(current);
    return index > 0 ? levels[index - 1] : current;
  }

  async recordSession(subject: string, session: Omit<SessionRecord, 'date'>): Promise<void> {
    const subjectProgress = await this.getProgress(subject) as SubjectProgress;
    
    const fullSession: SessionRecord = {
      ...session,
      date: Date.now()
    };

    subjectProgress.sessionHistory.push(fullSession);
    
    // Limiter l'historique à 100 sessions
    if (subjectProgress.sessionHistory.length > 100) {
      subjectProgress.sessionHistory = subjectProgress.sessionHistory.slice(-100);
    }

    // Mettre à jour les stats globales
    subjectProgress.questionsAnswered += session.questionsAnswered;
    const totalCorrect = subjectProgress.sessionHistory.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAnswered = subjectProgress.sessionHistory.reduce((sum, s) => sum + s.questionsAnswered, 0);
    subjectProgress.correctRate = totalAnswered > 0 ? totalCorrect / totalAnswered : 0;

    // XP et niveau
    subjectProgress.experiencePoints += session.correctAnswers * 10;
    subjectProgress.currentLevel = Math.floor(subjectProgress.experiencePoints / 200) + 1;

    // Daily streak
    const now = Date.now();
    const lastActivity = this.cache!.dailyGoals.lastActivity;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastActivity < oneDayMs) {
      // Même jour, pas de changement
    } else if (now - lastActivity < 2 * oneDayMs) {
      // Jour suivant, augmenter le streak
      this.cache!.dailyGoals.currentStreak++;
      if (this.cache!.dailyGoals.currentStreak > this.cache!.dailyGoals.longestStreak) {
        this.cache!.dailyGoals.longestStreak = this.cache!.dailyGoals.currentStreak;
      }
    } else {
      // Streak cassé
      this.cache!.dailyGoals.currentStreak = 1;
    }
    
    this.cache!.dailyGoals.lastActivity = now;

    await this.save();
  }

  async getNotionMastery(subject: string, notionId: string): Promise<NotionMastery | null> {
    const subjectProgress = await this.getProgress(subject) as SubjectProgress;
    return subjectProgress.notions[notionId] || null;
  }

  async getNotionsByMasteryLevel(
    subject: string,
    level: 'mastered' | 'inProgress' | 'needsReview' | 'new'
  ): Promise<NotionMastery[]> {
    const subjectProgress = await this.getProgress(subject) as SubjectProgress;
    const notions = Object.values(subjectProgress.notions);

    switch (level) {
      case 'mastered':
        return notions.filter(n => n.masteryScore >= 80);
      case 'inProgress':
        return notions.filter(n => n.masteryScore >= 50 && n.masteryScore < 80);
      case 'needsReview':
        return notions.filter(n => n.totalSeen > 0 && n.masteryScore < 50);
      case 'new':
        return notions.filter(n => n.totalSeen === 0);
      default:
        return notions;
    }
  }

  async getNotionsDueForReview(subject: string): Promise<NotionMastery[]> {
    const subjectProgress = await this.getProgress(subject) as SubjectProgress;
    const now = Date.now();
    
    return Object.values(subjectProgress.notions)
      .filter(n => n.nextReview <= now && n.totalSeen > 0);
  }

  private async save(): Promise<void> {
    if (!this.cache) return;
    
    // Sauvegarder dans localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    
    // Sauvegarder dans IndexedDB
    if (this.db) {
      const tx = this.db.transaction(['progress'], 'readwrite');
      const store = tx.objectStore('progress');
      store.put(this.cache);
    }
  }

  async exportProgress(): Promise<string> {
    return JSON.stringify(this.cache, null, 2);
  }

  async importProgress(jsonData: string): Promise<void> {
    try {
      const imported = JSON.parse(jsonData);
      this.cache = imported;
      await this.save();
    } catch (error) {
      throw new Error('Format de données invalide');
    }
  }

  async resetProgress(subject?: string): Promise<void> {
    if (subject && this.cache) {
      delete this.cache.subjects[subject];
    } else {
      this.cache = this.createDefaultProgress();
    }
    await this.save();
  }
}

export const progressTracker = new ProgressTracker();
