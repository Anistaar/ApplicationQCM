# 🎓 Plan de Développement - Système de Révision Espacée

## 📋 Vue d'ensemble

Transformation de Text2Quiz VIP en système complet de révision espacée avec suivi de progression granulaire par notion.

---

## 🏗️ Architecture du Système

### Structure Hiérarchique

```
MACRO (Matière)
├── Chapitre 1: Introduction
│   ├── I. Concepts fondamentaux
│   │   ├── 1. Définitions
│   │   │   ├── Notion: Macroéconomie
│   │   │   ├── Notion: Agrégats économiques
│   │   │   └── Notion: Modèles économiques
│   │   └── 2. Fonctions de l'État
│   │       ├── Notion: Affectation
│   │       ├── Notion: Redistribution
│   │       └── Notion: Stabilisation
│   └── II. Méthodologie
│       └── 1. Approches
│           ├── Notion: Statique vs Dynamique
│           └── Notion: Statique comparative
├── Chapitre 2: Consommation
│   ├── I. Théorie keynésienne
│   │   ├── 1. Fonction de consommation
│   │   │   ├── Notion: C = C0 + cY
│   │   │   ├── Notion: PMC et PME
│   │   │   └── Notion: Multiplicateur
│   │   └── 2. Loi psychologique
│   │       └── Notion: Propension à épargner
│   ├── II. Théories alternatives
│   │   ├── 1. Revenu relatif (Duesenberry)
│   │   ├── 2. Cycle de vie (Modigliani)
│   │   └── 3. Revenu permanent (Friedman)
│   └── III. Déterminants de l'épargne
│       ├── 1. Court terme
│       └── 2. Long terme
├── Chapitre 3: Investissement
│   ├── I. Composantes
│   ├── II. Accélérateur
│   ├── III. Taux d'intérêt (VAN, TRI)
│   └── IV. Financement
├── Chapitre 4: Modèle classique
│   ├── I. Principes
│   ├── II. Marché du travail
│   └── III. Dichotomie réel/monétaire
├── Chapitre 5: Modèle keynésien
│   ├── I. Demande effective
│   ├── II. Équilibre sous-emploi
│   └── III. Politique économique
├── 📐 FORMULES (Cross-cutting)
│   ├── Multiplicateur: k = 1/(1-c)
│   ├── VAN = -I + Σ(Rt-Ct)/(1+i)^t
│   ├── C = C0 + cY
│   ├── Yp = (1-λ)(Yt + λYt-1 + λ²Yt-2 + ...)
│   └── ... (toutes les formules importantes)
└── 👥 AUTEURS (Cross-cutting)
    ├── Keynes
    ├── Friedman
    ├── Modigliani
    ├── Duesenberry
    ├── Tobin
    └── ... (tous les économistes mentionnés)
```

### Schéma JSON

```typescript
interface SubjectStructure {
  id: string;
  name: string;
  chapters: Chapter[];
  crossCutting: {
    formulas: CrossCuttingCategory;
    authors: CrossCuttingCategory;
  };
}

interface Chapter {
  id: string; // "chap1"
  name: string; // "Introduction à la macroéconomie"
  sections: Section[];
  questionCount: number;
  progress: ProgressStats;
}

interface Section {
  id: string; // "chap1.I"
  romanNumeral: string; // "I"
  name: string; // "Concepts fondamentaux"
  subsections: SubSection[];
  questionCount: number;
  progress: ProgressStats;
}

interface SubSection {
  id: string; // "chap1.I.1"
  number: string; // "1"
  name: string; // "Définitions"
  notions: Notion[];
  questionCount: number;
  progress: ProgressStats;
}

interface Notion {
  id: string; // "chap1.I.1.macro-def"
  name: string; // "Macroéconomie - Définition"
  description: string;
  tags: string[]; // Tags pour filtrer les questions
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  estimatedTime: number; // minutes
  relatedNotions: string[]; // IDs d'autres notions liées
  relatedAuthors?: string[]; // IDs d'auteurs liés
  relatedFormulas?: string[]; // IDs de formules liées
}

interface CrossCuttingCategory {
  id: string;
  name: string;
  items: CrossCuttingItem[];
}

interface CrossCuttingItem {
  id: string; // "keynes"
  name: string; // "John Maynard Keynes"
  description: string;
  tags: string[];
  relatedNotions: string[]; // Notions où l'auteur/formule apparaît
  questionCount: number;
}

interface ProgressStats {
  totalNotions: number;
  masteredNotions: number; // masteryLevel === 3
  inProgressNotions: number; // masteryLevel > 0 && < 3
  newNotions: number; // masteryLevel === 0
  percentageComplete: number; // (masteredNotions / totalNotions) * 100
}
```

---

## 📊 Système de Progression

### Modèle de Maîtrise

```typescript
interface NotionProgress {
  notionId: string;
  masteryLevel: 0 | 1 | 2 | 3; // 0=nouveau, 3=maîtrisé
  consecutiveCorrect: number; // Compteur pour atteindre niveau suivant
  totalAttempts: number;
  correctAttempts: number;
  lastReview: Date;
  nextReviewDate: Date;
  reviewHistory: ReviewAttempt[];
  interval: number; // Jours avant prochaine révision
  easeFactor: number; // Pour SM-2 (1.3 à 2.5)
}

interface ReviewAttempt {
  date: Date;
  correct: boolean;
  timeSpent: number; // secondes
  difficulty: 'easy' | 'medium' | 'hard'; // Auto-évaluation optionnelle
}
```

### Règles de Progression

1. **Nouveau (Level 0)**
   - Jamais vu
   - Icône: ⚪
   - nextReviewDate: immédiat

2. **En apprentissage (Level 1)**
   - 1 réussite
   - Icône: 🔴
   - Intervalle: 1 jour
   - Besoin: 2 réussites consécutives pour passer Level 2

3. **En consolidation (Level 2)**
   - 2 réussites consécutives
   - Icône: 🟡
   - Intervalle: 3 jours
   - Besoin: 1 réussite pour passer Level 3

4. **Maîtrisé (Level 3)**
   - 3 réussites consécutives
   - Icône: 🟢
   - Intervalles croissants: 7j → 14j → 30j → 60j → 90j
   - Une erreur ramène à Level 2

### Algorithme de Révision Espacée (SM-2 Simplifié)

```typescript
function updateNotionProgress(
  progress: NotionProgress,
  correct: boolean
): NotionProgress {
  const now = new Date();
  
  // Enregistrer la tentative
  progress.reviewHistory.push({
    date: now,
    correct,
    timeSpent: 0 // À implémenter
  });
  
  progress.totalAttempts++;
  progress.lastReview = now;
  
  if (correct) {
    progress.correctAttempts++;
    progress.consecutiveCorrect++;
    
    // Progression de niveau
    if (progress.masteryLevel === 0 && progress.consecutiveCorrect >= 1) {
      progress.masteryLevel = 1;
      progress.interval = 1;
      progress.consecutiveCorrect = 0;
    } else if (progress.masteryLevel === 1 && progress.consecutiveCorrect >= 2) {
      progress.masteryLevel = 2;
      progress.interval = 3;
      progress.consecutiveCorrect = 0;
    } else if (progress.masteryLevel === 2 && progress.consecutiveCorrect >= 1) {
      progress.masteryLevel = 3;
      progress.interval = 7;
      progress.consecutiveCorrect = 0;
    } else if (progress.masteryLevel === 3) {
      // Augmenter l'intervalle (SM-2)
      progress.easeFactor = Math.max(1.3, progress.easeFactor + 0.1);
      progress.interval = Math.ceil(progress.interval * progress.easeFactor);
    }
  } else {
    // Erreur: réinitialiser le compteur, réduire le niveau
    progress.consecutiveCorrect = 0;
    
    if (progress.masteryLevel === 3) {
      progress.masteryLevel = 2;
      progress.interval = 1; // Revoir demain
    } else if (progress.masteryLevel === 2) {
      progress.masteryLevel = 1;
      progress.interval = 1;
    } else if (progress.masteryLevel === 1) {
      progress.interval = 1; // Rester Level 1
    }
    
    // Réduire easeFactor
    progress.easeFactor = Math.max(1.3, progress.easeFactor - 0.2);
  }
  
  // Calculer nextReviewDate
  progress.nextReviewDate = new Date(now.getTime() + progress.interval * 24 * 60 * 60 * 1000);
  
  return progress;
}
```

### Sélection des Notions à Réviser

```typescript
function getDueNotions(
  subjectId: string,
  maxNotions: number = 10
): Notion[] {
  const now = new Date();
  const allNotions = getAllNotions(subjectId);
  
  // Catégoriser
  const overdue = allNotions.filter(n => {
    const progress = getNotionProgress(subjectId, n.id);
    return progress && progress.nextReviewDate < now;
  });
  
  const new = allNotions.filter(n => {
    const progress = getNotionProgress(subjectId, n.id);
    return !progress || progress.masteryLevel === 0;
  });
  
  const weak = allNotions.filter(n => {
    const progress = getNotionProgress(subjectId, n.id);
    return progress && progress.masteryLevel === 1 && progress.nextReviewDate >= now;
  });
  
  // Priorisation
  const selected: Notion[] = [];
  
  // 1. Priorité absolue: notions en retard
  selected.push(...overdue.slice(0, Math.min(5, maxNotions)));
  
  // 2. Mélanger nouvelles et faibles (ratio 2:1)
  const remaining = maxNotions - selected.length;
  const newCount = Math.ceil(remaining * 0.6);
  const weakCount = remaining - newCount;
  
  selected.push(...new.slice(0, newCount));
  selected.push(...weak.slice(0, weakCount));
  
  // Mélanger
  return shuffleArray(selected);
}
```

---

## 🎯 Interface Utilisateur

### 1. Dashboard Principal (index.html)

```
┌─────────────────────────────────────────────────┐
│ 🎓 Text2Quiz VIP               ☀️/🌙 [Toggle]  │
├─────────────────────────────────────────────────┤
│ 📅 Révisions du Jour                            │
│                                                  │
│ 🔥 Série actuelle: 7 jours                      │
│ 📚 5 notions à réviser                          │
│ ⚪ 3 nouvelles notions disponibles              │
│ 🟢 23/89 notions maîtrisées (26%)               │
│                                                  │
│ [🚀 Commencer les révisions]                    │
├─────────────────────────────────────────────────┤
│ 📚 Matières                                     │
│                                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │ 📊 MACRO│ │ 🏛️ INST │ │ 📈 STATS│            │
│ │ ████░░  │ │ ███░░░  │ │ ██░░░░  │            │
│ │ 26%     │ │ 18%     │ │ 12%     │            │
│ └─────────┘ └─────────┘ └─────────┘            │
└─────────────────────────────────────────────────┘
```

### 2. Vue Matière avec Plan Hiérarchique

```
┌─────────────────────────────────────────────────┐
│ ◀ Retour    📊 Macroéconomie                    │
├─────────────────────────────────────────────────┤
│ Progression globale: ████████░░ 26% (23/89)     │
├─────────────────────────────────────────────────┤
│                                                  │
│ ▼ Chapitre 1: Introduction        ████░░ 40%   │
│   │                                              │
│   ├─▶ I. Concepts fondamentaux    ███░░ 60%    │
│   │   │                                         │
│   │   ├─ 1. Définitions           ████░ 80%    │
│   │   │   ├ 🟢 Macroéconomie (3/3)             │
│   │   │   ├ 🟡 Agrégats (2/3)                  │
│   │   │   └ 🔴 Modèles (1/3)                   │
│   │   │                                         │
│   │   └─ 2. Fonctions État        ██░░░ 40%    │
│   │       ├ 🟢 Affectation (3/3)               │
│   │       ├ ⚪ Redistribution (0/3)             │
│   │       └ ⚪ Stabilisation (0/3)              │
│   │                                              │
│   └─▶ II. Méthodologie            ███░░ 50%    │
│       └─ 1. Approches              ███░░ 50%    │
│           ├ 🟡 Statique (2/3)                   │
│           └ ⚪ Dynamique (0/3)                  │
│                                                  │
│ ▶ Chapitre 2: Consommation        ███░░ 15%    │
│                                                  │
│ ▶ Chapitre 3: Investissement      ██░░░ 10%    │
│                                                  │
│ 📐 FORMULES (12 formules)         █░░░░ 8%     │
│ ├ 🟢 Multiplicateur k=1/(1-c)                   │
│ ├ ⚪ VAN                                        │
│ └ ⚪ TRI                                        │
│                                                  │
│ 👥 AUTEURS (8 auteurs)            ██░░░ 25%    │
│ ├ 🟢 Keynes                                     │
│ ├ 🟡 Friedman                                   │
│ └ ⚪ Modigliani                                 │
│                                                  │
├─────────────────────────────────────────────────┤
│ [📋 Voir plan complet] [🎯 Mode révision]      │
└─────────────────────────────────────────────────┘
```

### 3. Interface de Quiz (quiz.html)

```
┌─────────────────────────────────────────────────┐
│ Question 3/10        Notion: Multiplicateur     │
│ ████████░░ 30%                                   │
├─────────────────────────────────────────────────┤
│                                                  │
│ Si la propension marginale à consommer (c) est  │
│ de 0,8, quelle est la valeur du multiplicateur  │
│ keynésien ?                                      │
│                                                  │
│ ○ A. 2                                           │
│ ○ B. 4                                           │
│ ○ C. 5                                           │
│ ○ D. 8                                           │
│                                                  │
│ [Valider]                                        │
│                                                  │
│ ⏱️ 00:23                                         │
└─────────────────────────────────────────────────┘

Après validation:

┌─────────────────────────────────────────────────┐
│ ✅ Correct !                                     │
│                                                  │
│ 💡 Explication:                                  │
│ Le multiplicateur k = 1/(1-c)                   │
│ k = 1/(1-0,8) = 1/0,2 = 5                       │
│                                                  │
│ 📈 Progression: Multiplicateur 🟡 → 🟢          │
│ Vous maîtrisez maintenant cette notion !        │
│ Prochaine révision: dans 7 jours                │
│                                                  │
│ [Question suivante →]                            │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ Sprints de Développement

### Sprint 1: Analyse & Architecture (Jours 1-2)
- ✅ Analyser tous les fichiers MACRO existants
- ✅ Inventorier les 90+ questions avec leurs thèmes
- ✅ Définir le schéma JSON complet
- ✅ Créer un exemple de structure pour 1 chapitre
- 📦 **Livrable**: `MACRO_INVENTORY.md`, `structure-schema.ts`

### Sprint 2: Structure MACRO Complète (Jours 3-4)
- ✅ Rédiger `MACRO_structure.json` avec tous les chapitres
- ✅ Définir toutes les notions (au moins 80-100)
- ✅ Créer les sections Formules et Auteurs
- ✅ Établir les relations entre notions/auteurs/formules
- 📦 **Livrable**: `src/database/structures/MACRO_structure.json`

### Sprint 3: Tagging des Questions (Jours 5-6)
- ✅ Parcourir les 90+ questions MACRO
- ✅ Ajouter tags précis via `@themes:` dans les .txt
- ✅ Vérifier que chaque notion a au moins 2-3 questions
- ✅ Tags cross-cutting pour auteurs et formules
- 📦 **Livrable**: Tous fichiers .txt taggés, `TAGGING_REPORT.md`

### Sprint 4: Système de Progression (Jours 7-8)
- ✅ Créer `AdvancedProgress.ts` avec NotionProgress
- ✅ Implémenter `updateNotionProgress()` avec SM-2
- ✅ Fonctions: `getDueNotions()`, `getProgressStats()`
- ✅ Tests unitaires pour l'algorithme
- 📦 **Livrable**: `src/database/AdvancedProgress.ts`, tests

### Sprint 5: Persistance & LocalStorage (Jour 9)
- ✅ Structure localStorage: `text2quiz_progress_v2`
- ✅ Sauvegarde après chaque réponse
- ✅ Fonctions export/import JSON
- ✅ Migration depuis SimpleProgress si existe
- 📦 **Livrable**: Système de persistance complet

### Sprint 6: Navigation Hiérarchique UI (Jours 10-11)
- ✅ Charger et afficher MACRO_structure.json
- ✅ Composants: Chapter, Section, SubSection, Notion
- ✅ Expandable/collapsible avec animations
- ✅ Icônes de maîtrise par notion
- 📦 **Livrable**: Interface de navigation complète

### Sprint 7: Barres de Progression (Jour 12)
- ✅ Progress bars par notion (X/3 maîtrises)
- ✅ Progress bars par section/chapitre (%)
- ✅ Progress globale matière
- ✅ Codes couleur (rouge/orange/vert)
- 📦 **Livrable**: Système de visualisation progression

### Sprint 8: Dashboard Révisions Quotidiennes (Jour 13)
- ✅ Page d'accueil avec révisions du jour
- ✅ Affichage: notions dues, nouvelles, statistiques
- ✅ Streak counter (jours consécutifs)
- ✅ Bouton "Commencer révisions"
- 📦 **Livrable**: Dashboard fonctionnel

### Sprint 9: Mode Révision Adaptative (Jour 14)
- ✅ `getAdaptiveQuestions()` avec priorisation
- ✅ Mélange notions dues + nouvelles
- ✅ Sessions limitées à 10-15 questions
- ✅ Sélection intelligente selon progression
- 📦 **Livrable**: Algorithme adaptatif fonctionnel

### Sprint 10: Interface Quiz Complète (Jours 15-16)
- ✅ quiz.html avec affichage questions
- ✅ Validation réponses + feedback immédiat
- ✅ Affichage notion en cours
- ✅ Progression visuelle (X/10)
- ✅ Écran résultats avec impact sur maîtrise
- 📦 **Livrable**: Interface de quiz complète

### Sprint 11: Intégration & Sauvegarde (Jour 17)
- ✅ Connecter quiz → progression
- ✅ Sauvegarde après chaque réponse
- ✅ Mise à jour temps réel des icônes
- ✅ Calcul nextReviewDate automatique
- 📦 **Livrable**: Cycle complet fonctionnel

### Sprint 12: Cross-Cutting (Formules/Auteurs) (Jour 18)
- ✅ Onglets séparés pour Formules et Auteurs
- ✅ Affichage avec notions liées
- ✅ Quiz par auteur ou par formule
- ✅ Progression indépendante
- 📦 **Livrable**: Sections transversales opérationnelles

### Sprint 13: Statistiques Détaillées (Jour 19)
- ✅ Page stats.html
- ✅ Graphiques progression (Chart.js)
- ✅ Heatmap révisions (calendrier)
- ✅ Répartition par chapitre
- ✅ Temps d'étude, taux réussite
- 📦 **Livrable**: Dashboard statistiques complet

### Sprint 14: Dark Mode & Responsive (Jour 20)
- ✅ Vérifier dark mode sur toutes pages
- ✅ Adaptation mobile/tablette
- ✅ Tests sur différents écrans
- ✅ Animations smooth
- 📦 **Livrable**: UI finalisée tous devices

### Sprint 15: Tests Complets MACRO (Jours 21-22)
- ✅ Tester toute la chaîne: plan → quiz → stats
- ✅ Vérifier accès à toutes les questions
- ✅ Simuler plusieurs jours de révisions
- ✅ Tests de performance (90+ questions)
- 📦 **Livrable**: Suite de tests, rapport bugs

### Sprint 16: Documentation (Jour 23)
- ✅ GUIDE_UTILISATEUR.md
- ✅ Tooltips intégrés (première utilisation)
- ✅ FAQ
- ✅ Documentation technique
- 📦 **Livrable**: Documentation complète

### Sprint 17: Optimisations & Polish (Jour 24)
- ✅ Lazy loading des questions
- ✅ Cache localStorage optimisé
- ✅ Error handling robuste
- ✅ Accessibilité (ARIA, keyboard)
- 📦 **Livrable**: Application optimisée

### Sprint 18: Validation Finale (Jour 25)
- ✅ Tests multi-navigateurs
- ✅ Tests multi-jours (simulation)
- ✅ Validation révision espacée
- ✅ Correction bugs finaux
- 📦 **Livrable**: Application production-ready

---

## 📐 Exemple de Structure JSON (Chapitre 1)

```json
{
  "id": "MACRO",
  "name": "Macroéconomie S1",
  "version": "2.0",
  "lastUpdate": "2025-11-30",
  "chapters": [
    {
      "id": "chap1",
      "name": "Introduction à la macroéconomie",
      "sections": [
        {
          "id": "chap1.I",
          "romanNumeral": "I",
          "name": "Concepts fondamentaux",
          "subsections": [
            {
              "id": "chap1.I.1",
              "number": "1",
              "name": "Définitions",
              "notions": [
                {
                  "id": "chap1.I.1.macro-def",
                  "name": "Définition de la macroéconomie",
                  "description": "Étude des phénomènes économiques globaux: chômage, inflation, croissance",
                  "tags": ["Chapitre1", "Introduction", "Définitions", "Macroéconomie"],
                  "difficulty": "Facile",
                  "estimatedTime": 5,
                  "relatedNotions": ["chap1.I.1.agregats"],
                  "relatedAuthors": []
                },
                {
                  "id": "chap1.I.1.agregats",
                  "name": "Agrégats économiques",
                  "description": "Quantités globales homogènes (PIB, consommation, investissement...)",
                  "tags": ["Chapitre1", "Introduction", "Définitions", "Agrégats"],
                  "difficulty": "Facile",
                  "estimatedTime": 5,
                  "relatedNotions": ["chap1.I.1.macro-def"],
                  "relatedAuthors": []
                },
                {
                  "id": "chap1.I.1.modeles",
                  "name": "Modèles économiques",
                  "description": "Représentations simplifiées: littéraire, mathématique, graphique",
                  "tags": ["Chapitre1", "Introduction", "Définitions", "Modèles"],
                  "difficulty": "Moyen",
                  "estimatedTime": 7,
                  "relatedNotions": ["chap1.II.1.statique"],
                  "relatedAuthors": []
                }
              ]
            },
            {
              "id": "chap1.I.2",
              "number": "2",
              "name": "Fonctions de l'État",
              "notions": [
                {
                  "id": "chap1.I.2.affectation",
                  "name": "Fonction d'affectation",
                  "description": "Allocation optimale des ressources",
                  "tags": ["Chapitre1", "Introduction", "État", "Affectation"],
                  "difficulty": "Moyen",
                  "estimatedTime": 6,
                  "relatedNotions": ["chap1.I.2.redistribution", "chap1.I.2.stabilisation"],
                  "relatedAuthors": []
                },
                {
                  "id": "chap1.I.2.redistribution",
                  "name": "Fonction de redistribution",
                  "description": "Répartition équitable des richesses",
                  "tags": ["Chapitre1", "Introduction", "État", "Redistribution"],
                  "difficulty": "Moyen",
                  "estimatedTime": 6,
                  "relatedNotions": ["chap1.I.2.affectation"],
                  "relatedAuthors": []
                },
                {
                  "id": "chap1.I.2.stabilisation",
                  "name": "Fonction de stabilisation",
                  "description": "Régulation conjoncturelle (chômage, inflation)",
                  "tags": ["Chapitre1", "Introduction", "État", "Stabilisation"],
                  "difficulty": "Moyen",
                  "estimatedTime": 6,
                  "relatedNotions": ["chap4.keynesian"],
                  "relatedAuthors": ["keynes"]
                }
              ]
            }
          ]
        },
        {
          "id": "chap1.II",
          "romanNumeral": "II",
          "name": "Méthodologie",
          "subsections": [
            {
              "id": "chap1.II.1",
              "number": "1",
              "name": "Approches",
              "notions": [
                {
                  "id": "chap1.II.1.statique",
                  "name": "Modèle statique vs dynamique",
                  "description": "Statique ignore le temps, dynamique étudie l'évolution temporelle",
                  "tags": ["Chapitre1", "Méthodologie", "Statique", "Dynamique"],
                  "difficulty": "Moyen",
                  "estimatedTime": 8,
                  "relatedNotions": ["chap1.II.1.comparative"],
                  "relatedAuthors": []
                },
                {
                  "id": "chap1.II.1.comparative",
                  "name": "Statique comparative",
                  "description": "Comparaison de deux équilibres sans décrire la trajectoire",
                  "tags": ["Chapitre1", "Méthodologie", "Statique", "Comparative"],
                  "difficulty": "Moyen",
                  "estimatedTime": 7,
                  "relatedNotions": ["chap1.II.1.statique"],
                  "relatedAuthors": []
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "crossCutting": {
    "formulas": {
      "id": "formulas",
      "name": "📐 Formules clés",
      "items": [
        {
          "id": "formula-multiplicateur",
          "name": "Multiplicateur keynésien",
          "description": "k = 1/(1-c) où c est la propension marginale à consommer",
          "tags": ["Formule", "Keynes", "Multiplicateur", "Consommation"],
          "relatedNotions": ["chap2.I.1.multiplicateur", "chap2.I.1.pmc"],
          "questionCount": 0
        },
        {
          "id": "formula-van",
          "name": "Valeur Actuelle Nette",
          "description": "VAN = -I + Σ(Rt-Ct)/(1+i)^t",
          "tags": ["Formule", "VAN", "Investissement", "TauxIntérêt"],
          "relatedNotions": ["chap3.III.1.van"],
          "questionCount": 0
        }
      ]
    },
    "authors": {
      "id": "authors",
      "name": "👥 Économistes",
      "items": [
        {
          "id": "keynes",
          "name": "John Maynard Keynes",
          "description": "Théorie de la demande effective, multiplicateur, sous-emploi",
          "tags": ["Auteur", "Keynes", "Consommation", "Investissement", "ModèleKeynésien"],
          "relatedNotions": [
            "chap2.I.1.fonction-conso",
            "chap2.I.1.multiplicateur",
            "chap2.I.2.loi-psycho",
            "chap4.I.1.demande-effective"
          ],
          "questionCount": 0
        },
        {
          "id": "friedman",
          "name": "Milton Friedman",
          "description": "Théorie du revenu permanent, monétarisme",
          "tags": ["Auteur", "Friedman", "RevenuPermanent", "Monétarisme"],
          "relatedNotions": [
            "chap2.II.3.revenu-permanent",
            "chap2.II.3.yt-yp"
          ],
          "questionCount": 0
        },
        {
          "id": "modigliani",
          "name": "Franco Modigliani",
          "description": "Théorie du cycle de vie, lissage de la consommation",
          "tags": ["Auteur", "Modigliani", "CycleVie", "Consommation"],
          "relatedNotions": [
            "chap2.II.2.cycle-vie",
            "chap2.II.2.lissage"
          ],
          "questionCount": 0
        }
      ]
    }
  }
}
```

---

## 🎯 Résultat Final Attendu

### Fonctionnalités Complètes

1. **Navigation intuitive** dans une structure hiérarchique complète
2. **Progression granulaire** par notion (maîtrise sur 4 niveaux)
3. **Révision espacée** automatique avec algorithme SM-2
4. **Dashboard quotidien** avec notions à réviser
5. **Statistiques détaillées** avec graphiques
6. **Mode adaptatif** intelligent selon la progression
7. **Cross-cutting** pour formules et auteurs
8. **Persistance complète** en localStorage
9. **Dark mode** sur toutes les pages
10. **Mobile responsive** et accessible

### Métriques de Succès

- ✅ 100% des questions MACRO accessibles
- ✅ Chaque notion a au moins 2 questions
- ✅ Progression persistante entre sessions
- ✅ Révision espacée fonctionnelle sur 7+ jours
- ✅ Dashboard mis à jour en temps réel
- ✅ Performance fluide avec 90+ questions
- ✅ Zero perte de données (backup localStorage)

---

## 📅 Timeline

**Durée totale estimée**: 25 jours ouvrés (5 semaines)

- **Semaine 1** (J1-J5): Sprints 1-3 - Architecture & Structure
- **Semaine 2** (J6-J10): Sprints 4-6 - Progression & UI Navigation
- **Semaine 3** (J11-J15): Sprints 7-10 - Dashboard & Quiz
- **Semaine 4** (J16-J20): Sprints 11-14 - Intégration & Polish
- **Semaine 5** (J21-J25): Sprints 15-18 - Tests & Validation

---

## 🚀 Prochaines Étapes

**À démarrer immédiatement**: Sprint 1 - Analyse & Architecture

1. Examiner tous les fichiers MACRO
2. Créer l'inventaire des questions
3. Définir le schéma TypeScript complet
4. Valider l'architecture avec des exemples

**Vous êtes prêt à commencer ?**
