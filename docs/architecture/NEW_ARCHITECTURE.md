# 🎓 Text2Quiz VIP - Nouvelle Architecture

## 📋 Vue d'ensemble

Nouvelle interface complètement repensée avec **base de données IndexedDB** et **gestion centralisée des questions par thèmes**.

---

## 🚀 Architecture

### Structure des fichiers

```
src/
├── database/
│   ├── QuestionDatabase.ts      # Gestion IndexedDB
│   └── ImportService.ts          # Import de fichiers text2quiz
├── admin/
│   ├── admin-panel.html          # Interface d'administration
│   └── admin-panel.ts            # Logique admin
├── new-ui/
│   ├── index.html                # Nouvelle interface utilisateur
│   └── app.ts                    # Logique sélection thèmes
└── [anciens fichiers...]
```

---

## 🗄️ Base de données IndexedDB

### Stores (tables)

1. **questions** - Toutes les questions
   - `id`: UUID unique
   - `question`: Objet Question complet
   - `themes`: Array de tags/thèmes
   - `subject`: Matière (MACRO, INSTIT, etc.)
   - `difficulty`: Facile | Moyen | Difficile | Expert
   - `source`: Fichier d'origine
   - `dateAdded`, `dateModified`: Timestamps

2. **themes** - Définitions des thèmes
   - `id`, `name`, `color`, `description`
   - `parent`: Hiérarchie (optionnel)
   - `questionCount`: Compteur

3. **subjects** - Matières
   - `id`, `name`, `shortName`, `color`
   - `themeCount`, `questionCount`: Statistiques

4. **userMetadata** - Métadonnées utilisateur
   - Tags personnalisés, notes, etc.

### API

```typescript
// Initialisation
await questionDB.init();

// Questions
await questionDB.addQuestion(record);
await questionDB.getQuestionsByTheme('Chapitre1');
await questionDB.getQuestionsBySubject('MACRO');
await questionDB.searchQuestions('consommation');

// Thèmes & Matières
await questionDB.getAllThemes();
await questionDB.getAllSubjects();

// Statistiques
await questionDB.updateThemeStatistics();
await questionDB.updateSubjectStatistics();

// Import/Export
const json = await questionDB.exportToJSON();
await questionDB.importFromJSON(json);
```

---

## 🎨 Interface d'administration

**URL**: `src/admin/admin-panel.html`

### Fonctionnalités

1. **📊 Tableau de bord**
   - Statistiques globales (questions, thèmes, matières)
   - Actions rapides (import, actualisation, vider la DB)

2. **📤 Import**
   - Glisser-déposer de fichiers text2quiz
   - Sélection de la matière
   - Détection automatique des thèmes
   - Import batch de plusieurs fichiers
   - Logs détaillés

3. **📝 Questions**
   - Liste complète avec filtres
   - Recherche par texte
   - Filtres par matière et difficulté
   - Édition/suppression

4. **🏷️ Thèmes**
   - Vue d'ensemble de tous les thèmes
   - Compteurs de questions par thème
   - Gestion hiérarchique (future)

5. **📚 Matières**
   - Liste des matières
   - Statistiques par matière

### Workflow d'import

```
1. Aller sur admin-panel.html
2. Onglet "Import"
3. Glisser-déposer vos fichiers .txt (text2quiz)
4. Sélectionner la matière
5. (Optionnel) Ajouter des thèmes par défaut
6. Cocher "Détecter automatiquement les thèmes"
7. Cliquer "Lancer l'import"
8. Vérifier les logs d'import
9. Actualiser les statistiques
```

---

## 🎯 Nouvelle interface utilisateur

**URL**: `src/new-ui/index.html`

### Workflow utilisateur

```
1. Sélectionner une MATIÈRE
   └─> Cards colorées avec compteurs

2. Sélectionner des THÈMES
   └─> Chips cliquables avec recherche
   └─> Actions: Tout sélectionner / Tout décocher

3. Configurer le QUIZ
   └─> Nombre de questions
   └─> Mode (Entraînement / Examen / Contre la montre)
   └─> Difficulté minimale
   └─> Options (mélange, explications, etc.)

4. LANCER le quiz
   └─> Redirection vers l'interface de quiz
```

### Fonctionnalités

- **Sélection visuelle** des matières
- **Filtrage dynamique** des thèmes par recherche
- **Compteurs en temps réel** de questions disponibles
- **Résumé de sélection** avant de lancer
- **Configuration avancée** du quiz
- **Responsive** et moderne

---

## 📦 Service d'import

### `ImportService.ts`

Conversion automatique de fichiers text2quiz vers la base de données.

#### Fonctionnalités

- **Parser** les fichiers text2quiz
- **Extraire** automatiquement les thèmes depuis la colonne 5
- **Détecter** la difficulté (Facile, Moyen, Difficile, Expert)
- **Éviter** les doublons
- **Analyser** les fichiers avant import
- **Logs** détaillés de l'import

#### Exemple

```typescript
import { importText2QuizFile } from './database/ImportService';

const content = await file.text();

const result = await importText2QuizFile(content, {
  subject: 'MACRO',
  source: 'MACRO_MEGA_v1.txt',
  autoDetectThemes: true,
  defaultThemes: ['Chapitre1', 'Difficile'],
  overwriteExisting: false
});

console.log(result.success, 'questions importées');
console.log(result.details);
```

---

## 🔧 Configuration Vite

Le `vite.config.ts` a été mis à jour pour supporter 3 points d'entrée :

```typescript
build: {
  rollupOptions: {
    input: {
      main: 'index.html',           // Ancienne interface
      newui: 'src/new-ui/index.html',      // Nouvelle interface
      admin: 'src/admin/admin-panel.html'  // Admin
    }
  }
}
```

---

## 🚦 Démarrage

### Développement

```bash
npm run dev
```

Accès :
- Ancienne interface : http://localhost:5173/
- **Nouvelle interface** : http://localhost:5173/src/new-ui/
- **Admin** : http://localhost:5173/src/admin/admin-panel.html

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## 📝 Migration depuis l'ancien système

### Étapes

1. **Préparer vos fichiers**
   - Utiliser le format text2quiz standard
   - Ajouter des tags dans la colonne 5
   - Exemple : `|| Question || Réponses || Explication || Tag1, Tag2, Facile`

2. **Lancer l'admin**
   - Ouvrir `src/admin/admin-panel.html`

3. **Importer**
   - Glisser-déposer vos fichiers
   - Sélectionner la matière
   - Lancer l'import

4. **Vérifier**
   - Onglet "Questions" pour voir toutes les questions
   - Onglet "Thèmes" pour voir les tags extraits

5. **Utiliser la nouvelle UI**
   - Aller sur `src/new-ui/index.html`
   - Sélectionner matière et thèmes
   - Lancer le quiz !

### Compatibilité

- ✅ **Format text2quiz** : 100% compatible
- ✅ **Tags existants** : Détectés automatiquement (colonne 5)
- ✅ **Tous types** : VF, QCM, QR, DragMatch, OpenQ, FormulaBuilder
- ✅ **Explications** : Préservées
- ⚠️ **Ancienne interface** : Toujours fonctionnelle en parallèle

---

## 🎓 Pour les experts en audit

### Workflow recommandé

1. **Créer un fichier Mega par matière**
   ```
   MACRO_MEGA_v1.txt
   INSTIT_MEGA_v1.txt
   etc.
   ```

2. **Taguer exhaustivement**
   - Chapitres : `Chapitre1`, `Chapitre2`
   - Concepts : `Consommation`, `Investissement`, `ISLM`
   - Auteurs : `Keynes`, `Friedman`, `North`
   - Difficulté : `Facile`, `Moyen`, `Difficile`, `Expert`
   - Types : `Formules`, `Graphiques`, `Definitions`

3. **Importer via l'admin**
   - Un import par matière
   - Vérifier les logs
   - Actualiser les stats

4. **Gérer les thèmes**
   - Créer des thèmes personnalisés (future feature)
   - Hiérarchie de thèmes (future feature)
   - Couleurs et descriptions

5. **Partager la config**
   - Exporter la DB en JSON
   - Distribuer aux étudiants
   - Importer sur d'autres machines

---

## 🔮 Futures améliorations

- [ ] **Éditeur de questions inline** dans l'admin
- [ ] **Hiérarchie de thèmes** (thème parent > sous-thèmes)
- [ ] **Tags personnalisés** sans modifier les fichiers
- [ ] **Analytics** (questions les plus ratées, etc.)
- [ ] **Mode collaboratif** (partage de DB en ligne)
- [ ] **Synchronisation cloud** (Firebase/Supabase)
- [ ] **API REST** pour intégration externe
- [ ] **Import depuis Google Sheets** / Excel
- [ ] **Export vers Anki**, Quizlet, etc.
- [ ] **Générateur de questions** avec IA

---

## 📞 Support

Pour toute question ou problème :

1. Vérifier la console navigateur (F12)
2. Vérifier les logs d'import dans l'admin
3. Exporter la DB et analyser le JSON
4. Consulter la documentation du parser (`src/parser.ts`)

---

## 🎉 Avantages de la nouvelle architecture

| Avant | Après |
|-------|-------|
| ❌ Multiple fichiers par thème | ✅ Un seul fichier par matière |
| ❌ Sélection limitée de fichiers | ✅ Sélection granulaire de thèmes |
| ❌ Pas de recherche | ✅ Recherche puissante |
| ❌ Pas de statistiques | ✅ Stats en temps réel |
| ❌ Pas de gestion centralisée | ✅ Admin complet |
| ❌ Modification manuelle des fichiers | ✅ Import/Export automatique |
| ❌ Interface basique | ✅ Interface moderne et responsive |

---

**Bon quiz ! 🚀**
