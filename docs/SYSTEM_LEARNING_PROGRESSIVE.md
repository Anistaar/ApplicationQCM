# 🎓 SYSTÈME D'APPRENTISSAGE PROGRESSIF - SPACED REPETITION

## 📊 Architecture du Système

### 1. TRACKING DES NOTIONS

Chaque **notion/concept** est tracké avec un score de maîtrise :

```typescript
interface NotionMastery {
  notionId: string;           // Ex: "chap1_fonction_keynes"
  name: string;               // "Fonction de consommation keynésienne"
  
  // Score de maîtrise (0-100)
  masteryScore: number;       // 0 = jamais vu, 100 = parfaitement maîtrisé
  
  // Statistiques
  totalSeen: number;          // Nombre de fois vue
  correctAnswers: number;     // Bonnes réponses
  wrongAnswers: number;       // Mauvaises réponses
  
  // Spaced repetition
  lastReview: number;         // Timestamp dernière révision
  nextReview: number;         // Timestamp prochaine révision recommandée
  interval: number;           // Intervalle actuel (en jours)
  
  // Liens avec questions
  questionIds: string[];      // IDs des questions liées à cette notion
  
  // Niveau de difficulté adaptatif
  currentDifficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  
  // Historique
  history: {
    date: number;
    score: number;
    questionsAnswered: number;
    correctRate: number;
  }[];
}
```

### 2. SÉQUENÇAGE INTELLIGENT (TYPE DUOLINGO)

**Principe : Mini-sessions de 5 questions avec répétition**

```
┌────────────────────────────────────────────────────────┐
│  SESSION 1/5 : Introduction (5 nouvelles questions)    │
├────────────────────────────────────────────────────────┤
│  Q1: Qu'est-ce que le PIB ?              [✓]          │
│  Q2: Définir la consommation              [✓]          │
│  Q3: Qu'est-ce que l'épargne ?           [✗]          │
│  Q4: Revenu disponible = ?                [✓]          │
│  Q5: Propension marginale à...           [✗]          │
│                                                        │
│  Score: 3/5 (60%)                                      │
│  → Questions à revoir: Q3, Q5                          │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  SESSION 2/5 : Renforcement + Nouvelles               │
├────────────────────────────────────────────────────────┤
│  Q3: Qu'est-ce que l'épargne ? (REVU)    [✓]          │
│  Q5: Propension marginale... (REVU)       [✓]          │
│  Q6: Équation keynésienne C = ?          [✓]          │
│  Q7: Multiplicateur = ?                   [✗]          │
│  Q8: Fonction d'épargne S = ?            [✓]          │
│                                                        │
│  Score: 4/5 (80%)                                      │
│  → Progression: +20%                                   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  SESSION 3/5 : Consolidation                          │
├────────────────────────────────────────────────────────┤
│  Q7: Multiplicateur = ? (REVU)            [✓]          │
│  Q1: Qu'est-ce que le PIB ? (RÉVISION)   [✓]          │
│  Q9: c1 représente quoi ?                 [✓]          │
│  Q10: Si c1 = 0.8, k = ?                  [✓]          │
│  Q4: Revenu dispo... (RÉVISION)           [✓]          │
│                                                        │
│  Score: 5/5 (100%)  🎉 PARFAIT!                        │
└────────────────────────────────────────────────────────┘
```

**Algorithme de séquençage :**

```javascript
function createLearningPath(questions, userProgress) {
  // 1. Trier les questions par priorité
  const prioritized = prioritizeQuestions(questions, userProgress);
  
  // 2. Créer des sessions de 5 questions
  const sessions = [];
  let newQuestions = prioritized.filter(q => !q.everSeen);
  let reviewQuestions = prioritized.filter(q => q.needsReview);
  
  let sessionNum = 1;
  const maxSessions = Math.ceil(questions.length / 3); // Max 3 nouvelles par session
  
  while (sessionNum <= maxSessions && (newQuestions.length > 0 || reviewQuestions.length > 0)) {
    const session = {
      id: sessionNum,
      questions: [],
      type: 'mixed'
    };
    
    // Session 1 : 5 nouvelles
    if (sessionNum === 1) {
      session.questions = newQuestions.slice(0, 5);
      session.type = 'introduction';
      newQuestions = newQuestions.slice(5);
    }
    // Sessions suivantes : Mix review + nouvelles
    else {
      // 2 questions à revoir (ratées précédemment)
      const toReview = reviewQuestions.slice(0, 2);
      session.questions.push(...toReview);
      reviewQuestions = reviewQuestions.slice(2);
      
      // 3 nouvelles questions
      const newOnes = newQuestions.slice(0, 3);
      session.questions.push(...newOnes);
      newQuestions = newQuestions.slice(3);
      
      session.type = 'reinforcement';
    }
    
    // Toutes les 3 sessions : session de révision pure
    if (sessionNum % 3 === 0) {
      session.questions = [
        ...reviewQuestions.slice(0, 3),
        ...getRandomPreviousQuestions(2, userProgress)
      ];
      session.type = 'consolidation';
    }
    
    sessions.push(session);
    sessionNum++;
  }
  
  return sessions;
}
```

### 3. SCORING ADAPTATIF (SPACED REPETITION)

**Basé sur l'algorithme SM-2 (SuperMemo)**

```javascript
function updateNotionMastery(notion, wasCorrect) {
  const now = Date.now();
  
  if (wasCorrect) {
    // Augmenter le score
    notion.masteryScore = Math.min(100, notion.masteryScore + 10);
    notion.correctAnswers++;
    
    // Augmenter l'intervalle (spaced repetition)
    if (notion.masteryScore >= 80) {
      notion.interval = notion.interval * 2; // Double l'intervalle
    } else {
      notion.interval = notion.interval * 1.5;
    }
  } else {
    // Diminuer le score
    notion.masteryScore = Math.max(0, notion.masteryScore - 15);
    notion.wrongAnswers++;
    
    // Réinitialiser l'intervalle
    notion.interval = 1; // Revoir demain
  }
  
  // Calculer la prochaine révision
  notion.lastReview = now;
  notion.nextReview = now + (notion.interval * 24 * 60 * 60 * 1000);
  
  // Ajuster la difficulté automatiquement
  const successRate = notion.correctAnswers / (notion.correctAnswers + notion.wrongAnswers);
  
  if (successRate >= 0.9) {
    notion.currentDifficulty = increaseDifficulty(notion.currentDifficulty);
  } else if (successRate <= 0.5) {
    notion.currentDifficulty = decreaseDifficulty(notion.currentDifficulty);
  }
  
  // Historique
  notion.history.push({
    date: now,
    score: notion.masteryScore,
    questionsAnswered: notion.totalSeen,
    correctRate: successRate
  });
  
  return notion;
}
```

### 4. INTERFACE UTILISATEUR

```
┌─────────────────────────────────────────────────────────┐
│  📊 MACROÉCONOMIE - CHAPITRE 1 : CONSOMMATION          │
│                                                         │
│  🎯 Votre Progression                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Notions maîtrisées   ████████░░░░  8/12 (67%)   │  │
│  │ Questions réussies   ██████████░░  52/72 (72%)  │  │
│  │ Niveau actuel        ⭐⭐⭐☆☆  Intermédiaire    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  📚 Notions du Chapitre 1                               │
│                                                         │
│  ✅ Maîtrisé (80-100%)                                  │
│     ├─ Définition de la consommation      [95%] 🏆     │
│     ├─ Revenu disponible                  [88%] ⭐     │
│     └─ Propension moyenne à consommer     [82%] ⭐     │
│                                                         │
│  🔶 En cours (50-79%)                                   │
│     ├─ Propension marginale               [72%] 📊     │
│     ├─ Fonction keynésienne C = c0+c1Yd   [65%] 📊     │
│     └─ Multiplicateur keynésien           [58%] 📊     │
│                                                         │
│  ⚠️ À revoir (0-49%)                                   │
│     ├─ Théorie du revenu permanent        [35%] ⚠️     │
│     ├─ Cycle de vie (Modigliani)          [28%] ⚠️     │
│     └─ Taux d'épargne optimal             [12%] ❌     │
│                                                         │
│  🆕 Jamais vues (3 notions)                             │
│     ├─ Contrainte budgétaire              [--]         │
│     ├─ Effet richesse                     [--]         │
│     └─ Consommation agrégée               [--]         │
│                                                         │
│  ──────────────────────────────────────────────────    │
│                                                         │
│  🎮 MODES DE RÉVISION                                   │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │ 🚀 MODE ADAPTATIF  │  │ 🎯 MODE CIBLÉ      │        │
│  │                    │  │                    │        │
│  │ Séquence auto de   │  │ Choisir notions    │        │
│  │ 5 questions avec   │  │ spécifiques        │        │
│  │ révisions intégrées│  │                    │        │
│  │                    │  │ [Sélectionner...]  │        │
│  │ [DÉMARRER]         │  │                    │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │ 📅 RÉVISION DUE    │  │ 🔥 MODE MARATHON   │        │
│  │                    │  │                    │        │
│  │ 8 notions à revoir │  │ Toutes les notions │        │
│  │ aujourd'hui        │  │ d'affilée (72q)    │        │
│  │                    │  │                    │        │
│  │ [RÉVISER]          │  │ [COMMENCER]        │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                         │
│  ──────────────────────────────────────────────────    │
│                                                         │
│  📊 PROCHAINE SESSION ADAPTATIVE (Recommandée)          │
│                                                         │
│  Session 1/6 : Renforcement "Revenu permanent"         │
│  ├─ 2 questions ratées à revoir                        │
│  └─ 3 nouvelles questions progressives                 │
│                                                         │
│  [🎯 LANCER LA SESSION] (Durée estimée: 3 min)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5. DONNÉES DE TRACKING

**Fichier : `userProgress.json`**

```json
{
  "userId": "user_001",
  "subjects": {
    "MACRO": {
      "totalQuestions": 1210,
      "questionsAnswered": 324,
      "correctRate": 0.72,
      "currentLevel": 3,
      "
": 2150,
      
      "notions": {
        "chap1_def_consommation": {
          "notionId": "chap1_def_consommation",
          "name": "Définition de la consommation",
          "masteryScore": 95,
          "totalSeen": 12,
          "correctAnswers": 11,
          "wrongAnswers": 1,
          "lastReview": 1701177600000,
          "nextReview": 1701436800000,
          "interval": 3,
          "currentDifficulty": "Moyen",
          "questionIds": ["q_001", "q_002", "q_015"],
          "tags": ["Chapitre1", "Definitions", "Facile"]
        },
        
        "chap1_revenu_permanent": {
          "notionId": "chap1_revenu_permanent",
          "name": "Théorie du revenu permanent (Friedman)",
          "masteryScore": 35,
          "totalSeen": 8,
          "correctAnswers": 3,
          "wrongAnswers": 5,
          "lastReview": 1701091200000,
          "nextReview": 1701177600000,
          "interval": 1,
          "currentDifficulty": "Facile",
          "questionIds": ["q_045", "q_046", "q_047", "q_048"],
          "tags": ["Chapitre1", "Friedman", "Difficile"],
          "needsReview": true
        }
      },
      
      "sessionHistory": [
        {
          "date": 1701177600000,
          "duration": 180,
          "questionsAnswered": 5,
          "correctAnswers": 4,
          "notionsReviewed": ["chap1_def_consommation", "chap1_propensions"],
          "averageDifficulty": "Moyen"
        }
      ]
    }
  },
  
  "dailyGoals": {
    "questionsPerDay": 20,
    "currentStreak": 7,
    "longestStreak": 15
  }
}
```

### 6. MAPPING QUESTIONS → NOTIONS

**Fichier : `MACRO_notions_mapping.json`**

```json
{
  "subject": "MACRO",
  "notions": [
    {
      "id": "chap1_fonction_keynes",
      "name": "Fonction de consommation keynésienne",
      "chapter": "Chapitre 1",
      "description": "C = c0 + c1*Yd : équation fondamentale de la consommation",
      "prerequisites": ["chap1_def_consommation", "chap1_propensions"],
      "difficulty": "Moyen",
      "estimatedTime": 10,
      
      "questions": [
        {
          "id": "q_macro_025",
          "text": "Quelle est l'équation de la fonction de consommation keynésienne ?",
          "difficulty": "Facile",
          "type": "QR"
        },
        {
          "id": "q_macro_026",
          "text": "Dans C = c0 + c1*Yd, que représente c0 ?",
          "difficulty": "Moyen",
          "type": "QCM"
        },
        {
          "id": "q_macro_027",
          "text": "Si c1 = 0.8 et Yd = 1000, calculer C sachant c0 = 100",
          "difficulty": "Moyen",
          "type": "QR"
        },
        {
          "id": "q_macro_028",
          "text": "Expliquer pourquoi 0 < c1 < 1",
          "difficulty": "Difficile",
          "type": "OpenQ"
        }
      ]
    }
  ]
}
```

---

## 🎯 WORKFLOW COMPLET

### Scénario : Utilisateur sélectionne "Chapitre 1 : Consommation"

**Étape 1 : Analyse**
```javascript
// Récupérer les 192 questions du chapitre 1
const questions = getQuestionsByChapter('chap1');

// Récupérer la progression utilisateur
const progress = getUserProgress('MACRO', 'chap1');

// Identifier les notions
const notions = groupQuestionsByNotion(questions);
// Résultat : 12 notions, 192 questions
```

**Étape 2 : Priorisation**
```javascript
// Notions à revoir (score < 50)
const needsReview = notions.filter(n => n.masteryScore < 50);
// → 3 notions : revenu_permanent, cycle_vie, taux_epargne

// Notions en cours (50-79)
const inProgress = notions.filter(n => n.masteryScore >= 50 && n.masteryScore < 80);
// → 6 notions

// Notions jamais vues
const newNotions = notions.filter(n => n.totalSeen === 0);
// → 3 notions
```

**Étape 3 : Création du parcours**
```javascript
const learningPath = createAdaptivePath({
  needsReview: needsReview,      // 3 notions faibles
  inProgress: inProgress,         // 6 notions moyennes
  newNotions: newNotions,         // 3 notions nouvelles
  sessionSize: 5                  // 5 questions par session
});

// Résultat : 8 sessions de 5 questions
// Session 1 : 5 questions faciles sur notions faibles
// Session 2 : 2 review + 3 nouvelles
// Session 3 : Consolidation (5 review)
// Session 4-8 : Mix progressif
```

**Étape 4 : Affichage**
```
📊 PARCOURS ADAPTATIF GÉNÉRÉ

🎯 8 mini-sessions de 5 questions (40 questions total)
⏱️ Temps estimé : 25 minutes
📈 Difficulté : Progressive (Facile → Moyen → Difficile)

Session 1 : Révision "Revenu permanent" (5q) ⚠️
Session 2 : Renforcement + Nouvelles (5q)
Session 3 : Consolidation (5q) ✓
Session 4-6 : Progression normale (15q)
Session 7-8 : Challenge final (10q) 🏆

[🚀 COMMENCER LE PARCOURS]
```

---

## 💾 STOCKAGE ET SYNCHRONISATION

```javascript
// Local Storage
localStorage.setItem('userProgress_MACRO', JSON.stringify(progress));
localStorage.setItem('currentSession', JSON.stringify(currentSession));

// IndexedDB pour historique complet
db.progressHistory.add({
  date: Date.now(),
  subject: 'MACRO',
  chapter: 'chap1',
  session: sessionData
});
```

---

## ✅ RÉSUMÉ DES FONCTIONNALITÉS

1. ✅ **Tracking par notion** (score 0-100)
2. ✅ **Séquençage intelligent** (5 questions max par session)
3. ✅ **Spaced repetition** (algorithme SM-2)
4. ✅ **Difficulté adaptative** (augmente avec le score)
5. ✅ **Sessions mixtes** (review + nouvelles questions)
6. ✅ **Consolidation régulière** (toutes les 3 sessions)
7. ✅ **Progression visuelle** (barres + badges)
8. ✅ **Recommandations** (prochaine session suggérée)
9. ✅ **Daily streaks** (objectifs quotidiens)
10. ✅ **Historique détaillé** (graphiques de progression)

---

**Cette architecture est-elle validée ? Je lance l'implémentation ! 🚀**
