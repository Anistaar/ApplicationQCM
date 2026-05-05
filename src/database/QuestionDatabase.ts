// src/database/QuestionDatabase.ts
// Système de base de données pour gérer les questions avec IndexedDB

import type { Question } from '../types';

export interface QuestionRecord {
  id: string; // UUID unique
  question: Question;
  themes: string[]; // Tags/thèmes assignés
  subject: string; // Matière (MACRO, INSTIT, etc.)
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  source: string; // Fichier d'origine
  dateAdded: number; // Timestamp
  dateModified: number; // Timestamp
  customMetadata?: Record<string, any>; // Métadonnées personnalisées
}

export interface ThemeDefinition {
  id: string;
  name: string;
  color: string;
  description?: string;
  parent?: string; // ID du thème parent pour hiérarchie
  questionCount: number;
}

export interface SubjectDefinition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  themeCount: number;
  questionCount: number;
}

const DB_NAME = 'Text2QuizDB';
const DB_VERSION = 1;

export class QuestionDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store des questions
        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('subject', 'subject', { unique: false });
          questionStore.createIndex('themes', 'themes', { unique: false, multiEntry: true });
          questionStore.createIndex('difficulty', 'difficulty', { unique: false });
          questionStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        }

        // Store des thèmes
        if (!db.objectStoreNames.contains('themes')) {
          const themeStore = db.createObjectStore('themes', { keyPath: 'id' });
          themeStore.createIndex('name', 'name', { unique: false });
        }

        // Store des matières
        if (!db.objectStoreNames.contains('subjects')) {
          const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' });
          subjectStore.createIndex('name', 'name', { unique: false });
        }

        // Store des métadonnées utilisateur (tags personnalisés, notes, etc.)
        if (!db.objectStoreNames.contains('userMetadata')) {
          db.createObjectStore('userMetadata', { keyPath: 'questionId' });
        }
      };
    });
  }

  // ========================================
  // QUESTIONS
  // ========================================

  async addQuestion(record: QuestionRecord): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readwrite');
      const store = tx.objectStore('questions');
      const request = store.add(record);

      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateQuestion(record: QuestionRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    record.dateModified = Date.now();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readwrite');
      const store = tx.objectStore('questions');
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteQuestion(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readwrite');
      const store = tx.objectStore('questions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getQuestion(id: string): Promise<QuestionRecord | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readonly');
      const store = tx.objectStore('questions');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllQuestions(): Promise<QuestionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readonly');
      const store = tx.objectStore('questions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuestionsBySubject(subject: string): Promise<QuestionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readonly');
      const store = tx.objectStore('questions');
      const index = store.index('subject');
      const request = index.getAll(subject);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuestionsByTheme(theme: string): Promise<QuestionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['questions'], 'readonly');
      const store = tx.objectStore('questions');
      const index = store.index('themes');
      const request = index.getAll(theme);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuestionsByThemes(themes: string[]): Promise<QuestionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allQuestions = await this.getAllQuestions();
    return allQuestions.filter(q => 
      themes.some(theme => q.themes.includes(theme))
    );
  }

  async searchQuestions(query: string): Promise<QuestionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allQuestions = await this.getAllQuestions();
    const lowerQuery = query.toLowerCase();
    
    return allQuestions.filter(q => 
      q.question.question.toLowerCase().includes(lowerQuery) ||
      q.themes.some(t => t.toLowerCase().includes(lowerQuery)) ||
      q.subject.toLowerCase().includes(lowerQuery)
    );
  }

  // ========================================
  // THEMES
  // ========================================

  async addTheme(theme: ThemeDefinition): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['themes'], 'readwrite');
      const store = tx.objectStore('themes');
      const request = store.add(theme);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateTheme(theme: ThemeDefinition): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['themes'], 'readwrite');
      const store = tx.objectStore('themes');
      const request = store.put(theme);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTheme(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['themes'], 'readwrite');
      const store = tx.objectStore('themes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllThemes(): Promise<ThemeDefinition[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['themes'], 'readonly');
      const store = tx.objectStore('themes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getThemesBySubject(subject: string): Promise<ThemeDefinition[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const questions = await this.getQuestionsBySubject(subject);
    const themeNames = new Set<string>();
    questions.forEach(q => q.themes.forEach(t => themeNames.add(t)));
    
    const allThemes = await this.getAllThemes();
    return allThemes.filter(t => themeNames.has(t.name));
  }

  // ========================================
  // SUBJECTS
  // ========================================

  async addSubject(subject: SubjectDefinition): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['subjects'], 'readwrite');
      const store = tx.objectStore('subjects');
      const request = store.add(subject);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSubject(subject: SubjectDefinition): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['subjects'], 'readwrite');
      const store = tx.objectStore('subjects');
      const request = store.put(subject);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSubjects(): Promise<SubjectDefinition[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['subjects'], 'readonly');
      const store = tx.objectStore('subjects');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  async updateThemeStatistics(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const themes = await this.getAllThemes();
    const questions = await this.getAllQuestions();
    
    for (const theme of themes) {
      theme.questionCount = questions.filter(q => q.themes.includes(theme.name)).length;
      await this.updateTheme(theme);
    }
  }

  async updateSubjectStatistics(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const subjects = await this.getAllSubjects();
    const questions = await this.getAllQuestions();
    const themes = await this.getAllThemes();
    
    for (const subject of subjects) {
      const subjectQuestions = questions.filter(q => q.subject === subject.id);
      subject.questionCount = subjectQuestions.length;
      
      const subjectThemes = new Set<string>();
      subjectQuestions.forEach(q => q.themes.forEach(t => subjectThemes.add(t)));
      subject.themeCount = subjectThemes.size;
      
      await this.updateSubject(subject);
    }
  }

  // ========================================
  // IMPORT / EXPORT
  // ========================================

  async exportToJSON(): Promise<string> {
    const questions = await this.getAllQuestions();
    const themes = await this.getAllThemes();
    const subjects = await this.getAllSubjects();

    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      questions,
      themes,
      subjects
    }, null, 2);
  }

  async importFromJSON(jsonData: string): Promise<{ success: number; errors: number }> {
    try {
      const data = JSON.parse(jsonData);
      let success = 0;
      let errors = 0;

      // Importer les matières
      if (data.subjects) {
        for (const subject of data.subjects) {
          try {
            await this.addSubject(subject);
            success++;
          } catch (e) {
            errors++;
          }
        }
      }

      // Importer les thèmes
      if (data.themes) {
        for (const theme of data.themes) {
          try {
            await this.addTheme(theme);
            success++;
          } catch (e) {
            errors++;
          }
        }
      }

      // Importer les questions
      if (data.questions) {
        for (const question of data.questions) {
          try {
            await this.addQuestion(question);
            success++;
          } catch (e) {
            errors++;
          }
        }
      }

      return { success, errors };
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const storeNames = ['questions', 'themes', 'subjects', 'userMetadata'];
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeNames, 'readwrite');
      
      storeNames.forEach(name => {
        tx.objectStore(name).clear();
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Instance singleton
export const questionDB = new QuestionDatabase();
