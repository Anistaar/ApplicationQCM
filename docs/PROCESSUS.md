# Processus mis en place — text2quizVIP

Ce fichier documente tous les workflows et conventions établis pour produire et corriger les fichiers de révision.

---

## 1. Format des fichiers de questions (`.txt`)

**Chemin :** `src/questions/S2/<MATIERE>/<NOM>_v1.txt`

### Structure d'un fichier

```
@themes: Nom de la matière

### === ID-Chapitre-Section : Titre notion ===
### "Description courte"
@add-theme: Tag1, Tag2

QCM || Question || V:BonneRéponse|MauvaiseA|MauvaiseB|MauvaiseC || Explication
QCM || Question || V:Bonne1|V:Bonne2|MauvaiseA|MauvaiseB || Explication (multi-réponse)
VF  || Affirmation || V || Explication pourquoi vrai
VF  || Affirmation || F || Explication pourquoi faux
OpenQ || Question || mot-clé1,mot-clé2 || Citation du cours || Pourquoi important
```

### Règles de format
- **Séparateur de colonnes :** ` || ` (espace-pipes-espace)
- **Réponse correcte :** préfixe `V:` (insensible à la casse)
- **Multi-réponses QCM :** mettre `V:` devant chaque option correcte
- **Séparateur d'options :** `|` sans espace
- **Commentaire/section :** ligne commençant par `###`
- **Tag global :** `@themes:` en début de fichier
- **Tag local :** `@add-theme:` après un bloc `###`
- **ID de section :** format `MATIERE-CHAP-SECTION` (ex : `HFE-2-1`, `DEMO-AN25-1`)

---

## 2. Convention de nommage des fichiers

| Type | Convention | Exemple |
|------|-----------|---------|
| QCM cours | `<MATIERE>_QCM_v1.txt` | `HFE_QCM_v1.txt` |
| Questions ouvertes | `<MATIERE>_OpenQ_v1.txt` | `HFE_OpenQ_v1.txt` |
| Annales | `<MATIERE>_ANNALES_<ANNEE>_v1.txt` | `HFE_ANNALES_2025_v1.txt` |
| Incrément de version | `_v2`, `_v3`... | `DEMOGRAPHIE_QCM_v2.txt` |

---

## 3. Ajouter une matière dans l'application

**Fichier :** `src/new-ui/app.ts` — tableau `SUBJECTS`

### Matière avec un seul fichier
```typescript
{ id: 'DEMO', name: 'Démographie', icon: '👥', file: '/src/questions/S2/DEMO/DEMOGRAPHIE_QCM_v1.txt' },
```

### Matière avec plusieurs fichiers (cours + annales)
```typescript
{ id: 'HFE', name: 'Histoire des Faits Éco', icon: '🏭', files: [
    '/src/questions/S2/HFE/HFE_QCM_v1.txt',
    '/src/questions/S2/HFE/HFE_OpenQ_v1.txt',
    '/src/questions/S2/HFE/HFE_ANNALES_2023_v1.txt',
    '/src/questions/S2/HFE/HFE_ANNALES_2025_v1.txt'
]},
```

Le chargement (`loadQuestionsForSubject`) utilise `files ?? [file]` — les deux formats sont supportés.

---

## 4. Extraire des annales depuis des photos Discord

### Prérequis
- Photos Discord accessibles via CDN (URLs `cdn.discordapp.com`)
- Les URLs Discord expirent après quelques heures (token `ex=` dans l'URL)

### Workflow d'extraction (via Playwright/browser tools)
1. Ouvrir l'image dans le navigateur : `page.goto(url)`
2. Capturer des strips avec `page.screenshot({ clip: {...} })` en découpant par fraction de la hauteur
3. Lire les options encerclées sur la copie étudiant
4. Transcrire dans le format `.txt` en marquant `V:` devant les options cochées

### Conventions annales
- Nommer les questions `[ANNALE AAAA – QN]` dans le champ question
- Indiquer le barème dans le commentaire de section (`### "..."`)
- **Si plusieurs réponses cochées :** mettre `V:` devant chaque bonne option séparément
- **Si une option est manquante/illisible :** noter `⚠️` et expliquer dans l'explication
- **Si une question n'est pas visible sur la photo :** créer un placeholder avec `⚠️ MANQUANT`

### Barèmes courants observés
| Matière | Correct | Faux | Absent |
|---------|---------|------|--------|
| HFE 2025 | +1 | −0,25 | 0 |
| HFE 2023 | +1 | −0,5 | 0 |
| Débats 2025 | +1 | − | 0 |
| Démo 2025 | +1 | −0,25 | 0 |

---

## 5. Multi-réponses QCM dans le quiz runner

**Détection automatique :** si `answers.filter(a => a.correct).length > 1` → mode multi-select activé.

**Comportement :**
- Un indicateur bleu apparaît au-dessus des options : *"☑️ Plusieurs réponses correctes — sélectionnez toutes les bonnes (N)"*
- Clic sur une option = **toggle** (pas de déselection des autres)
- Bouton "Valider" actif dès qu'au moins une option est sélectionnée
- **Score :** correct seulement si l'ensemble sélectionné = ensemble des bonnes réponses exactement
- Feedback : affiche toutes les bonnes réponses séparées par ` + `

---

## 6. Générer des questions QCM à partir d'un cours

Voir les prompts dans `docs/prompts/` :

| Fichier | Utilisation |
|---------|------------|
| `generate-hfe-questions.md` | QCM Histoire des Faits Économiques (7 chapitres, IDs HFE-1 à HFE-7) |
| `generate-debats-questions.md` | QCM Débats Contemporains (7 chapitres, style Omgba) |
| `generate-macro-questions.md` | QCM Macroéconomie |
| `generate-revision-sheets.md` | Fiches de révision textuelles |
| `generate-openq.md` | Questions ouvertes (OpenQ) avec mots-clés |
| `split-course-sections.md` | Découper un cours en sections avec IDs |

### Étapes générales
1. Copier le prompt depuis `docs/prompts/`
2. Fournir le texte du cours ou du chapitre
3. Le prompt indique les IDs à utiliser, les pièges à éviter, le style d'écriture
4. Coller le résultat directement dans le fichier `.txt` (pas besoin de conversion)

---

## 7. Corrections et vérification des annales

### Problème principal
Les photos proviennent d'un étudiant tiers — les réponses cochées peuvent être incorrectes. **Ne jamais faire confiance à la source sans vérification.**

### Workflow de vérification
1. Lancer l'appli (`npm run dev` → `http://localhost:5173/`)
2. Sélectionner la matière concernée
3. Naviguer jusqu'aux questions de l'annale (préfixe `[ANNALE AAAA – QN]`)
4. Pour chaque question multi-réponse : sélectionner les réponses que vous pensez correctes, comparer avec ce qui est marqué `V:`
5. Si erreur : modifier directement le fichier `.txt` (changer le préfixe `V:` sur la bonne option)

### Modifier une réponse correcte
Dans le fichier `.txt`, changer :
```
QCM || Question || MauvaiseA|V:MauvaiseB|BonneRéponse  ← AVANT (mal encodé)
QCM || Question || MauvaiseA|MauvaiseB|V:BonneRéponse  ← APRÈS (corrigé)
```

---

## 8. Bugs corrigés (historique)

| Bug | Cause | Fix |
|-----|-------|-----|
| Questions VF affichent un écran blanc | Le runner ne gérait pas `type === 'VF'` (pas d'`answers[]`) | Ajout d'une branche VF avec boutons ✅/❌ dans `quiz-runner.ts` |
| Écran de résultats invisible | `.results-container { display: none }` dans `quiz.html` CSS | Suppression du `display: none` |
| Pas de bouton "Suite" après le quiz | Bouton "Nouveaux thèmes" manquant | Ajout du bouton + redirection vers `/#subjectId` |
| Multi-réponse impossible | `selectOption` faisait du single-select pour tous les QCM | Ajout détection multi-select + mode toggle |

---

## 9. Architecture technique

```
src/
  new-ui/
    app.ts          ← Sélection de matière, chargement questions, lancement quiz
    quiz-runner.ts  ← Rendu des questions, validation, score, résultats
  questions/
    S2/
      HFE/          ← cours + annales 2023 + annales 2025
      DEBATS/       ← cours + annales 2025
      DEMO/         ← cours + annales 2025 (Q14 manquante)
      SOCIO/        ← (à créer)
  types.ts          ← Types TypeScript (Question, Answer, etc.)
  parser.ts         ← Parseur .txt → Question[]
quiz.html           ← Page quiz (HTML + CSS)
index.html          ← Page d'accueil (sélection matière)
vite.config.ts      ← Config Vite (dev server port 5173)
```

---

## 10. Commandes utiles

```powershell
# Démarrer le serveur de développement
npm run dev
# → http://localhost:5173/

# Build production
npm run build

# Vérifier le nombre de lignes d'un fichier de questions
(Get-Content "src/questions/S2/DEMO/DEMOGRAPHIE_QCM_v1.txt" | Measure-Object -Line).Lines
```
