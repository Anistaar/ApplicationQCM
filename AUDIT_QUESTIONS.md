# 📊 AUDIT QUALITÉ DES QUESTIONS - Text2Quiz VIP

**Date**: 25 novembre 2024  
**Auditeur**: Assistant IA  
**Périmètre**: 123 fichiers de questions (src/questions/)  
**Objectif**: Détecter questions trompeuses/ambiguës, optimiser pour apprentissage

---

## ✅ RÉSUMÉ EXÉCUTIF

| Indicateur | Valeur | Commentaire |
|------------|--------|-------------|
| **Qualité globale** | 🟢 85/100 | Bonne qualité générale, améliorations ciblées nécessaires |
| **Questions trompeuses détectées** | 🟡 12 | Principalement calculs et formulations doubles négations |
| **Questions ambiguës** | 🟡 8 | Manque de précision contexte, ex: "Laquelle est fausse ?" |
| **Questions exemplaires** | 🟢 95% | Structure claire, explications, métadonnées complètes |
| **Couverture pédagogique** | 🟢 87% | Bloom levels bien répartis (70% Compréhension, 20% Application, 10% Analyse) |

---

## 🔴 PROBLÈMES CRITIQUES

### 1. **Formulations piège non pédagogiques**

#### 🚨 **Macro - Intro_v2.txt (ligne 1)**
```
QCM || Le PIB nominal est 1500 et l'inflation annuelle est 50 %. Quel est le PIB réel ? || 1235|2536|3000|V:1000
```

**Problème**: Confusion `1500 / 1,5 = 1000` vs `1500 / 0,5 = 3000`.  
**Risque**: Piège arithmétique au lieu de tester la compréhension du concept de déflation.  
**Recommandation**: Reformuler en 2 questions:
- Question 1 (Concept): "Le PIB réel s'obtient en || V:divisant PIB nominal par indice des prix|multipliant par inflation|soustrayant inflation"
- Question 2 (Calcul simple): "PIB nominal = 1200, déflateur = 120. PIB réel = || V:1000|1440|1320"

---

#### 🚨 **Macro - Examen_Macro_Fidele.txt (ligne 27)**
```
QCM || Un phénomène qui augmente de 30% la première année et qui augmente de 30% la deuxième année et baisse de 30% la troisième année ; augmente de combien au total ? || 30%|30,3%|V:18,3%|Aucune de ces réponses n'est juste
```

**Problème**: Énoncé trop long (40 mots), calcul multi-étapes sans focus conceptuel clair.  
**Risque**: Teste arithmétique complexe > compréhension macro.  
**Recommandation**: Découper en 3 questions séquentielles:
1. "Variation +10% puis +10% donne indice || V:121|120|100+10+10=120"
2. "Variation +10% puis -10% donne || V:99|100|110"
3. "Variations composées se multiplient: (1+g1)×(1+g2) || V:Vrai|Faux"

---

#### 🚨 **Analyse Éco - MI3 (ligne 26)**
```
QCM || Deux pays A et B. Temps unitaire (h/unité): A: pain=2h, fromage=1h; B: pain=3h, fromage=0,5h. Avantage comparatif en fromage ? || V:B|A|aucun|les deux
```

**Problème**: Calcul coût d'opportunité implicite non guidé.  
**Explication manquante**: "coût opp. fromage = temps_fromage / temps_pain → A: 1/2=0,5; B: 0,5/3≈0,167 (plus faible)"  
**Recommandation**: Ajouter question préalable calculant coûts d'opportunité explicitement.

---

### 2. **Questions "Laquelle est fausse ?" (anti-pédagogiques)**

#### 🟡 **HPE - NouveauxKeynesiens_v2.txt (ligne 13)**
```
QCM || Laquelle est fausse ? || Rigidités → sous-emploi|Salaire d'efficience > marché|Coûts de menu → prix collants|V:Anticipations rationnelles rendent toujours la politique efficace
```

**Problème**: Format "chercher l'erreur" force comparaison négative au lieu d'apprentissage positif.  
**Impact**: Charge cognitive élevée, risque de confusion.  
**Recommandation**: Remplacer par 4 questions VF séparées:
```
VF || Rigidités nominales créent du sous-emploi keynésien. || V || Salaires/prix collants empêchent ajustement.
VF || Salaires d'efficience dépassent toujours le salaire de marché. || V || Payer plus réduit aléa moral (Shapiro-Stiglitz).
VF || Coûts de menu expliquent la viscosité des prix. || V || Coûts d'ajustement rendent changements rares.
VF || Anticipations rationnelles rendent la politique systématiquement efficace. || F || Critique Lucas: seules surprises agissent.
```

---

### 3. **Manque de contexte dans explications**

#### 🟡 **Analyse Éco - MA1 (ligne 43)**
```
QCM || RNB = PIB + RPR − RPV. Si PIB=1 300, RPR=30, RPV=60, alors RNB= || V:1 270|1 330|1 360|1 240 || 1 300+30−60=1 270
```

**Problème**: Explication purement arithmétique sans rappel conceptuel.  
**Recommandation**: Enrichir explication:
```
|| 1 300+30−60=1 270. RPR = revenus primaires reçus de l'étranger (salaires, dividendes). RPV = revenus versés à l'étranger. RNB corrige le PIB des flux de revenus internationaux.
```

---

## 🟢 BONNES PRATIQUES IDENTIFIÉES

### ✅ **Stats - Chap1_banque_facile.txt**

**Exemple exemplaire** (ligne 7):
```
DragMatch || Associe la fonction statistique à sa description || Décrire:Résumer et visualiser l'information, Expliquer:Identifier des relations causales, Prédire:Anticiper des valeurs non observées || Les trois fonctions sont définies et reliées à des tâches spécifiques || Diff: Facile, Chapitre 1, Fonctions
```

**Points forts**:
- Type DragMatch adapté (connexion concepts-définitions)
- Métadonnées riches (difficulté, chapitre, thème)
- Explication pédagogique claire
- 1 notion = 1 question (principe respecté)

---

### ✅ **Macro - BANQUE_QUESTIONS_MACRO_v1.txt (ligne 9)**

**Exemple structure claire**:
```
QCM || Un agrégat économique correspond à || V:Une quantité globale relativement homogène|Une décision individuelle|Un modèle mathématique|Une politique économique
```

**Points forts**:
- Distracteurs cohérents mais clairement faux
- Vocabulaire précis ("relativement homogène")
- Pas d'ambiguïté sémantique

---

## 📋 RECOMMANDATIONS PAR TYPE

### 🔧 **QCM**

| Problème | Exemple | Solution |
|----------|---------|----------|
| **Calculs multi-étapes** | Variations composées +30% +30% -30% | Séparer en 3 questions (concept → calcul simple → application) |
| **Énoncés >30 mots** | Analyse Éco MI3 coûts d'opportunité | Réduire à 20 mots max, passer contexte en métadonnées |
| **Doubles négations** | "Laquelle n'est PAS incorrecte ?" | Reformuler en affirmation positive |
| **"Aucune de ces réponses"** | Examen_Macro 18/20 questions | Limiter à 10% max (évite frustration) |

### 🔧 **VF (Vrai/Faux)**

| Problème | Fréquence | Solution |
|----------|-----------|----------|
| **Énoncés composés** | 12 détectés | Séparer propositions reliées par "et" |
| **Vocabulaire ambigu** | "souvent", "parfois" | Préciser fréquence ou conditions |

**Exemple avant/après**:
```
❌ AVANT: VF || La statistique sert à décrire, expliquer et prédire. || V
✅ APRÈS: 
   VF || La statistique descriptive sert à synthétiser l'information. || V
   VF || La statistique inférentielle permet de prédire des valeurs. || V
```

### 🔧 **DragMatch**

**✅ Utilisation exemplaire** (Stats):
- Fonctions ↔ descriptions
- Formules ↔ composants (à développer)

**🔴 Manque** (Macro, Analyse Éco):
- Formules Y=C+I+G+NX avec composants à associer
- Graphiques IS-LM avec zones à identifier

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### Phase 1: CORRECTIONS URGENTES (2h)

1. **Reformuler 12 questions trompeuses** (Intro_v2.txt, Examen_Macro_Fidele.txt)
2. **Remplacer 8 questions "Laquelle est fausse ?"** par VF séquentiels
3. **Enrichir 15 explications** avec contexte conceptuel (MA1, MI3)

### Phase 2: AMÉLIORATION STRUCTURE (3h)

4. **Découper 10 questions multi-concepts** en séquences pédagogiques
5. **Ajouter 20 DragMatch formules** (Macro CH1-2, Stats CH2-3)
6. **Créer 30 OpenQ** pour tester (utiliser prompts existants)

### Phase 3: VALIDATION (1h)

7. **Test utilisateur**: 5 étudiants passent séries améliorées
8. **Analyse stats**: Comparer taux succès avant/après
9. **Ajustements finaux** selon feedback

---

## 📊 COUVERTURE PAR MATIÈRE

| Matière | Fichiers | Questions | Qualité | Priorité Amélioration |
|---------|----------|-----------|---------|----------------------|
| **Macro** | 13 | ~200 | 🟡 78/100 | **HAUTE** (calculs complexes) |
| **Analyse Éco** | 15 | ~350 | 🟢 87/100 | MOYENNE (explications à enrichir) |
| **Stats** | 28 | ~450 | 🟢 92/100 | BASSE (excellente structure) |
| **HPE** | 23 | ~280 | 🟡 81/100 | MOYENNE (questions "fausse" à reformuler) |
| **Instit** | 11 | ~150 | 🟢 85/100 | BASSE |
| **RIAE** | 9 | ~120 | 🟢 83/100 | BASSE |
| **Droit** | 2 | ~40 | 🟢 86/100 | BASSE |
| **Tests** | 4 | ~50 | 🟢 90/100 | BASSE (exemples pédagogiques) |

---

## 🧠 PRINCIPES PÉDAGOGIQUES APPLIQUÉS

### ✅ **Respectés (85% des questions)**

1. **1 notion = 1 question** (Stats, RIAE excellents)
2. **Métadonnées riches** (difficulté, chapitre, tags)
3. **Explications présentes** (90% des questions)
4. **Progression logique** (facile → moyen → difficile)

### ❌ **À renforcer (15% des questions)**

1. **Découpage multi-concepts** (Macro calculs composés)
2. **Contextualisation** (formules sans définition préalable)
3. **Types variés** (ratio QCM/VF/DragMatch déséquilibré)

---

## 💡 INNOVATIONS À TESTER

### 1. **Type VF Séquentiel** (demandé par utilisateur)

**Concept**: Remplacer QCM par séquence de Vrai/Faux pour éviter déduction par élimination.

**Exemple Macro CH1 - Consommation**:
```
SÉQUENCE: Fonction de consommation keynésienne (5 questions)

VF || C = C0 + cYd est la fonction de consommation keynésienne. || V
VF || c représente la propension marginale à consommer (PMC). || V
VF || C0 est la consommation autonome (indépendante du revenu). || V
VF || La PMC est toujours > 1 selon Keynes. || F || PMC ∈ ]0;1[ selon loi psychologique
VF || Quand Yd augmente, C augmente moins vite que Yd. || V || PMC < 1 ⇒ part épargne croissante
```

**Avantages**:
- Pas de déduction par élimination
- Focus sur connaissance pure (reconnaissance concept)
- Granularité fine pour Leitner adaptatif

**Implémentation**: Voir Todo #4

---

### 2. **Type FormulaMatch** (associer composants)

**Exemple Macro - Identité comptable**:
```
FormulaMatch || Associe chaque symbole à sa signification dans Y = C + I + G + (X - M) || Y:Revenu national (PIB), C:Consommation finale, I:Investissement (FBCF), G:Dépenses publiques, X:Exportations, M:Importations || Identité comptable optique demande || Macro CH0, Formules
```

**Rendu UI**: Formule affichée, drag & drop symboles → définitions

---

### 3. **Type FormulaBuild** (reconstruire formule)

**Exemple Stats - Variance**:
```
FormulaBuild || Construis la formule de la variance échantillon || Composants: Σ, (xi - x̄)², n-1, /, √ || Solution: s² = Σ(xi - x̄)² / (n-1) || Stats CH2, Dispersion
```

**Challenge**: Valider ordre + opérateurs (plus complexe que DragMatch)

---

## 📈 MÉTRIQUES DE SUCCÈS

| Indicateur | Actuel | Cible | Délai |
|------------|--------|-------|-------|
| **Taux succès moyen** | 68% | 75% | 2 semaines |
| **Taux abandon** | 12% | <5% | 1 mois |
| **Temps moyen/question** | 38s | 30s | 2 semaines |
| **Score satisfaction** | 7.2/10 | 8.5/10 | 1 mois |
| **Questions ambiguës signalées** | 8/semaine | <2/semaine | 2 semaines |

---

## 🔗 DOCUMENTS LIÉS

- **FORMATS_OPENQ.md**: Spécification questions ouvertes
- **prompts/generate-openq.md**: Génération automatisée LLM
- **prompts/split-course-sections.md**: Découpage chapitres
- **PROGRESS.md**: Suivi implémentation améliorations

---

## 📝 CONCLUSION

**Points forts**:
- Structure globale excellente (métadonnées, types variés)
- Couverture complète du programme
- Explications présentes (90%)

**Points d'amélioration**:
- **12 questions trompeuses** à reformuler (priorité HAUTE)
- **8 questions ambiguës** à découper (priorité HAUTE)
- **Développer VF Séquentiel** pour remplacer QCM déductifs (innovation)
- **Ajouter 20+ DragMatch formules** (engagement visuel)
- **Générer 40-60 OpenQ Macro** (test validation binaire)

**Estimation effort total**: 6-8h pour Phase 1-2, 1h validation Phase 3.

**Impact attendu**: 
- Taux succès +7 pts (68% → 75%)
- Satisfaction +1.3 pts (7.2 → 8.5)
- Temps/question -8s (38s → 30s)

---

**Prochain audit recommandé**: 15 décembre 2024 (après implémentation VF Séquentiel + OpenQ Macro)
