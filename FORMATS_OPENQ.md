# 📖 Format OpenQ — Questions Ouvertes

## Description

Les questions **OpenQ (Open Question)** permettent à l'utilisateur de rédiger une réponse libre. La validation est **binaire** (juste/faux) basée sur la présence de **mots-clés essentiels**.

## Format

```
OpenQ || Question || keyword1,keyword2,keyword3 || Référence cours || Explication
```

### Colonnes détaillées

1. **Type** : `OpenQ` (fixe)
2. **Question** : Question ouverte nécessitant une réponse rédigée (10-20 mots)
3. **Mots-clés** : Liste de 3-5 concepts essentiels séparés par virgules (lowercase)
   - **Rôle** : Critères de validation (TOUS doivent apparaître dans la réponse)
   - **Format** : Lowercase, pas d'accents si possible, termes techniques précis
4. **Référence cours** : Extrait exact du cours (1-2 phrases) servant de correction
5. **Explication** : Importance pédagogique (1 phrase courte)

## Exemples par Matière

### Macroéconomie (CH2 Investissement)

```
OpenQ || Que signifie FBCF et que recouvre cette notion ? || fbcf,formation brute capital fixe,biens production,stocks || La FBCF correspond aux acquisitions de biens de production durables et variations de stocks || Définition fondamentale en comptabilité nationale

OpenQ || Pourquoi l'investissement est-il plus volatil que la consommation ? || anticipations,demande,incertitude,taux intérêt || L'investissement dépend des anticipations de demande future et du coût du capital. Une variation des anticipations entraîne des ajustements immédiats || Comprendre la volatilité explique les cycles économiques

OpenQ || Expliquez le principe de l'accélérateur selon Clark || accélérateur,demande,variations,proportionnelle,investissement || Le principe de l'accélérateur (Clark, 1917) stipule qu'une hausse de la demande entraîne une hausse plus que proportionnelle de l'investissement || Mécanisme d'amplification des cycles
```

### Analyse Économique (Ricardo — Avantages Comparatifs)

```
OpenQ || Définissez la notion de coût d'opportunité dans le modèle ricardien || coût opportunité,production abandonnée,alternative,relatif || Le coût d'opportunité représente la quantité d'un bien qu'il faut abandonner pour produire une unité supplémentaire d'un autre bien || Concept central des avantages comparatifs

OpenQ || Pourquoi deux pays peuvent-ils gagner à échanger même si l'un est plus productif dans tout ? || avantages comparatifs,coûts relatifs,spécialisation,différences || Ricardo montre que les gains à l'échange dépendent des différences de coûts relatifs et non des coûts absolus || Contre-intuition fondamentale du commerce international

OpenQ || Comment détermine-t-on le pays qui doit se spécialiser dans un bien donné ? || coût opportunité,plus faible,comparatif,spécialisation || Le pays ayant le coût d'opportunité le plus faible pour un bien doit se spécialiser dans sa production || Règle de décision de la spécialisation
```

### Statistiques (Chapitre 3 — Corrélation)

```
OpenQ || Que mesure le coefficient de corrélation de Pearson ? || corrélation,linéaire,relation,intensité,direction || Le coefficient de corrélation de Pearson mesure l'intensité et la direction d'une relation linéaire entre deux variables quantitatives || Indicateur statistique fondamental

OpenQ || Pourquoi une corrélation élevée n'implique pas nécessairement une causalité ? || corrélation,causalité,variable confondante,relation spurieuse || Une corrélation peut refléter une variable confondante ou une relation spurieuse sans lien causal direct || Précaution méthodologique essentielle
```

## Règles de Validation

### Validation Spartiate (Binaire)
- ✅ **JUSTE** : TOUS les mots-clés présents dans la réponse (exact ou fuzzy ≤2)
- ❌ **FAUX** : Au moins 1 mot-clé manquant

### Fuzzy Matching (Tolérances)
- **Levenshtein distance ≤ 2** : Accepte typos
  - `investisement` ≈ `investissement` (distance 1) ✅
  - `anticipasion` ≈ `anticipation` (distance 2) ✅
  - `anticpation` ≈ `anticipation` (distance 2) ✅
  - `anipation` ≈ `anticipation` (distance 3) ❌

### Normalisation
- Lowercase automatique
- Suppression ponctuation (`,` `.` `!` `?` `;` `:` `'` `"` `(` `)`)
- Tokenization par espaces
- Filtrage mots < 3 caractères

## Feedback Utilisateur

### Réponse Juste
```
✅ Correct !
[Son de succès : beep 800Hz, 0.3s]

📖 Référence cours :
> [Extrait exact du cours]

💡 Pourquoi c'est important :
> [Explication pédagogique]
```

### Réponse Fausse
```
❌ Incomplet
[Pas de son]

🔑 Mots-clés attendus : anticipations, demande, taux intérêt

📖 Référence cours :
> L'investissement dépend des anticipations de demande future et du coût du 
> capital (taux d'intérêt). Une variation des anticipations entraîne des 
> ajustements immédiats.

💡 Conseil : Mentionnez tous les concepts clés de la référence
```

## Conseils Rédaction

### Principe : 1 notion = 1 question
- ✅ "Définissez FBCF"
- ✅ "Citez 3 composantes de la FBCF"
- ✅ "Pourquoi la FBCF est importante ?"
- ❌ "Définissez FBCF, citez ses composantes et expliquez son importance" (trop large)

### Définitions multi-parties : Séquence ordonnée
Pour concepts complexes, créer 2-3 questions successives :

```
OpenQ || Définissez la FBCF || fbcf,formation brute capital fixe || ...
OpenQ || Citez trois composantes de la FBCF || biens production,stocks,variations || ...
OpenQ || Pourquoi la FBCF est-elle un indicateur clé en macro ? || investissement,croissance,capacité productive || ...
```

### Mots-clés = concepts techniques
- ✅ `fbcf`, `anticipations`, `coût opportunité`, `levier keynésien`
- ❌ `important`, `économie`, `concept`, `chose`

### Référence cours = citation exacte
- Copier-coller du cours original
- 1-2 phrases max (lisibilité)
- Pas de paraphrase (crédibilité pédagogique)

## Statistiques Cibles

- **1 cours (80 lignes)** → **6 sections** → **40-60 questions OpenQ**
- **Temps génération LLM** : ~5 min (Claude Sonnet, Gemini Pro, GPT-4)
- **Coverage** : 100% du contenu pédagogique

## Intégration Workflow

1. **Découpage cours** : Utiliser `prompts/split-course-sections.md`
2. **Génération questions** : Utiliser `prompts/generate-openq.md`
3. **Import application** : Parser reconnaît `OpenQ ||` automatiquement
4. **Mode pratique** : Utilisateur rédige → validation binaire → feedback audio (succès)

---

**Version** : 1.0  
**Date** : 25 novembre 2025  
**Experts** : Dr. Sophie Bernard (Pédagogie), Prof. Ahmed Tahir (Contenu), Laura Chen (UX)
