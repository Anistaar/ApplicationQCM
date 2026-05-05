# 📋 Découpage Tâches Sprint 5 - Phase 2

**Date** : 30 novembre 2025  
**Objectif** : Finaliser la nouvelle interface avec analytics filtrage + mode rattrapage implémenté

---

## 🎯 Vue d'Ensemble

### ✅ COMPLÉTÉ (Phase 1)
- [x] Dark mode par défaut
- [x] Structure JSON chargée (MACRO)
- [x] Plan hiérarchique affiché
- [x] Notions cliquables
- [x] Mode rattrapage configuré (config seulement)

### ⏳ RESTANT (Phase 2)
- [ ] **Tâche A** : Analytics par matière (10 min)
- [ ] **Tâche B** : Implémentation rattrapage quiz (15 min)
- [ ] **Tâche C** : Structures JSON manquantes (20 min)

---

## 📝 Tâche A : Analytics par Matière

### 🎯 Objectif
Ajouter un dropdown dans le dashboard analytics pour filtrer les stats par matière (MACRO, STATS, INSTIT, TEST).

### 📂 Fichiers à Modifier
- `src/stats/AnalyticsDashboard.ts` (lignes 42-75)
- `src/style-analytics.css` (ajouter styles dropdown)

### 🔧 Étapes Détaillées

#### A1. Ajouter Propriété `selectedSubject`
**Fichier** : `src/stats/AnalyticsDashboard.ts`  
**Ligne** : ~40 (après `private charts`)

```typescript
export class AnalyticsDashboard {
  private container: HTMLElement;
  private questions: Question[];
  private config: DashboardConfig;
  private charts: Map<string, Chart> = new Map();
  private selectedSubject: string | null = null; // ← NOUVEAU

  constructor(config: DashboardConfig) {
    this.container = config.container;
    this.questions = config.questions;
    this.config = config;
  }
```

#### A2. Modifier `render()` pour Ajouter Dropdown
**Fichier** : `src/stats/AnalyticsDashboard.ts`  
**Ligne** : ~77-95 (dans fonction `renderRetentionChart`)

**AVANT** :
```typescript
async render(): Promise<void> {
  this.container.innerHTML = '';
  this.destroyCharts();
  
  // Header
  const header = document.createElement('div');
  header.className = 'analytics-dashboard-header';
  header.innerHTML = `
    <h2>📊 Analytics & Progression</h2>
    <p class="analytics-subtitle">Analyse détaillée de votre apprentissage</p>
  `;
  this.container.appendChild(header);
```

**APRÈS** :
```typescript
async render(): Promise<void> {
  this.container.innerHTML = '';
  this.destroyCharts();
  
  // Header
  const header = document.createElement('div');
  header.className = 'analytics-dashboard-header';
  header.innerHTML = `
    <div class="header-content">
      <div>
        <h2>📊 Analytics & Progression</h2>
        <p class="analytics-subtitle">Analyse détaillée de votre apprentissage</p>
      </div>
      <div class="subject-filter">
        <label for="subject-filter-select">Filtrer par matière :</label>
        <select id="subject-filter-select" class="subject-filter-select">
          <option value="all">📚 Toutes les matières</option>
          <option value="MACRO">📊 Macroéconomie</option>
          <option value="STATS">📈 Statistiques</option>
          <option value="INSTIT">🏛️ Institutions</option>
          <option value="TEST">🧪 TEST</option>
        </select>
      </div>
    </div>
  `;
  this.container.appendChild(header);

  // Event listener pour le filtre
  const select = document.getElementById('subject-filter-select') as HTMLSelectElement;
  select.value = this.selectedSubject || 'all';
  select.addEventListener('change', (e) => {
    this.selectedSubject = (e.target as HTMLSelectElement).value === 'all' 
      ? null 
      : (e.target as HTMLSelectElement).value;
    this.render(); // Re-render avec nouveau filtre
  });

  // Filtrer questions selon matière sélectionnée
  const filteredQuestions = this.getFilteredQuestions();
  
  // Render sections avec questions filtrées
  await this.renderQuickStats(filteredQuestions);
  await this.renderRetentionChart(filteredQuestions);
  await this.renderProblemQuestionsChart(filteredQuestions);
  await this.renderWeakZonesChart(filteredQuestions);
  await this.renderVelocitySection(filteredQuestions);
  await this.renderStreakCalendar(filteredQuestions);
  await this.renderExportSection(filteredQuestions);
}
```

#### A3. Ajouter Fonction `getFilteredQuestions()`
**Fichier** : `src/stats/AnalyticsDashboard.ts`  
**Ligne** : Après `render()` (~120)

```typescript
private getFilteredQuestions(): Question[] {
  if (!this.selectedSubject) {
    return this.questions; // Toutes les matières
  }

  // Filtrer par propriété subject OU par tags/topics
  return this.questions.filter(q => {
    // Option 1 : Si question a propriété .subject
    if (q.subject) {
      return q.subject === this.selectedSubject;
    }

    // Option 2 : Détecter matière via tags/topics
    const tags = q.topics || [];
    return tags.some(tag => tag.includes(this.selectedSubject!));
  });
}
```

#### A4. Modifier Toutes les Fonctions Render
**Fichier** : `src/stats/AnalyticsDashboard.ts`  
**Lignes** : Toutes fonctions `render*`

**Signature AVANT** :
```typescript
private async renderQuickStats(): Promise<void> {
  const stats = statsManager.getGlobalStats();
```

**Signature APRÈS** :
```typescript
private async renderQuickStats(questions: Question[]): Promise<void> {
  // Utiliser questions filtrées au lieu de this.questions
  const stats = this.calculateStatsForQuestions(questions);
```

**Remplacements dans chaque fonction** :
- `this.questions` → `questions` (paramètre)
- Utiliser les questions filtrées

#### A5. Ajouter Styles CSS
**Fichier** : `src/style-analytics.css`  
**Ligne** : Après `.analytics-dashboard-header` (~20)

```css
/* Header avec filtre matière */
.analytics-dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.analytics-dashboard-header .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.subject-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.subject-filter label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--txt);
}

.subject-filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--brd);
  border-radius: 10px;
  background: var(--bg);
  color: var(--txt);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.subject-filter-select:hover {
  border-color: var(--primary);
  background: var(--bg-light);
}

.subject-filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-dashboard-header .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .subject-filter {
    width: 100%;
  }
}
```

### ✅ Validation
- [ ] Dropdown affiché dans header
- [ ] Options : Toutes, MACRO, STATS, INSTIT, TEST
- [ ] Changement matière → re-render dashboard
- [ ] Stats recalculées avec questions filtrées
- [ ] Graphiques mis à jour
- [ ] Responsive mobile OK

---

## 📝 Tâche B : Implémentation Mode Rattrapage Quiz

### 🎯 Objectif
Implémenter la logique de rattrapage dans le quiz : questions fausses reviennent à la fin jusqu'à 100% réussite.

### 📂 Fichiers à Modifier
- `quiz.html` ou fichier engine quiz (localiser d'abord)
- Possiblement `src/quiz-engine.ts` ou similaire

### 🔍 Étape B0 : Localiser Fichier Quiz
**Commandes** :
```bash
# Chercher fichiers quiz
file_search: **/quiz*.{html,ts,js}
grep_search: "showQuestion|nextQuestion" isRegexp:true
```

### 🔧 Étapes Détaillées

#### B1. Lire Configuration
**Fichier** : Engine quiz  
**Ligne** : Init ou constructor

```typescript
// Lire config depuis sessionStorage
const configStr = sessionStorage.getItem('quizConfig');
const config = configStr ? JSON.parse(configStr) : {};

// Extraire paramètres rattrapage
const retryWrongAnswers = config.retryWrongAnswers || false;
const maxRetries = config.maxRetries || 3;

// State pour rattrapage
let wrongAnswersQueue: number[] = []; // Indices questions à refaire
let questionRetries = new Map<number, number>(); // questionIndex → count
```

#### B2. Modifier `onAnswerSubmit()`
**Fichier** : Engine quiz  
**Ligne** : Fonction validation réponse

**AVANT** :
```typescript
function onAnswerSubmit(questionIndex: number, userAnswer: string) {
  const question = questions[questionIndex];
  const isCorrect = checkAnswer(question, userAnswer);
  
  // Sauvegarder résultat
  results.push({ questionIndex, isCorrect, timeSpent });
  
  // Passer à la question suivante
  currentIndex++;
  nextQuestion();
}
```

**APRÈS** :
```typescript
function onAnswerSubmit(questionIndex: number, userAnswer: string) {
  const question = questions[questionIndex];
  const isCorrect = checkAnswer(question, userAnswer);
  
  // Sauvegarder résultat
  results.push({ questionIndex, isCorrect, timeSpent });
  
  // Mode rattrapage : ajouter à queue si faux
  if (!isCorrect && retryWrongAnswers) {
    const currentRetries = questionRetries.get(questionIndex) || 0;
    
    if (currentRetries < maxRetries) {
      // Ajouter à la queue de rattrapage
      wrongAnswersQueue.push(questionIndex);
      questionRetries.set(questionIndex, currentRetries + 1);
      
      // Afficher message encouragement
      showRetryMessage(currentRetries + 1, maxRetries);
    } else {
      // Max retries atteint : abandon question
      showMaxRetriesMessage(question);
    }
  }
  
  // Passer à la question suivante
  currentIndex++;
  nextQuestion();
}
```

#### B3. Modifier `nextQuestion()`
**Fichier** : Engine quiz  
**Ligne** : Fonction navigation

**AVANT** :
```typescript
function nextQuestion() {
  if (currentIndex < questions.length) {
    showQuestion(questions[currentIndex]);
  } else {
    // Quiz terminé
    showResults();
  }
}
```

**APRÈS** :
```typescript
function nextQuestion() {
  // 1. Questions normales
  if (currentIndex < questions.length) {
    showQuestion(questions[currentIndex]);
    updateProgress(currentIndex, questions.length + wrongAnswersQueue.length);
    return;
  }
  
  // 2. Questions rattrapage
  if (wrongAnswersQueue.length > 0) {
    const retryIndex = wrongAnswersQueue.shift()!;
    const retryCount = questionRetries.get(retryIndex) || 1;
    
    showQuestion(questions[retryIndex], {
      isRetry: true,
      attemptNumber: retryCount,
      remainingRetries: maxRetries - retryCount
    });
    
    updateProgress(
      currentIndex, 
      questions.length + wrongAnswersQueue.length,
      `🔄 Rattrapage (${retryCount}/${maxRetries})`
    );
    return;
  }
  
  // 3. Quiz terminé : 100% ou abandon
  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalQuestions = results.length;
  const successRate = (totalCorrect / totalQuestions) * 100;
  
  if (successRate === 100) {
    showResults({ message: '🎉 Félicitations ! 100% de réussite !' });
  } else {
    showResults({ 
      message: `✅ Quiz terminé : ${Math.round(successRate)}% de réussite`,
      showRetryButton: true 
    });
  }
}
```

#### B4. Ajouter Messages Encouragement
**Fichier** : Engine quiz  
**Ligne** : Nouvelles fonctions

```typescript
function showRetryMessage(attemptNumber: number, maxRetries: number) {
  const messages = [
    "💪 Ne t'inquiète pas, tu vas y arriver !",
    "🔄 Encore une chance de réussir !",
    "🎯 Dernière tentative, tu peux le faire !",
    "⚠️ Attention, c'est ta dernière chance !"
  ];
  
  const messageIndex = Math.min(attemptNumber - 1, messages.length - 1);
  const message = messages[messageIndex];
  
  const retryBadge = document.createElement('div');
  retryBadge.className = 'retry-badge';
  retryBadge.innerHTML = `
    <span class="retry-icon">🔄</span>
    <span class="retry-text">${message}</span>
    <span class="retry-count">Tentative ${attemptNumber}/${maxRetries}</span>
  `;
  
  questionContainer.prepend(retryBadge);
}

function showMaxRetriesMessage(question: Question) {
  console.log(`⚠️ Max retries atteint pour question: ${question.question}`);
  // Optionnel : afficher notification
}

function updateProgress(current: number, total: number, label?: string) {
  const progressText = label || `Question ${current + 1}/${total}`;
  const progressPercent = ((current + 1) / total) * 100;
  
  document.getElementById('progress-text')!.textContent = progressText;
  document.getElementById('progress-bar')!.style.width = `${progressPercent}%`;
}
```

#### B5. Ajouter Styles CSS Rattrapage
**Fichier** : `style.css` ou styles quiz  
**Ligne** : Nouvelle section

```css
/* Badge rattrapage */
.retry-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: slideInDown 0.3s ease;
}

.retry-icon {
  font-size: 1.5rem;
  animation: spin 2s linear infinite;
}

.retry-text {
  flex: 1;
  font-weight: 600;
  color: #92400e;
}

.retry-count {
  background: rgba(0,0,0,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #78350f;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### ✅ Validation
- [ ] Config `retryWrongAnswers` lue depuis sessionStorage
- [ ] Questions fausses ajoutées à queue
- [ ] Max retries respecté (3 passages)
- [ ] Messages encouragement affichés
- [ ] Badge rattrapage visible
- [ ] Progression mise à jour (X/Y + Z retries)
- [ ] Message final "🎉 100% réussite" si tout juste
- [ ] Bouton "Réessayer" si <100%

---

## 📝 Tâche C : Structures JSON Manquantes

### 🎯 Objectif
Créer les fichiers `STATS_complete.json` et `INSTIT_complete.json` au même format que `MACRO_complete.json`.

### 📂 Fichiers à Créer
- `src/database/structures/STATS_complete.json`
- `src/database/structures/INSTIT_complete.json`

### 🔧 Étapes Détaillées

#### C1. Analyser Questions Existantes
**Commandes** :
```bash
# Lister fichiers questions STATS
file_search: src/questions/S1/STATS/**/*.txt

# Lister fichiers questions INSTIT  
file_search: src/questions/S1/INSTIT/**/*.txt

# Lire premiers fichiers pour comprendre structure
read_file: src/questions/S1/STATS/stats_chap1_banque_facile.txt (lines 1-50)
read_file: src/questions/S1/INSTIT/FMI_QCM_EXHAUSTIF_v1.txt (lines 1-50)
```

#### C2. Créer Template STATS
**Fichier** : `src/database/structures/STATS_complete.json`

**Format basique** (à adapter selon contenu réel) :
```json
{
  "id": "STATS",
  "name": "Statistiques S1",
  "version": "2.0",
  "structureType": "sequential",
  "lastUpdate": "2025-11-30",
  "description": "Cours statistiques L1 - Probabilités, Variables, Estimation, Tests",
  "chapters": [
    {
      "id": "S1",
      "number": "1",
      "name": "Probabilités",
      "description": "Expériences aléatoires, événements, probabilités conditionnelles",
      "sections": [
        {
          "id": "S1-I",
          "romanNumeral": "I",
          "name": "Concepts fondamentaux",
          "subsections": [
            {
              "id": "S1-I-1",
              "number": "1",
              "name": "Expérience aléatoire",
              "notions": [
                {
                  "id": "S1-I-1a",
                  "name": "Définition expérience aléatoire",
                  "description": "Expérience dont résultat est incertain, univers Ω",
                  "tags": ["Proba", "Fondamentaux"],
                  "difficulty": "Facile",
                  "estimatedTime": 5
                },
                {
                  "id": "S1-I-1b",
                  "name": "Événements",
                  "description": "Ensemble de résultats possibles, A ⊆ Ω",
                  "tags": ["Proba", "Événements"],
                  "difficulty": "Facile",
                  "estimatedTime": 6
                }
              ],
              "estimatedTime": 11
            }
          ],
          "estimatedTime": 11
        }
      ],
      "estimatedTime": 50,
      "icon": "📊"
    },
    {
      "id": "S2",
      "number": "2",
      "name": "Variables aléatoires",
      "description": "Variables discrètes, continues, lois, espérance, variance",
      "sections": [
        {
          "id": "S2-I",
          "romanNumeral": "I",
          "name": "Variables discrètes",
          "subsections": [
            {
              "id": "S2-I-1",
              "number": "1",
              "name": "Définition",
              "notions": [
                {
                  "id": "S2-I-1a",
                  "name": "Variable aléatoire discrète",
                  "description": "Application X: Ω → ℝ, ensemble valeurs dénombrable",
                  "tags": ["Variables", "Discret"],
                  "difficulty": "Moyen",
                  "estimatedTime": 7
                }
              ],
              "estimatedTime": 7
            }
          ],
          "estimatedTime": 40
        }
      ],
      "estimatedTime": 60,
      "icon": "🎲"
    },
    {
      "id": "S3",
      "number": "3",
      "name": "Estimation",
      "description": "Échantillonnage, estimateurs, intervalles de confiance",
      "sections": [],
      "estimatedTime": 55,
      "icon": "📏"
    },
    {
      "id": "S4",
      "number": "4",
      "name": "Tests statistiques",
      "description": "Tests paramétriques, hypothèses, risques α et β",
      "sections": [],
      "estimatedTime": 50,
      "icon": "🧪"
    }
  ],
  "crossCutting": {
    "formulas": {
      "id": "formulas",
      "name": "📐 Formules",
      "items": [
        {
          "id": "F-proba",
          "name": "Probabilité",
          "formula": "P(A) = |A| / |Ω|",
          "tags": ["Formule"],
          "difficulty": "Facile"
        },
        {
          "id": "F-esperance",
          "name": "Espérance",
          "formula": "E(X) = Σ x_i * P(X=x_i)",
          "tags": ["Formule"],
          "difficulty": "Moyen"
        }
      ]
    },
    "authors": {
      "id": "authors",
      "name": "👥 Statisticiens",
      "items": [
        {
          "id": "A-bayes",
          "name": "Bayes",
          "fullName": "Thomas Bayes",
          "description": "Théorème de Bayes (probabilités conditionnelles)",
          "tags": ["Auteur"]
        }
      ]
    }
  },
  "metadata": {
    "totalQuestions": 200,
    "totalTime": 215,
    "totalNotions": 38,
    "authors": ["Prof Stats L1"]
  }
}
```

#### C3. Créer Template INSTIT
**Fichier** : `src/database/structures/INSTIT_complete.json`

**Format basique** :
```json
{
  "id": "INSTIT",
  "name": "Institutions Internationales S1",
  "version": "2.0",
  "structureType": "thematic",
  "lastUpdate": "2025-11-30",
  "description": "Organisations internationales - FMI, Banque Mondiale, OMC, ONU",
  "chapters": [
    {
      "id": "I1",
      "number": "1",
      "name": "Fonds Monétaire International (FMI)",
      "description": "Mission, gouvernance, mécanismes, critiques",
      "sections": [
        {
          "id": "I1-I",
          "romanNumeral": "I",
          "name": "Histoire et mission",
          "subsections": [
            {
              "id": "I1-I-1",
              "number": "1",
              "name": "Création du FMI",
              "notions": [
                {
                  "id": "I1-I-1a",
                  "name": "Conférence de Bretton Woods",
                  "description": "1944, création FMI et Banque Mondiale",
                  "tags": ["FMI", "Histoire"],
                  "difficulty": "Facile",
                  "estimatedTime": 5
                },
                {
                  "id": "I1-I-1b",
                  "name": "Objectifs du FMI",
                  "description": "Stabilité monétaire internationale, coopération",
                  "tags": ["FMI", "Mission"],
                  "difficulty": "Facile",
                  "estimatedTime": 6
                }
              ],
              "estimatedTime": 11
            }
          ],
          "estimatedTime": 30
        }
      ],
      "estimatedTime": 60,
      "icon": "💰"
    },
    {
      "id": "I2",
      "number": "2",
      "name": "Banque Mondiale",
      "description": "BIRD, IDA, projets de développement",
      "sections": [],
      "estimatedTime": 50,
      "icon": "🏦"
    },
    {
      "id": "I3",
      "number": "3",
      "name": "Organisation Mondiale du Commerce (OMC)",
      "description": "Commerce international, règles, contentieux",
      "sections": [],
      "estimatedTime": 45,
      "icon": "🌍"
    },
    {
      "id": "I4",
      "number": "4",
      "name": "Organisation des Nations Unies (ONU)",
      "description": "Conseil de sécurité, assemblée générale, agences",
      "sections": [],
      "estimatedTime": 40,
      "icon": "🕊️"
    }
  ],
  "crossCutting": {
    "organizations": {
      "id": "organizations",
      "name": "🏛️ Organisations",
      "items": [
        {
          "id": "O-fmi",
          "name": "FMI",
          "fullName": "Fonds Monétaire International",
          "founded": "1944",
          "headquarters": "Washington DC",
          "tags": ["Organisation"]
        },
        {
          "id": "O-bm",
          "name": "Banque Mondiale",
          "fullName": "Groupe Banque Mondiale",
          "founded": "1944",
          "headquarters": "Washington DC",
          "tags": ["Organisation"]
        }
      ]
    }
  },
  "metadata": {
    "totalQuestions": 150,
    "totalTime": 195,
    "totalNotions": 42,
    "authors": ["Prof Instit L1"]
  }
}
```

#### C4. Valider Format JSON
**Commandes** :
```bash
# Valider syntaxe JSON
run_in_terminal: python -m json.tool src/database/structures/STATS_complete.json

# Tester chargement dans app
# Ouvrir http://localhost:5174/src/new-ui/index.html
# Sélectionner STATS → Vérifier plan affiché
```

### ✅ Validation
- [ ] `STATS_complete.json` créé
- [ ] `INSTIT_complete.json` créé
- [ ] Format identique à `MACRO_complete.json`
- [ ] JSON valide (pas erreur syntax)
- [ ] Chargement app OK
- [ ] Plan hiérarchique affiché
- [ ] Notions cliquables

---

## 🎯 Ordre d'Exécution Recommandé

### Option 1 : Impact Utilisateur Maximum
1. **Tâche B** : Rattrapage quiz (15 min) → Feature visible immédiatement
2. **Tâche A** : Analytics filtrage (10 min) → Améliore analytics existantes
3. **Tâche C** : Structures JSON (20 min) → Prépare autres matières

### Option 2 : Ordre Logique
1. **Tâche C** : Structures JSON (20 min) → Base de données complète
2. **Tâche A** : Analytics filtrage (10 min) → Dashboard complet
3. **Tâche B** : Rattrapage quiz (15 min) → Finalise expérience quiz

### Option 3 : Quick Wins
1. **Tâche A** : Analytics filtrage (10 min) → Rapide à implémenter
2. **Tâche B** : Rattrapage quiz (15 min) → Feature attendue
3. **Tâche C** : Structures JSON (20 min) → Plus long, moins urgent

---

## ✅ Checklist Globale Sprint 5

### Phase 1 (Complété)
- [x] Dark mode par défaut
- [x] Structure JSON chargée
- [x] Plan hiérarchique affiché
- [x] Notions cliquables
- [x] Config rattrapage enregistrée

### Phase 2 (À faire)
- [ ] **Tâche A** : Analytics par matière
  - [ ] Dropdown filtre ajouté
  - [ ] Fonction `getFilteredQuestions()`
  - [ ] Render avec questions filtrées
  - [ ] Styles CSS ajoutés
  - [ ] Test changement matière

- [ ] **Tâche B** : Rattrapage quiz
  - [ ] Config lue depuis sessionStorage
  - [ ] Queue `wrongAnswersQueue`
  - [ ] Logique `onAnswerSubmit()`
  - [ ] Logique `nextQuestion()`
  - [ ] Messages encouragement
  - [ ] Badge rattrapage
  - [ ] Test 100% réussite

- [ ] **Tâche C** : Structures JSON
  - [ ] `STATS_complete.json` créé
  - [ ] `INSTIT_complete.json` créé
  - [ ] JSON valide
  - [ ] Chargement app OK
  - [ ] Test sélection notions

---

## 📊 Estimation Temps

| Tâche | Temps estimé | Priorité |
|-------|--------------|----------|
| **A** : Analytics filtrage | 10 min | 🟡 Moyenne |
| **B** : Rattrapage quiz | 15 min | 🔴 Haute |
| **C** : Structures JSON | 20 min | 🟢 Basse |
| **TOTAL Phase 2** | **45 min** | - |

---

## 🎉 Résultat Final Attendu

Après Phase 2 complétée :

1. ✅ Dashboard analytics avec filtre matière
2. ✅ Quiz implémente mode rattrapage (100% réussite)
3. ✅ 4 structures JSON complètes (MACRO, STATS, INSTIT, TEST)
4. ✅ Plan structuré fonctionnel pour toutes les matières
5. ✅ Expérience utilisateur optimale

---

**Prochaine Action** : Choisir ordre d'exécution (Option 1, 2 ou 3) et commencer !
