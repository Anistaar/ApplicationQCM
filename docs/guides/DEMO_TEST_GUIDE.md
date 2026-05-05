# 🧪 Matière TEST - Guide de Démonstration

## 🎯 Objectif

La matière **TEST** contient **20 questions** organisées pour démontrer **TOUTES les fonctionnalités** du système d'apprentissage adaptatif.

---

## 🚀 Accès Direct

**URL** : http://localhost:5175/demo-test.html

Cette page :
1. ✅ Importe automatiquement les 20 questions
2. ✅ Charge la structure hiérarchique (6 chapitres)
3. ✅ Vous redirige vers l'interface avec TEST pré-sélectionné

**Durée** : ~5 secondes

---

## 📚 Contenu de la matière TEST

### Structure Complète

```
🧪 TEST (20 questions)

📚 Chapitre 0 : Introduction aux QCM (3 questions)
├── Définitions de base (2q)
└── Types de questions (1q)

🎯 Chapitre 1 : Fonctionnalités Avancées (3 questions)
├── Apprentissage progressif (2q)
└── Interface utilisateur (1q)

🗂️ Chapitre 2 : Structure Hiérarchique (4 questions)
├── Organisation des questions (2q)
└── Sessions d'apprentissage (2q)

📊 Chapitre 3 : Statistiques et Progression (4 questions)
├── Système de tracking (2q)
└── XP et Niveaux (2q)

💾 Chapitre 4 : Import et Export (3 questions)
├── Gestion des fichiers (2q)
└── Structure JSON (1q)

⚙️ Chapitre 5 : Technologies (3 questions)
├── Stack technique (2q)
└── Performance et optimisation (1q)
```

### Répartition par Difficulté

- 🟢 **Facile** : 7 questions
- 🟡 **Moyen** : 11 questions
- 🔴 **Difficile** : 2 questions

### Tags Utilisés

- `Definitions`, `Types_Questions`
- `Apprentissage_Progressif`, `Interface`
- `Organisation`, `Sessions`
- `Tracking`, `XP_Niveau`
- `Gestion_Fichiers`, `Structure_JSON`
- `Stack_Technique`, `Performance`

---

## ✨ Fonctionnalités à Tester

### 1. Vue Hiérarchique

Après import, vous verrez :

```
🎯 Mode d'apprentissage
[ 🚀 Adaptatif ] [ 🎯 Manuel ] [ 📅 Révisions ] [ 🔥 Marathon ]

📚 Chapitre 0 : Introduction aux QCM (3 questions) ▶
📚 Chapitre 1 : Fonctionnalités Avancées (3 questions) ▶
...
```

**Action** : Cliquez sur un chapitre pour le déplier.

---

### 2. Notions avec Maîtrise

Une fois déplié :

```
▼ Chapitre 0 : Introduction aux QCM (3 questions)
  ⚪ Définitions de base          Facile    2 questions    0%
  ⚪ Types de questions            Moyen     1 question     0%
```

**Icônes** :
- ⚪ = Jamais vu (nouveau)
- 🔴 = <50% (à revoir)
- 🟡 = 50-79% (en progression)
- 🟢 = 80-100% (maîtrisé)

**Action** : Cliquez sur une notion pour la sélectionner.

---

### 3. Mode Adaptatif (RECOMMANDÉ)

**Étapes** :
1. Sélectionner "🚀 Adaptatif"
2. Cliquer sur 1-2 notions (ou laisser vide pour tout)
3. Cliquer "🚀 Lancer le quiz"

**Résultat** :
```
📚 Parcours d'apprentissage créé!

🎯 Sessions: 4
📝 Total de questions: 20
⏱️ Durée estimée: 12 minutes
🔢 Notions couvertes: 10

Détails des sessions:
Session 1: introduction - 5q (3min)
Session 2: reinforcement - 5q (3min)
Session 3: reinforcement - 5q (3min)
Session 4: consolidation - 5q (3min)

✨ Chaque session mélange 2 questions de révision + 3 nouvelles!
```

---

### 4. Mode Manuel

**Étapes** :
1. Sélectionner "🎯 Manuel"
2. Déplier les chapitres
3. Cliquer sur plusieurs notions pour les sélectionner
4. Configurer le quiz (nombre, difficulté)
5. Lancer

**Avantage** : Contrôle total sur ce que vous voulez réviser.

---

### 5. Mode Révisions

**Étapes** :
1. Sélectionner "📅 Révisions"
2. Voir les notions dues (si vous avez déjà fait des sessions)
3. Lancer pour réviser uniquement ce qui est dû

**Note** : Si aucune notion n'est due, message : "🎉 Rien à réviser pour le moment!"

---

### 6. Mode Marathon

**Étapes** :
1. Sélectionner "🔥 Marathon"
2. Lancer pour faire TOUTES les questions d'affilée

**Usage** : Révision intensive avant un examen.

---

## 🎓 Scénario de Test Complet

### Session 1 : Découverte (5 minutes)

1. Ouvrir : http://localhost:5175/demo-test.html
2. Attendre l'import automatique
3. Cliquer "🚀 Accéder à la matière TEST"
4. Observer l'interface avec 6 chapitres
5. Déplier chaque chapitre pour voir les notions

### Session 2 : Mode Adaptatif (10 minutes)

1. Cliquer sur "🚀 Adaptatif"
2. NE PAS sélectionner de notion (pour tout prendre)
3. Cliquer "🚀 Lancer le quiz"
4. Observer le parcours généré (4 sessions)
5. Noter : 
   - Session 1 = 5 nouvelles questions
   - Session 2-3 = 2 révision + 3 nouvelles
   - Session 4 = 5 consolidation

### Session 3 : Sélection Ciblée (5 minutes)

1. Cliquer sur "🎯 Manuel"
2. Déplier "Chapitre 0"
3. Cliquer sur "Définitions de base" (devient bleu)
4. Voir en bas : "2 questions disponibles"
5. Lancer le quiz

### Session 4 : Progression (après quiz)

1. Retourner sur la matière TEST
2. Observer les icônes de maîtrise :
   - ⚪ → 🔴/🟡/🟢 selon vos réponses
3. Voir les pourcentages (ex: 75%)
4. Tester "📅 Révisions" pour voir les notions faibles

---

## 📊 Données Trackées

Après avoir répondu aux questions, vérifier dans la console (F12) :

```javascript
// Voir la progression
await progressTracker.getProgress('TEST')

// Voir une notion spécifique
await progressTracker.getNotionMastery('TEST', 'test_definitions')

// Résultat :
{
  masteryScore: 80,
  totalSeen: 5,
  correctAnswers: 4,
  wrongAnswers: 1,
  nextReview: 1732838400000, // timestamp
  interval: 3, // jours
  currentDifficulty: "Moyen"
}
```

---

## 🐛 Vérifications Techniques

### Fichiers créés

- ✅ `src/questions/TEST/TEST_MEGA.txt` (20 questions)
- ✅ `src/database/structures/TEST_structure.json` (hiérarchie)
- ✅ `demo-test.html` (page d'import auto)

### Import vérifié

```javascript
// Dans la console
const questions = await questionDB.getQuestionsBySubject('TEST');
console.log(questions.length); // Doit afficher 20

const subjects = await questionDB.getAllSubjects();
const test = subjects.find(s => s.id === 'TEST');
console.log(test); 
// {
//   id: 'TEST',
//   name: 'TEST',
//   questionCount: 20,
//   themeCount: 12
// }
```

---

## 🎯 Ce que ça démontre

| Fonctionnalité | Visible dans TEST |
|----------------|-------------------|
| Structure hiérarchique | ✅ 6 chapitres pliables |
| Notions avec maîtrise | ✅ 10 notions avec icônes |
| Tags multiples | ✅ 12 tags différents |
| 4 modes d'apprentissage | ✅ Tous testables |
| Sessions adaptatives | ✅ 4 sessions générées |
| Tracking progression | ✅ Scores 0-100% |
| Difficultés variées | ✅ 3 niveaux |
| Format text2quiz | ✅ 20 questions parsées |

---

## 🚀 Prochaines Étapes

Une fois TEST validé, vous pouvez :

1. **Importer les vraies matières** :
   - Ouvrir : http://localhost:5175/src/admin/import-auto.html
   - Importer MACRO, INSTIT, etc.

2. **Créer d'autres structures** :
   - Copier `TEST_structure.json`
   - Adapter pour INSTIT, STATS, etc.

3. **Développer l'interface de session** :
   - Créer `src/new-ui/session.html`
   - Afficher les 5 questions avec progression

---

**Résumé** : TEST est une démonstration complète et autonome. Ouvrez http://localhost:5175/demo-test.html et tout se fait automatiquement !
