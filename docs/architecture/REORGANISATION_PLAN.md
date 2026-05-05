# 🔧 Plan de Réorganisation — text2quizVIP

## Diagnostic complet

L'audit révèle une application fonctionnelle mais qui a accumulé une **dette technique significative** au fil des sprints. Voici le plan en 3 phases.

---

## PHASE 1 — Propreté du code

### 1.1 Code mort à supprimer (~1600 lignes)

| Fichier | Lignes | Raison |
|---|---|---|
| `src/new-ui/app-simple.ts` | 195 | Aucun import ni référence — orphelin |
| `src/database/AdaptiveLearning.ts` | 350 | Aucun fichier ne l'importe |
| `src/database/ProgressTracker.ts` | 360 | Seul consommateur = AdaptiveLearning (lui-même mort) |
| `src/storage/IndexedDBAdapter.ts` | 310 | Aucun import — doublon de `stats/IndexedDBAdapter.ts` |
| `src/utils/structureHelpers.ts` | 382 | Aucun fichier source ne l'importe |

**Action** : Déplacer dans un dossier `_archive/` ou supprimer.

### 1.2 Console.logs à nettoyer

- **`new-ui/app.ts`** : 50+ console.log avec emojis (🚀, 📊, 🎯...) — supprimer tous
- **`new-ui/quiz-runner.ts`** : ~10 console.log de debug
- **`cache/ParserCache.ts`** : Log à chaque cache HIT/MISS
- **`scheduling.ts`** : `console.warn` deprecation (utile pour la migration, garder temporairement)
- **`main.ts`** : Multiples console.log

**Action** : Passe globale `grep console.log` → supprimer ou remplacer par un logger conditionnel.

### 1.3 Bugs à corriger

| Bug | Fichier | Description |
|---|---|---|
| **`tags.split(',')` sur un `string[]`** | `ImportService.ts` | `q.tags` est déjà un tableau, `.split()` va crash |
| **`q.explanation` au lieu de `q.explication`** | `ImportService.ts` | Nom de propriété incorrect |
| **Méthodes `clear()` et `getStats()` définies 2 fois** | `ParserCache.ts` | La 2ème définition écrase la 1ère |
| **`OpenQ` absent du type union `Question`** | `parser.ts` | Le parser produit `type: 'OpenQ'` mais ce type n'est pas dans l'union |
| **`requestIdleCallback` mal appelé** | `ParserCache.ts` | Passe `0` au lieu d'un objet `{timeout: 0}` |

### 1.4 Duplication de `shuffleArray` (4 copies !)

Le même algorithme Fisher-Yates est copié dans :
1. `src/shuffle.ts` ← **seule source de vérité**
2. `src/new-ui/app.ts` (ligne ~1174)
3. `src/new-ui/quiz-runner.ts`
4. `src/database/AdaptiveLearning.ts` (code mort)

**Action** : Supprimer les copies, importer depuis `shuffle.ts`.

### 1.5 Fichiers HTML de test/debug à la racine

| Fichier | Action |
|---|---|
| `debug-quiz.html` | Déplacer dans `tests/` ou supprimer |
| `demo-test.html` | Déplacer dans `tests/` ou supprimer |
| `test-macro-load.html` | Déplacer dans `tests/` ou supprimer |
| `test-simple-load.html` | Déplacer dans `tests/` ou supprimer |
| `welcome.html` | Si inutilisé, supprimer |

---

## PHASE 2 — Propreté de la structure

### 2.1 Problème principal : DEUX frontends parallèles

```
Legacy :     legacy.html → main.ts (3132 lignes monolithe)
                 ↓
             courses.ts → parser.ts → scheduling.ts → StatsManager → ELO

New UI :     index.html → new-ui/app.ts → parser.ts → SimpleProgress
                 ↓
             quiz.html → quiz-runner.ts (SANS stats ni ELO !)
```

**Le new-ui est incomplet** : `quiz-runner.ts` ne gère que les QCM simples, n'intègre ni le Spaced Repetition, ni l'ELO, ni les types VF/DragMatch/OpenQ.

**Décision à prendre** :
- **Option A** : Compléter le new-ui et abandonner legacy.html/main.ts
- **Option B** : Fusionner le meilleur des deux dans une architecture propre
- **Recommandation** : **Option A** — le new-ui a la bonne architecture (modulaire), il faut juste y porter les features de main.ts

### 2.2 Unification des types (CRITIQUE)

**6+ définitions dupliquées de `Question`** entre `parser.ts`, `types.ts`, et `app.ts`.

**Action** :
1. Faire de `src/types.ts` le **fichier unique** de types
2. Le parser doit retourner le type de `types.ts`, pas son propre type
3. `app.ts` doit importer depuis `types.ts` au lieu de redéfinir
4. Fusionner `types/structure.ts` dans un sous-module propre

### 2.3 Unification du stockage (5 bases IndexedDB !)

| Base | Fichier | Usage |
|---|---|---|
| `t2q_stats` | `stats/IndexedDBAdapter.ts` | Stats de questions (actif) |
| `text2quiz_storage` | `storage/IndexedDBAdapter.ts` | Générique (**orphelin**) |
| `Text2QuizDB` | `database/QuestionDatabase.ts` | CRUD questions (admin seulement) |
| `Text2QuizProgressDB` | `database/ProgressTracker.ts` | Progression (**orphelin**) |
| localStorage `text2quiz_progress` | `SimpleProgress.ts` + `ProgressTracker.ts` | **COLLISION de clé !** |

**Action** :
1. Supprimer les 2 adaptateurs orphelins
2. Unifier vers une seule base `text2quiz` avec des object stores distincts
3. Résoudre la collision de clé localStorage

### 2.4 Réorganisation du dossier `src/`

**Structure actuelle** (chaotique) :
```
src/
├── main.ts (3132 lignes - monolithe legacy)
├── parser.ts
├── types.ts
├── utils.ts
├── courses.ts
├── scheduling.ts
├── shuffle.ts
├── revision-sheets.ts
├── style.css
├── style-analytics.css
├── parser-compat.d.ts
├── admin/
├── cache/
├── cours/
├── database/
├── new-ui/
├── questions/
├── stats/
├── storage/
├── types/
└── utils/
```

**Structure proposée** :
```
src/
├── core/
│   ├── parser.ts          ← Parser de questions
│   ├── types.ts           ← Types unifiés
│   ├── utils.ts           ← Utilitaires partagés
│   └── shuffle.ts         ← Shuffle (source unique)
│
├── quiz/
│   ├── QuizEngine.ts      ← Moteur de quiz (fusion quiz-runner + logic de main.ts)
│   ├── QuizConfig.ts      ← Configuration de session
│   └── QuestionRenderer.ts ← Rendu des questions (QCM, VF, QR, DragMatch, OpenQ)
│
├── learning/
│   ├── SpacedRepetition.ts ← Leitner scheduling
│   ├── EloSystem.ts       ← Système ELO
│   ├── ProgressStore.ts   ← Stockage unifié de progression
│   └── PlacementQuiz.ts   ← Quiz de placement initial
│
├── ui/
│   ├── App.ts             ← Shell UI principal (< 300 lignes)
│   ├── SubjectSelector.ts ← Sélection matière/chapitres/notions
│   ├── QuizRunner.ts      ← Interface du quiz
│   ├── Dashboard.ts       ← Tableau de bord progression
│   ├── Analytics.ts       ← Graphiques et analytics
│   └── RevisionSheets.ts  ← Fiches de révision
│
├── data/
│   ├── courses.ts         ← Catalogue de matières
│   ├── structures/        ← JSONs de structure
│   └── questions/         ← Fichiers de questions (S1/, S2/, etc.)
│
├── storage/
│   ├── StorageAdapter.ts  ← Adapter unifié (IndexedDB + localStorage fallback)
│   └── migrations.ts      ← Migrations de données
│
├── admin/
│   └── (inchangé)
│
└── styles/
    ├── main.css
    └── analytics.css
```

### 2.5 Documentation : ménage des 52 markdowns à la racine

**Action** :
```
docs/
├── guides/          ← GUIDE_*.md, QUICK_START.md, README.md
├── audits/          ← AUDIT_*.md
├── sprints/         ← SPRINT_*.md
├── architecture/    ← NEW_ARCHITECTURE.md, FORMATS_*.md
└── deployment/      ← DEPLOY_*.md, DEPLOYMENT.md
```

Conserver à la racine : `README.md`, `ROADMAP.md`, `PROGRESS.md` uniquement.

### 2.6 Organisation des questions

**Actuellement** : fichiers éparpillés dans `src/questions/` (loose files + S1/S2/S3/S4/).

**Proposition** :
```
src/data/questions/
├── S1/
│   ├── MACRO/       ← Macroéconomie
│   ├── INSTIT/      ← Institutions
│   ├── STATS/       ← Statistiques
│   └── DROIT/       ← Droit privé
├── S2/
│   ├── DEMO/        ← Démographie
│   ├── SOCIO/       ← Sociologie
│   └── ANALYSE_ECO/ ← Analyse économique
└── TEST/            ← Questions de test
```

Supprimer les fichiers loose (macroCH1.txt, etc.) s'ils sont dupliqués dans les sous-dossiers S1/.

---

## PHASE 3 — Monétisation pour la L2

### 3.1 Modèle économique proposé : Freemium

| | Gratuit | Premium (4,99€/mois ou 29,99€/an) |
|---|---|---|
| Questions | 20 par matière | Illimité |
| Matières S1 | ✅ Toutes | ✅ Toutes |
| Matières S2+ | ❌ | ✅ |
| Mode examen blanc | ❌ | ✅ |
| Statistiques | Basiques | Complètes (ELO, analytics, prédictions) |
| Fiches de révision | ❌ | ✅ |
| Spaced repetition | ❌ | ✅ |
| Export de progression | ❌ | ✅ |

### 3.2 Architecture technique pour la monétisation

#### 3.2.1 Authentification
- **Supabase Auth** (gratuit jusqu'à 50k MAU) ou **Firebase Auth**
- Login par email + Google OAuth
- Stocker le profil + abonnement côté serveur

#### 3.2.2 Base de données distante
- **Supabase** (PostgreSQL) ou **Firebase Firestore**
- Tables : `users`, `subscriptions`, `progress`, `question_stats`
- Sync bidirectionnelle avec le stockage local (offline-first)

#### 3.2.3 Paiement
- **Stripe** (via Supabase Edge Functions ou Netlify Functions)
- Webhook Stripe → met à jour `subscriptions.status`
- Pages de checkout hébergées par Stripe (pas besoin de gérer les cartes)

#### 3.2.4 Gating de contenu
```typescript
// Middleware simple
function canAccessFeature(feature: string, user: User): boolean {
  if (FREE_FEATURES.includes(feature)) return true;
  return user.subscription?.status === 'active';
}

// Dans le quiz runner
if (!canAccessFeature('unlimited_questions', currentUser)) {
  if (questionsAnswered >= 20) {
    showPaywall();
    return;
  }
}
```

### 3.3 Nouvelles matières L2 à préparer

| Semestre | Matière | Priorité |
|---|---|---|
| S3 | Microéconomie approfondie | Haute |
| S3 | Macroéconomie approfondie | Haute |
| S3 | Comptabilité nationale | Moyenne |
| S3 | Économétrie | Haute |
| S3 | Théorie des jeux | Moyenne |
| S4 | Économie internationale | Haute |
| S4 | Politique économique | Haute |
| S4 | Finance | Moyenne |

### 3.4 Features à valeur ajoutée (premium)

1. **Mode Examen Blanc** — Simulation d'épreuve chronométrée avec correction détaillée
2. **Parcours Adaptatif Intelligent** — L'algorithme ELO + Spaced Repetition (déjà codé, juste à intégrer)
3. **Tableaux de bord Analytics** — Prédiction de note, zones faibles, courbe de progression
4. **Fiches de Révision Interactives** — Format drag-and-drop déjà prototypé
5. **Mode Hors-ligne** — PWA avec service worker
6. **Classement Anonyme** — Comparer sa progression avec les autres étudiants (social proof)
7. **Notifications de Révision** — Push notifications pour le spaced repetition

### 3.5 Stack technique recommandée

```
Frontend :     Vite + TypeScript (garder l'existant)
               + PWA plugin (vite-plugin-pwa)
Auth :         Supabase Auth
Database :     Supabase (PostgreSQL)
Paiement :     Stripe Checkout
Hébergement :  Vercel ou Netlify (gratuit)
Analytics :    Plausible (privacy-friendly) ou PostHog
```

### 3.6 Roadmap de déploiement

```
Semaine 1-2 :  Phase 1 (nettoyage code)
Semaine 3-4 :  Phase 2 (restructuration)
Semaine 5-6 :  Intégration Supabase Auth + sync progression
Semaine 7 :    Intégration Stripe + paywall
Semaine 8 :    PWA + déploiement production
Semaine 9+ :   Création contenu L2 + marketing campus
```

---

## Résumé des priorités

| Priorité | Action | Impact |
|---|---|---|
| 🔴 P0 | Corriger les bugs (ImportService, ParserCache, type OpenQ) | Stabilité |
| 🔴 P0 | Unifier les types (`Question`, `Mode`, etc.) | Fiabilité |
| 🟠 P1 | Supprimer le code mort (~1600 lignes) | Clarté |
| 🟠 P1 | Compléter quiz-runner (VF, stats, ELO) | Fonctionnel |
| 🟡 P2 | Nettoyer console.logs | Propreté |
| 🟡 P2 | Réorganiser la structure de dossiers | Maintenabilité |
| 🟡 P2 | Ranger la documentation | Organisation |
| 🔵 P3 | Intégrer Supabase Auth | Monétisation |
| 🔵 P3 | Intégrer Stripe | Monétisation |
| 🔵 P3 | Créer le contenu L2 | Croissance |
