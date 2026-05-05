# Sprint 2 - Architecture JSON Universelle

**Date**: 30 novembre 2025  
**Statut**: ✅ Terminé

## 🎯 Objectifs

Définir une architecture TypeScript réutilisable pour représenter la structure hiérarchique de toutes les matières (MACRO, INSTIT, STATS, TEST) avec support des notions, progression, cross-cutting et spaced repetition.

## 📦 Livrables

### 1. **`src/types/structure.ts`** ✅
**Schéma TypeScript complet avec 25+ interfaces**

#### Types Principaux
- `SubjectStructure`: Structure complète d'une matière
- `Chapter`: Chapitre ou thème principal
- `Section`: Section (I, II, III)
- `SubSection`: Sous-section (1, 2, 3)
- `Notion`: Unité d'apprentissage (niveau granulaire)
- `CrossCutting`: Éléments transversaux (formules, auteurs, organisations)
- `CrossCuttingItem`: Item transversal détaillé

#### Types de Progression
- `NotionProgress`: État de maîtrise d'une notion
  - `masteryLevel`: 0 (nouveau) → 3 (maîtrisé)
  - `consecutiveCorrect`: Compteur pour progression (3 = passage niveau)
  - `nextReviewDate`: Date de prochaine révision (SM-2)
  - `easeFactor`: Facteur d'espacement (1.3 à 2.5)
  - `reviewHistory`: Historique complet des tentatives

- `ProgressStats`: Statistiques agrégées
  - `totalNotions`, `masteredNotions`, `inProgressNotions`, `newNotions`
  - `percentageComplete`

#### Types de Quiz
- `QuizConfig`: Configuration de session
  - Modes: `adaptive` | `manual` | `review` | `exam` | `marathon`
  - Filtres: notions, chapitres, difficulté
  - Options: shuffle, time limit, explanations

- `QuizSession`: Session active
- `QuizAnswer`: Réponse individuelle
- `SubjectStats`: Statistiques globales

#### Flexibilité
- `StructureType`: `sequential` (MACRO, STATS) | `thematic` (INSTIT) | `simple` (TEST)
- `Difficulty`: `Facile` | `Moyen` | `Difficile` | `Expert`
- Support relations entre notions (prérequis, notions liées)
- Cross-cutting avec metadata flexible (Nobel, fondation, formules LaTeX)

### 2. **`src/utils/structureHelpers.ts`** ✅
**19 fonctions utilitaires pour manipuler les structures**

#### Navigation
- `findNotion(structure, notionId)`: Trouve une notion par ID
- `getAllNotions(structure)`: Liste plate de toutes les notions
- `getChapterNotions(structure, chapterId)`: Notions d'un chapitre
- `getNotionPath(structure, notionId)`: Breadcrumb complet

#### Filtrage & Recherche
- `filterNotionsByTags(structure, tags[])`: Filtre par tags (OR logic)
- `filterNotionsByDifficulty(structure, minDiff)`: Filtre par difficulté
- `searchNotions(structure, query)`: Recherche textuelle (nom, description, keywords)
- `groupNotionsByDifficulty(structure)`: Groupe par difficulté

#### Progression
- `calculateProgressStats(notionIds[], progressMap)`: Calcule stats agrégées
- `getMissingPrerequisites(notion, progressMap)`: Prérequis non maîtrisés

#### Cross-Cutting
- `getCrossCuttingItemsForNotion(notionId)`: Formules/auteurs/organisations d'une notion
- `getNotionsForCrossCuttingItem(itemId)`: Notions associées à un item transversal

#### Relations
- `getRelatedNotions(structure, notionId)`: Notions liées

#### Validation
- `validateStructure(structure)`: Vérifie intégrité (IDs uniques, champs obligatoires)
- `countTotalQuestions(structure)`: Compte questions totales

### 3. **`src/database/structures/EXAMPLE_MACRO_Chap1.json`** ✅
**Exemple complet du Chapitre 1 MACRO (Consommation)**

#### Structure
```
MACRO
└── Chapitre 1: Consommation
    ├── Section I: Théorie keynésienne
    │   ├── 1. Fonction de consommation
    │   │   ├── Notion: Fonction de consommation keynésienne
    │   │   └── Notion: Consommation autonome (C0)
    │   ├── 2. Propensions à consommer et épargner
    │   │   ├── Notion: PMC
    │   │   ├── Notion: PME
    │   │   └── Notion: Multiplicateur keynésien
    │   └── 3. Loi psychologique fondamentale
    │       ├── Notion: Loi psychologique fondamentale
    │       └── Notion: L'épargne comme résidu
    └── Section II: Théories alternatives
        ├── 1. Revenu relatif (Duesenberry)
        │   └── Notion: Théorie du revenu relatif
        ├── 2. Cycle de vie (Modigliani)
        │   └── Notion: Théorie du cycle de vie
        └── 3. Revenu permanent (Friedman)
            └── Notion: Théorie du revenu permanent
```

#### Notions Détaillées (11 total)
Chaque notion contient:
- ✅ ID hiérarchique (`chap1.I.1.fonction-conso`)
- ✅ Name + Description détaillée
- ✅ Tags multiples (`["Chapitre1", "Consommation", "Keynes", "Fonction"]`)
- ✅ Difficulté (Facile/Moyen/Difficile)
- ✅ Temps estimé (5-15 minutes)
- ✅ Relations: `relatedNotions`, `relatedAuthors`, `relatedFormulas`
- ✅ Keywords pour recherche
- ✅ Examples concrets
- ✅ Prerequisites (optionnel)

#### Cross-Cutting Complet
**Formules (3)**:
- `formula-fonction-conso`: C = C0 + cY
- `formula-pmc-pme`: PMC + PME = 1
- `formula-multiplicateur`: k = 1/(1-c)

Chaque formule avec:
- LaTeX (`C = C_0 + cY`)
- Variables expliquées
- Notions liées
- Icône

**Auteurs (5)**:
- Keynes (1883-1946, britannique) ← Lié à 4 notions
- Modigliani (1918-2003, Nobel 1985) ← Cycle de vie
- Friedman (1912-2006, Nobel 1976) ← Revenu permanent
- Duesenberry (1918-2009) ← Revenu relatif
- Brown ← Effet démonstration

Chaque auteur avec:
- Nom complet
- Biographie courte
- Dates naissance/décès
- Prix Nobel (si applicable)
- Nationalité
- Notions associées

#### Metadata
- Version: "2.0"
- Type: "sequential"
- Temps total estimé: 101 minutes
- 11 notions pédagogiques
- 0 questions (à remplir au Sprint 4)

## 🎨 Architecture Highlights

### 1. **Flexibilité Multi-Matières**
```typescript
type StructureType = 'sequential' | 'thematic' | 'simple';
```
- **Sequential** (MACRO, STATS): Chapitres numérotés, progression linéaire
- **Thematic** (INSTIT): Thèmes transversaux, pas d'ordre strict
- **Simple** (TEST): Structure plate, minimal hierarchy

### 2. **Système de Maîtrise SM-2**
```typescript
interface NotionProgress {
  masteryLevel: 0 | 1 | 2 | 3;  // ⚪ 🔴 🟡 🟢
  consecutiveCorrect: number;    // 3 = passage niveau
  nextReviewDate: string;        // ISO 8601
  interval: number;              // Jours [1, 3, 7, 14, 30, 60, 90]
  easeFactor: number;            // 1.3 à 2.5
}
```

### 3. **Cross-Cutting Universel**
- **Formulas**: Formules mathématiques (MACRO, STATS)
- **Authors**: Économistes, théoriciens (MACRO, INSTIT)
- **Organizations**: Institutions (INSTIT uniquement)
- **Concepts**: Concepts théoriques (extensible)

### 4. **Relations Hiérarchiques**
```typescript
interface Notion {
  relatedNotions?: string[];      // Notions liées
  relatedAuthors?: string[];      // Auteurs liés
  relatedFormulas?: string[];     // Formules liées
  relatedOrganizations?: string[]; // Organisations (INSTIT)
  prerequisites?: string[];       // Prérequis
}
```

### 5. **Validation Structurelle**
```typescript
validateStructure(structure) → { valid: boolean, errors: string[] }
```
Vérifie:
- Champs obligatoires présents
- IDs uniques (chapters, sections, subsections, notions)
- Pas de doublons

## 📊 Statistiques

### Interfaces Créées
- **25 interfaces TypeScript** (types, progress, quiz, stats)
- **19 fonctions helper** (navigation, filtrage, progression, validation)
- **1 exemple JSON complet** (Chapitre 1 MACRO avec 11 notions)

### Couverture Fonctionnelle
✅ Hiérarchie 4 niveaux (Chapter > Section > SubSection > Notion)  
✅ Progression avec SM-2 (masteryLevel, intervals, easeFactor)  
✅ Cross-cutting (formulas, authors, organizations)  
✅ Quiz configuration (5 modes, filtres, options)  
✅ Statistiques agrégées (par chapitre, difficulté, global)  
✅ Validation structurelle  
✅ Recherche & filtrage  
✅ Relations entre notions  

## 🔄 Prochaines Étapes (Sprint 3)

### Priorité 1: MACRO (5 chapitres)
- Chap 0: Introduction (~100 questions)
- Chap 1: Consommation (~115 questions) ← **Exemple déjà fait**
- Chap 2: Investissement (~90 questions)
- Chap 3: Modèle classique (~105 questions)
- Chap 4: Modèle keynésien (~85 questions)

**Base**: INVENTAIRE_MACRO_COMPLET.md + analyse Sprint 1

### Priorité 2: STATS (4 chapitres)
- Chap 1: Collecte et représentation
- Chap 2: Graphiques
- Chap 3: Tendance centrale
- Chap 4: Dispersion

**Base**: INVENTAIRE_STATS_COMPLET.md

### Priorité 3: INSTIT (7 thèmes)
- FMI, OMC, BM (thèmes exhaustifs)
- Théorie néo-institutionnelle
- Gouvernance
- Stats institutions
- Comptabilité nationale

**Base**: INVENTAIRE_INSTIT_COMPLET.md

### Priorité 4: TEST (5 thèmes simples)
- Définitions, Technique, Statistiques, Organisation, Apprentissage

## 🎯 Validation Exemple

```bash
# Tester la validation
node -e "
const structure = require('./src/database/structures/EXAMPLE_MACRO_Chap1.json');
const { validateStructure } = require('./src/utils/structureHelpers.ts');
console.log(validateStructure(structure));
"
```

**Résultat attendu**: `{ valid: true, errors: [] }`

## 🚀 Impact

Cette architecture permet:
1. **Universalité**: Toutes les matières avec le même schéma
2. **Extensibilité**: Facile d'ajouter des matières/notions
3. **Type-safety**: TypeScript garantit la cohérence
4. **Granularité**: Notion = unité d'apprentissage atomique
5. **Traçabilité**: Progression individuelle par notion
6. **Flexibilité**: 3 types de structures (sequential/thematic/simple)
7. **Relations**: Liens entre notions, formules, auteurs
8. **Validation**: Vérification automatique d'intégrité

---

**Sprint 2 complété avec succès ! 🎉**  
**Temps estimé**: ~3 heures de conception + implémentation  
**Prêt pour Sprint 3**: Création des structures JSON complètes

