// src/types/structure.ts
// Architecture universelle pour les structures de matières
// Compatible avec toutes les matières (MACRO, INSTIT, STATS, TEST)

/**
 * Type de structure de la matière
 * - sequential: Chapitres numérotés progressifs (MACRO, STATS)
 * - thematic: Thèmes transversaux non séquentiels (INSTIT)
 * - simple: Structure plate pour tests (TEST)
 */
export type StructureType = 'sequential' | 'thematic' | 'simple';

/**
 * Niveau de difficulté d'une notion
 */
export type Difficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Expert';

/**
 * Statistiques de progression pour un élément
 */
export interface ProgressStats {
  totalNotions: number;           // Nombre total de notions
  masteredNotions: number;        // Notions avec masteryLevel === 3
  inProgressNotions: number;      // Notions avec 0 < masteryLevel < 3
  newNotions: number;             // Notions jamais vues (masteryLevel === 0)
  percentageComplete: number;     // (masteredNotions / totalNotions) * 100
}

/**
 * Structure complète d'une matière
 */
export interface SubjectStructure {
  id: string;                     // 'MACRO', 'INSTIT', 'STATS', 'TEST'
  name: string;                   // 'Macroéconomie', 'Institutions', etc.
  version: string;                // '2.0', '1.0'
  structureType: StructureType;   // Type de structure
  lastUpdate: string;             // Date ISO 8601
  description?: string;           // Description de la matière
  chapters: Chapter[];            // Chapitres ou thèmes principaux
  crossCutting?: CrossCutting;    // Éléments transversaux (optionnel)
  metadata?: {
    totalQuestions: number;
    estimatedTotalTime: number;   // minutes
    authors?: string[];           // Auteurs du contenu
    sources?: string[];           // Sources des questions
  };
}

/**
 * Chapitre ou thème principal
 */
export interface Chapter {
  id: string;                     // 'chap1', 'theme-fmi', 'test-definitions'
  number?: string;                // '1', '2' (null pour structure thématique)
  romanNumeral?: string;          // 'I', 'II', 'III' (pour sections)
  name: string;                   // 'Consommation', 'FMI', 'Définitions'
  description?: string;           // Description longue
  sections: Section[];            // Sections (I, II, III...)
  questionCount: number;          // Nombre total de questions
  estimatedTime: number;          // Temps estimé en minutes
  progress?: ProgressStats;       // Statistiques de progression (runtime)
  icon?: string;                  // Emoji ou icône
}

/**
 * Section (niveau I, II, III)
 */
export interface Section {
  id: string;                     // 'chap1.I', 'theme-fmi.histoire'
  romanNumeral?: string;          // 'I', 'II', 'III' (pour sections numérotées)
  letter?: string;                // 'A', 'B', 'C' (alternative)
  name: string;                   // 'Théorie keynésienne', 'Histoire du FMI'
  description?: string;           // Description détaillée
  subsections: SubSection[];      // Sous-sections (1, 2, 3...)
  questionCount: number;          // Nombre de questions dans cette section
  estimatedTime: number;          // Temps estimé en minutes
  progress?: ProgressStats;       // Statistiques de progression (runtime)
}

/**
 * Sous-section (niveau 1, 2, 3)
 */
export interface SubSection {
  id: string;                     // 'chap1.I.1', 'theme-fmi.histoire.creation'
  number?: string;                // '1', '2', '3' (pour sous-sections numérotées)
  name: string;                   // 'Fonction de consommation', 'Création du FMI'
  description?: string;           // Description
  notions: Notion[];              // Notions (niveau le plus granulaire)
  questionCount: number;          // Nombre de questions
  estimatedTime: number;          // Temps estimé en minutes
  progress?: ProgressStats;       // Statistiques de progression (runtime)
}

/**
 * Notion (niveau le plus granulaire - unité d'apprentissage)
 */
export interface Notion {
  id: string;                     // 'chap1.I.1.fonction-conso', 'fmi.histoire.bretton-woods'
  name: string;                   // 'Fonction de consommation keynésienne', 'Accords de Bretton Woods'
  description: string;            // Description complète de la notion
  tags: string[];                 // Tags pour filtrer les questions
  difficulty: Difficulty;         // Niveau de difficulté
  estimatedTime: number;          // Temps estimé pour maîtriser (minutes)
  questionCount: number;          // Nombre de questions associées
  relatedNotions?: string[];      // IDs de notions liées (pour navigation)
  relatedAuthors?: string[];      // IDs d'auteurs liés (cross-cutting)
  relatedFormulas?: string[];     // IDs de formules liées (cross-cutting)
  relatedOrganizations?: string[]; // IDs d'organisations liées (INSTIT uniquement)
  keywords?: string[];            // Mots-clés pour recherche
  examples?: string[];            // Exemples concrets
  prerequisites?: string[];       // IDs de notions prérequises
}

/**
 * Éléments transversaux (formules, auteurs, organisations)
 */
export interface CrossCutting {
  formulas?: CrossCuttingCategory;      // Formules mathématiques
  authors?: CrossCuttingCategory;       // Économistes, théoriciens
  organizations?: CrossCuttingCategory; // Institutions (INSTIT uniquement)
  concepts?: CrossCuttingCategory;      // Concepts théoriques (optionnel)
}

/**
 * Catégorie d'éléments transversaux
 */
export interface CrossCuttingCategory {
  id: string;                     // 'formulas', 'authors', 'organizations'
  name: string;                   // '📐 Formules clés', '👥 Économistes'
  description?: string;           // Description de la catégorie
  items: CrossCuttingItem[];      // Items de la catégorie
  displayOrder?: 'alphabetical' | 'chronological' | 'importance'; // Ordre d'affichage
}

/**
 * Item transversal (formule, auteur, organisation)
 */
export interface CrossCuttingItem {
  id: string;                     // 'formula-multiplicateur', 'keynes', 'fmi'
  name: string;                   // 'Multiplicateur keynésien', 'John Maynard Keynes', 'FMI'
  fullName?: string;              // Nom complet (auteurs, organisations)
  description: string;            // Description détaillée
  formula?: string;               // Formule mathématique (LaTeX ou texte)
  tags: string[];                 // Tags pour filtrage
  relatedNotions: string[];       // IDs de notions où apparaît cet item
  questionCount: number;          // Nombre de questions associées
  difficulty?: Difficulty;        // Difficulté moyenne (optionnel)
  estimatedTime?: number;         // Temps estimé (minutes)
  metadata?: {
    born?: string;                // Date naissance (auteurs)
    died?: string;                // Date décès (auteurs)
    nationality?: string;         // Nationalité (auteurs)
    nobelPrize?: number;          // Année Nobel (auteurs)
    founded?: string;             // Date création (organisations)
    headquarters?: string;        // Siège (organisations)
    members?: number;             // Nombre membres (organisations)
    website?: string;             // URL (organisations)
    latexFormula?: string;        // Formule LaTeX (formules)
    variables?: {[key: string]: string}; // Variables et significations (formules)
  };
  icon?: string;                  // Emoji ou icône
  imageUrl?: string;              // URL image (auteurs, organisations)
  externalLinks?: {
    label: string;
    url: string;
  }[];
}

/**
 * Progression d'une notion (stockée dans localStorage)
 */
export interface NotionProgress {
  notionId: string;               // ID de la notion
  subjectId: string;              // ID de la matière
  masteryLevel: 0 | 1 | 2 | 3;   // Niveau de maîtrise (0=nouveau, 3=maîtrisé)
  consecutiveCorrect: number;     // Réussites consécutives pour progression
  totalAttempts: number;          // Tentatives totales
  correctAttempts: number;        // Tentatives réussies
  lastReview: string;             // Date ISO 8601 dernière révision
  nextReviewDate: string;         // Date ISO 8601 prochaine révision
  interval: number;               // Intervalle actuel en jours
  easeFactor: number;             // Facteur d'espacement SM-2 (1.3 à 2.5)
  reviewHistory: ReviewAttempt[]; // Historique des tentatives
  createdAt: string;              // Date ISO 8601 première tentative
  updatedAt: string;              // Date ISO 8601 dernière mise à jour
}

/**
 * Tentative de révision
 */
export interface ReviewAttempt {
  date: string;                   // Date ISO 8601
  correct: boolean;               // Réussite ou échec
  timeSpent: number;              // Temps passé en secondes
  difficulty?: 'easy' | 'medium' | 'hard'; // Auto-évaluation (optionnel)
  questionType?: string;          // Type de question (QCM, QR, VF, etc.)
}

/**
 * Configuration de session de quiz
 */
export interface QuizConfig {
  subjectId: string;              // ID de la matière
  mode: 'adaptive' | 'manual' | 'review' | 'exam' | 'marathon';
  notionIds?: string[];           // IDs des notions sélectionnées (mode manuel)
  chapterIds?: string[];          // IDs des chapitres sélectionnés
  maxQuestions: number;           // Nombre max de questions
  shuffleQuestions: boolean;      // Mélanger questions
  shuffleAnswers: boolean;        // Mélanger réponses
  showExplanations: boolean;      // Afficher explications
  timeLimit?: number;             // Limite de temps en minutes (optionnel)
  minDifficulty?: Difficulty;     // Difficulté minimale
  includeNew: boolean;            // Inclure notions nouvelles
  prioritizeDue: boolean;         // Prioriser notions dues
}

/**
 * Session de quiz active
 */
export interface QuizSession {
  id: string;                     // UUID de la session
  config: QuizConfig;             // Configuration
  questions: any[];               // Questions du quiz (type Question du parser)
  currentQuestionIndex: number;   // Index question actuelle
  answers: QuizAnswer[];          // Réponses données
  startTime: string;              // Date ISO 8601 début
  endTime?: string;               // Date ISO 8601 fin (optionnel)
  completed: boolean;             // Session terminée
}

/**
 * Réponse donnée dans un quiz
 */
export interface QuizAnswer {
  questionId: string;             // ID ou hash de la question
  notionId: string;               // ID de la notion associée
  correct: boolean;               // Réponse correcte
  timeSpent: number;              // Temps passé en secondes
  userAnswer: any;                // Réponse de l'utilisateur
  correctAnswer: any;             // Réponse correcte
  timestamp: string;              // Date ISO 8601
}

/**
 * Statistiques globales d'une matière
 */
export interface SubjectStats {
  subjectId: string;              // ID de la matière
  totalNotions: number;           // Nombre total de notions
  masteredNotions: number;        // Notions maîtrisées (level 3)
  inProgressNotions: number;      // Notions en cours (level 1-2)
  newNotions: number;             // Notions jamais vues (level 0)
  totalQuestions: number;         // Questions totales disponibles
  questionsAnswered: number;      // Questions répondues
  correctAnswers: number;         // Réponses correctes
  averageAccuracy: number;        // Taux de réussite moyen (%)
  totalTimeSpent: number;         // Temps total en minutes
  currentStreak: number;          // Jours consécutifs de révision
  longestStreak: number;          // Meilleur streak
  lastSessionDate?: string;       // Date ISO 8601 dernière session
  notionsDueToday: number;        // Notions à réviser aujourd'hui
  notionsDueThisWeek: number;     // Notions à réviser cette semaine
  masteryByChapter: {[chapterId: string]: ProgressStats}; // Maîtrise par chapitre
  masteryByDifficulty: {[difficulty: string]: ProgressStats}; // Maîtrise par difficulté
}

/**
 * Helpers pour navigation dans la structure
 */
export interface StructureHelpers {
  /**
   * Trouve une notion par son ID
   */
  findNotion(structure: SubjectStructure, notionId: string): Notion | undefined;
  
  /**
   * Récupère toutes les notions d'un chapitre
   */
  getChapterNotions(structure: SubjectStructure, chapterId: string): Notion[];
  
  /**
   * Récupère toutes les notions d'une matière (flat)
   */
  getAllNotions(structure: SubjectStructure): Notion[];
  
  /**
   * Filtre les notions par tags
   */
  filterNotionsByTags(structure: SubjectStructure, tags: string[]): Notion[];
  
  /**
   * Calcule les statistiques de progression pour un élément
   */
  calculateProgressStats(notionIds: string[], progressMap: Map<string, NotionProgress>): ProgressStats;
}
