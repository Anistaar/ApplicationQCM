# 📋 RÉSUMÉ : Configuration S1 + Génération OpenQ Macro

**Date** : 25 novembre 2025

---

## ✅ MODIFICATIONS EFFECTUÉES

### 1. **Parser filtré sur S1 uniquement**
**Fichier** : `src/courses.ts`  
**Changement** : Ajout d'un filtre pour ne charger que les questions du premier semestre

```typescript
.filter(([path]) => path.includes('/S1/') || !path.includes('/S2/') && !path.includes('/S3/') && !path.includes('/S4/'))
```

**Résultat** : L'application ne charge maintenant que les matières de S1 (MACRO, STATS, RIAE)

---

### 2. **Génération 40 questions OpenQ pour Macro Chapitre 1**
**Fichier créé** : `src/questions/S1/MACRO/macro_chap1_openq_v1.txt`  
**Contenu** : 40 questions ouvertes couvrant :
- Définitions de la consommation (sens strict, macro, élargie)
- Structure ressources/emplois des ménages
- Revenu disponible (calcul, composantes)
- Théorie keynésienne (fonction consommation, PMC, consommation autonome)
- Effet de cliquet (Duesenberry, revenu relatif)
- Théorie du cycle de vie (Modigliani, épargne intertemporelle, courbe en bosse)

**Format** : `OpenQ || Question || mots-clés || Référence cours || Explication`

**Niveaux Bloom** :
- 70% Compréhension (définir, expliquer, décrire)
- 20% Application (calculer, appliquer)
- 10% Analyse (comparer, distinguer)

---

## 📚 COURS MACRO : LOCALISATION

### Fichiers source (transcriptions)
📍 **src/cours/MACRO_cours_transcription.txt** (546 lignes)
- Contenu : Transcription complète du cours de macroéconomie
- Chapitres : Intro, Consommation, Investissement, Modèles (Classique, Keynésien)

### Fichiers questions Macro (S1/MACRO)
📍 **src/questions/S1/MACRO/** (13 fichiers)
- `BANQUE_QUESTIONS_MACRO_v1.txt`
- `Consommation_v2.txt`
- `DragMatch_v1.txt`
- `Intro_v2.txt`
- `Investissement_v2.txt`
- `macro_chap0_intro.txt`
- **`macro_chap1_consommation.txt`** ⭐ (577 lignes - chapitre 1)
- `macro_chap2_investissement.txt`
- `macro_chap3_modele_classique_reel.txt`
- `macro_chap3_theorie_quantitative_monnaie.txt`
- `macro_chap4_modele_keynesien.txt`
- `macro_unclassified.txt`
- `ModeleClassique_v2.txt`
- **`macro_chap1_openq_v1.txt`** ✨ (nouveau - 40 OpenQ)

---

## 🎯 PROMPTS DISPONIBLES

### 1. **Generate OpenQ**
📍 **prompts/generate-openq.md**
- Mission : Créer questions ouvertes depuis section cours
- Format : OpenQ || Question || keywords || Référence || Explication
- Taxonomie Bloom : 70% Compréhension, 20% Application, 10% Analyse
- Validation : Fuzzy matching sur mots-clés (Levenshtein ≤2)

### 2. **Split Course Sections**
📍 **prompts/split-course-sections.md**
- Mission : Découper cours en sections thématiques
- Usage : Préparer input pour generate-openq.md

---

## 📊 STATISTIQUES S1

### Fichiers questions par matière
- **MACRO** : 14 fichiers (dont 1 nouveau OpenQ)
- **STATS** : ~30 fichiers (chapitres 1-4, partiels)
- **RIAE** : ~10 fichiers (micro, HPE)

### Total S1 : **~54 fichiers**

---

## 🔧 UTILISATION

### Lancer l'application (S1 uniquement)
```bash
npm run dev
```

### Tester les OpenQ Macro Chapitre 1
1. Ouvrir l'application
2. Sélectionner **Matière : MACRO**
3. Sélectionner **Cours : Macro Chap1 Openq V1**
4. Cocher **Type : OpenQ**
5. Lancer session

### Générer d'autres OpenQ
1. Lire le cours source : `src/cours/MACRO_cours_transcription.txt`
2. Identifier sections (Chapitre 2 : Investissement, Chapitre 3 : Modèles)
3. Utiliser prompt `prompts/generate-openq.md`
4. Créer fichiers : `macro_chap2_openq_v1.txt`, `macro_chap3_openq_v1.txt`, etc.

---

## 🎓 PÉDAGOGIE OPENQ

### Avantages
- ✅ Compréhension profonde (vs reconnaissance QCM)
- ✅ Mobilisation active concepts (vs élimination)
- ✅ Feedback précis via mots-clés manquants
- ✅ Préparation questions ouvertes examens

### Format validation
**Critère STRICT** : L'utilisateur doit citer **TOUS** les mots-clés
- Exemple : Question "Citez les composantes du revenu primaire"
- Mots-clés : `revenu activité,revenu patrimoine`
- ✅ Réponse valide : "Le revenu primaire comprend le revenu d'activité et le revenu du patrimoine"
- ❌ Réponse invalide : "Le revenu primaire comprend les salaires" (manque patrimoine)

### Fuzzy matching
Tolère erreurs typographiques (distance Levenshtein ≤ 2)
- `consomation` → `consommation` ✅
- `epargne` → `épargne` ✅
- `keines` → `keynes` ✅

---

## 📝 PROCHAINES ÉTAPES

### Générations OpenQ suggérées
1. **Macro Chapitre 2** : Investissement (FBCF, accélérateur, VAN/TRI)
2. **Macro Chapitre 3** : Modèles (Classique vs Keynésien, équilibre)
3. **Stats Chapitre 1** : Notions statistiques (déjà ~30 questions VF/QCM, ajouter OpenQ)
4. **RIAE Micro** : Bases analyse économique (offre/demande, élasticités)

### Corrections prioritaires (audit)
- 🔴 14 questions "Laquelle est fausse ?" → Remplacer par VF séquentiels
- 🟡 40 termes flous ("souvent", "peut") → Préciser
- 🟡 42 comparaisons sans référence → Ajouter contexte

---

## 🔍 AUDIT CONFUSIONS S1

**Questions à confusion en S1** : 16 sur 501 (3.2%)
- Macro : 4 questions (23.5% du sous-ensemble analysé)
- Stats : Variable selon fichiers
- RIAE : 0 détecté

**Fichiers concernés** :
- `S1/MACRO/Intro_v2.txt` : 1 ("Laquelle est fausse ?")
- `S1/MACRO/Investissement_v2.txt` : 1 ("Laquelle est fausse ?")
- `macroCH1.txt` : 4 (termes flous "peut", comparaisons)

---

## ✨ RÉSUMÉ RAPIDE

```
✅ Parser filtré → S1 uniquement (MACRO, STATS, RIAE)
✅ 40 OpenQ générées → macro_chap1_openq_v1.txt
✅ Build passant → 133 modules, 428ms
✅ Prompts disponibles → generate-openq.md prêt à l'emploi
✅ Cours source localisé → src/cours/MACRO_cours_transcription.txt
```

**Prêt pour** : Session test OpenQ Macro Chapitre 1 ! 🚀
