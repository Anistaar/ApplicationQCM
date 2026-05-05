# 📚 GUIDE PÉDAGOGIQUE - Text2Quiz VIP

**Version**: 1.0  
**Date**: 25 novembre 2024  
**Objectif**: Optimiser la structure des questions pour maximiser l'apprentissage

---

## 🎯 PRINCIPES FONDAMENTAUX

### 1. Découpage par micro-concepts

**Règle d'or**: **1 notion = 1 question**

| ❌ À éviter | ✅ Recommandé |
|-------------|---------------|
| "La fonction de consommation keynésienne C = C0 + cYd. C0 est la consommation autonome, c la propension marginale (PMC), Yd le revenu disponible. La PMC est comprise entre 0 et 1." | **Séquence de 4 questions VF**:<br>1. C = C0 + cYd est la fonction keynésienne. ✓<br>2. C0 représente la consommation autonome. ✓<br>3. c (PMC) est toujours > 1. ✗<br>4. PMC ∈ ]0;1[ selon loi psychologique. ✓ |

**Avantages**:
- Granularité fine → meilleure adaptation Leitner
- Pas de surcharge cognitive (working memory limité à 7±2 items)
- Feedback précis sur chaque concept

---

### 2. Groupes de questions (sessions)

#### Taille optimale par session

| Niveau étudiant | Questions/session | Durée estimée | Fréquence recommandée |
|-----------------|-------------------|---------------|-----------------------|
| **Débutant** | 10-15 | 8-12 min | 2-3x/jour |
| **Intermédiaire** | 20-25 | 15-20 min | 1-2x/jour |
| **Avancé** | 30-40 | 25-35 min | 1x/jour |

**Recommandation par défaut**: **20 questions** (compromis optimal engagement/fatigue)

#### Règles de composition

1. **Diversité types**: 60% QCM, 20% VF, 10% DragMatch, 10% OpenQ
2. **Progression difficulté**: Facile (30%) → Moyen (50%) → Difficile (20%)
3. **Espacement thématique**: Alterner sujets pour éviter confusion (ex: Keynes → Ricardo → Keynes)
4. **Ancrage début/fin**: 
   - Début: Questions faciles (confiance ↑)
   - Fin: Question défi (motivation ↑)

---

### 3. Espacement par Leitner adaptatif

#### Boîtes de révision

| Boîte | Force | Intervalle minimal | Révision due si |
|-------|-------|--------------------|-----------------|
| **1** (Nouveau) | 0-20% | Immédiat | Jamais vu |
| **2** (Fragile) | 20-40% | 1 jour | Erreur récente |
| **3** (En cours) | 40-60% | 3 jours | Moyenne confiance |
| **4** (Solide) | 60-80% | 7 jours | Bonne maîtrise |
| **5** (Maîtrisé) | 80-100% | 14-30 jours | Expertise |

#### Sévérité erreur (impact rétrogradation)

```typescript
severity = 1 - confidence × (1 - (timeMs / idealTimeMs))

severity < 0.3 → mild   : -1 boîte, required = 1
severity ≥ 0.3 < 0.6 → medium : -2 boîtes, required = 2
severity ≥ 0.6 → severe : -3 boîtes, required = 3
```

**Cas pratiques**:

| Scénario | Calcul sévérité | Rétrogradation | Répétitions requises |
|----------|-----------------|----------------|---------------------|
| Réponse correcte rapide | 0.1 (mild) | Aucune (promotion) | 1 |
| Erreur légère (hésitation) | 0.35 (medium) | -2 boîtes | 2 successives avant promotion |
| Erreur grave (confusion) | 0.75 (severe) | -3 boîtes | 3 successives avant promotion |

---

## 📊 DÉCOUPAGE OPTIMAL D'UN CHAPITRE

### Étapes recommandées

#### 1️⃣ **Analyse du contenu source** (15 min/chapitre)

**Objectif**: Identifier concepts atomiques

**Exemple** - Macro CH1 Consommation (80 lignes cours):

```
Concepts identifiés (12 au total):
1. Définition consommation
2. Fonction keynésienne C = C0 + cYd
3. Propension marginale (PMC)
4. Propension moyenne (PmC)
5. Loi psychologique fondamentale
6. Théorie cycle de vie (Modigliani)
7. Revenu permanent (Friedman)
8. Effet Duesenberry
9. Contrainte liquidité
10. Épargne de précaution
11. Limites modèle keynésien
12. Études empiriques
```

#### 2️⃣ **Regroupement en sections** (10 min)

**Principe**: 3-5 concepts par section (cohérence thématique)

```
Section 1: Bases keynésiennes (concepts 1-5) → 25-35 questions
Section 2: Théories avancées (concepts 6-9) → 20-30 questions
Section 3: Critique & empirisme (concepts 10-12) → 15-20 questions
```

**Total chapitre**: 60-85 questions (espacement 4-6 semaines révision complète)

#### 3️⃣ **Génération questions par concept** (automatisé via LLM)

**Répartition Bloom par concept**:

| Taxonomie | % Questions | Types recommandés | Exemples Macro CH1 |
|-----------|-------------|-------------------|--------------------|
| **Connaissance** | 40% | VF, QR | "C0 est la consommation autonome. Vrai/Faux ?" |
| **Compréhension** | 30% | QCM, OpenQ | "Pourquoi PMC < 1 selon Keynes ?" |
| **Application** | 20% | Calculs, DragMatch | "Si C0=100, c=0.75, Yd=400 → C = ?" |
| **Analyse** | 10% | OpenQ difficiles | "Comparer cycle de vie vs revenu permanent" |

**Prompt LLM** (voir `prompts/generate-openq.md`):
```
Génère 6-10 questions sur "Propension marginale à consommer":
- 4 VF (définition, propriétés, formule, interprétation)
- 2 QCM (calculs simples 0 < c < 1)
- 2 OpenQ (explication économique, différence PmC vs PMC)

Critères:
- 1 notion = 1 question (pas de multi-concepts)
- Keywords exact cours (validation fuzzy ≤2 Levenshtein)
- Métadonnées: Diff, Bloom, Tags
```

---

## 🔄 MODIFICATION GROUPES DE QUESTIONS

### Quand changer de groupe ?

#### Critères objectifs

| Indicateur | Seuil | Action |
|------------|-------|--------|
| **Maîtrise groupe** | ≥ 75% vues | ✅ Passer au suivant |
| **Précision groupe** | ≥ 80% correctes | ✅ Approfondir (questions difficiles) |
| **Temps moyen/question** | > 45s | ⚠️ Questions trop complexes → simplifier |
| **Taux abandon** | > 30% non terminées | 🔴 Groupe trop long → réduire à 15 |
| **Force moyenne** | < 0.3 après 3 sessions | 🔴 Revoir formulation (ambiguïté ?) |

#### Stratégies progression

**Progression linéaire** (débutants):
```
Semaine 1: Macro CH1 Section 1 (bases) → 5 sessions × 10 questions
Semaine 2: Macro CH1 Section 2 (avancées) → 4 sessions × 15 questions
Semaine 3: Macro CH1 Section 3 (critique) → 3 sessions × 20 questions
Semaine 4: Révision Macro CH1 complet → 2 sessions × 30 questions mixtes
```

**Progression spirale** (intermédiaires):
```
Jour 1: Macro CH1 bases (20q) + HPE Smith (10q)
Jour 2: Macro CH2 investissement (20q) + Analyse MA1 (10q)
Jour 3: Révision Macro CH1 + CH2 mixte (30q)
Jour 4: Stats CH1 (25q) + HPE Ricardo (15q)
...
```

**Révision espacée** (avancés):
```
Semaine 1-4: Apprentissage intensif (tous chapitres)
Semaine 5: Révision questions dues (algorithme Leitner)
Semaine 6: Examen blanc (50q multi-chapitres, mode examen)
Semaine 7: Ciblage faiblesses (dashboard analytics)
```

---

## 🎨 TYPES DE QUESTIONS (choix stratégiques)

### 1. **VF (Vrai/Faux)** - 40% des questions

**Usage optimal**:
- Définitions pures
- Propriétés mathématiques (ex: "PMC ∈ ]0;1[")
- Vérification rapide connaissance

**Avantages**:
- Vitesse réponse (15-20s moyenne)
- Granularité maximale (1 assertion = 1 question)
- Pas de déduction par élimination (vs QCM)

**Pièges à éviter**:
```
❌ "La PMC est toujours positive et inférieure à 1, sauf cas limites." 
   → Composé (2 assertions)

✅ Séparer en 2 VF:
   1. "La PMC est toujours positive." → V
   2. "La PMC peut dépasser 1 dans certains cas." → F
```

---

### 2. **QCM (Questionnaire Choix Multiple)** - 30% des questions

**Usage optimal**:
- Calculs avec résultats multiples
- Comparaisons (ex: "Différence Keynes vs Friedman")
- Applications conceptuelles

**Structure recommandée**:
```
Question (15-25 mots max)
  Réponse correcte (validé V:)
  Distracteur plausible 1 (erreur courante)
  Distracteur plausible 2 (confusion concept voisin)
  Distracteur évident (détection guess random)
```

**Exemple**:
```
QCM || Si C0=100, c=0.8, Yd=500 → C = ? || 
  V:500|480|600|Aucune réponse || 
  C = 100 + 0.8×500 = 500. Distracteurs: 480 (oubli C0), 600 (c=1) ||
  Diff: Moyen, Bloom: Application, Macro CH1
```

---

### 3. **DragMatch (Associations)** - 15% des questions

**Usage optimal**:
- Formules ↔ Composants (ex: Y:Revenu, C:Consommation)
- Auteurs ↔ Théories (ex: Keynes:Loi psychologique)
- Graphiques ↔ Zones (ex: IS-LM)

**Avantages pédagogiques**:
- Engagement visuel (temps réponse +20% vs QCM, mais mémorisation +35%)
- Évite guess (pas de 25% chance hasard)
- Mobilise mémoire spatiale

**Recommandation**: 3-6 paires max (au-delà = surcharge)

---

### 4. **OpenQ (Questions Ouvertes)** - 10% des questions

**Usage optimal**:
- Compréhension profonde (Bloom: Compréhension, Analyse, Synthèse)
- Explication mécanismes économiques
- Rédaction concise (entraînement examens)

**Validation binaire** (principe spartiate):
```
Attendu: ["propension marginale", "consommation", "revenu", "keynésienne"]
Réponse: "La PMC keynésienne est le ratio consommation supplémentaire / revenu supplémentaire"

Validation:
✅ "propension marginale" → fuzzy match "PMC" (Levenshtein ≤2)
✅ "consommation" → présent exact
✅ "revenu" → présent exact  
✅ "keynésienne" → présent exact

Résultat: CORRECT (ALL keywords présents)
```

**Feedback pédagogique**:
- ✅ Correct: Son succès + explication cours
- ❌ Incorrect: Silence + keywords manquants + référence cours

---

## 📈 OPTIMISATION CONTINUE

### Métriques à suivre (dashboard)

| KPI | Formule | Cible | Interprétation |
|-----|---------|-------|----------------|
| **Maîtrise** | Vues / Total | > 75% | Couverture globale |
| **Précision** | Correctes / Tentatives | > 75% | Qualité apprentissage |
| **Vitesse** | Temps moyen/question | 25-35s | Automatisation |
| **Rétention** | Force après 7 jours | > 0.6 | Consolidation long terme |
| **Engagement** | Sessions/semaine | 5-7 | Régularité |

### Actions correctives

**Si précision < 60%** :
1. Questions trop complexes → audit formulations (voir AUDIT_QUESTIONS.md)
2. Découpage insuffisant → séparer multi-concepts
3. Explications manquantes → enrichir métadonnées

**Si temps moyen > 45s** :
1. Énoncés trop longs → réduire à 20 mots max
2. Calculs multi-étapes → séquencer en sous-questions
3. Vocabulaire trop technique → glossaire inline

**Si abandon > 20%** :
1. Sessions trop longues → réduire à 15 questions
2. Monotonie types → varier (QCM → VF → DragMatch)
3. Difficulté mal calibrée → ajouter faciles début

---

## 🔧 OUTILS DISPONIBLES

### 1. **LLM Automation** (génération questions)

**Prompts disponibles**:
- `prompts/split-course-sections.md` → Découper cours en sections 15-20 lignes
- `prompts/generate-openq.md` → Générer 6-10 questions OpenQ par section

**Usage**:
```bash
# Exemple Claude/Gemini/GPT
Input: MacroCH2_investissement.txt (80 lignes)
Output: 6 sections × 8 questions = 48 questions OpenQ
Temps: ~5 min génération + 10 min validation manuelle
```

### 2. **Parser Cache** (performance)

**Optimisation**: 23ms → <1ms cache hit (×23 amélioration)

**Recommandation**: Préchargement anticipé
```typescript
// Preload courses in idle time
parserCache.preloadCourses([
  'MacroCH1', 'MacroCH2', 'AnalyseMA1'
]);
```

### 3. **IndexedDB Analytics** (500MB stockage)

**Logs disponibles** (dernières 100 tentatives/question):
```typescript
{
  ts: 1700000000000,  // Timestamp
  c: true,            // Correct
  t: 18000,           // TimeMs
  s: 0.25             // Severity
}
```

**Exploitations possibles** (à développer):
- Courbe rétention par question
- Heatmap difficulté par thème
- Prédiction temps révision optimal

---

## 📚 EXEMPLES PRATIQUES

### Cas d'usage 1: Étudiant débutant Macro

**Profil**: Première année, jamais vu macroéconomie

**Programme 4 semaines**:
```
Semaine 1 (Découverte):
- Jour 1-2: Intro concepts (agrégats, PIB) → 10 VF faciles/jour
- Jour 3-4: Fonction consommation → 15 QCM+VF/jour  
- Jour 5-6: Révision semaine → 20 mixtes/jour
- Jour 7: Repos (consolidation passive)

Semaine 2 (Approfondissement):
- Jour 1-2: Investissement → 15 questions/jour
- Jour 3-4: Modèle keynésien simple → 20 questions/jour
- Jour 5: Examen blanc CH1+CH2 → 30 questions mode examen
- Jour 6-7: Révision dues (algorithme Leitner)

Semaine 3 (Élargissement):
- Ajout HPE (Keynes biographie) → 10 questions/jour
- Analyse Éco MA1 (comptabilité) → 15 questions/jour
- Maintien révisions Macro

Semaine 4 (Consolidation):
- Focus questions boîte 1-2 (faibles) → 25/jour
- Examen blanc global (50q multi-matières)
- Analyse dashboard → cibler faiblesses
```

**Résultat attendu**: 75% maîtrise Macro CH1-2 après 4 semaines (120-150 questions vues)

---

### Cas d'usage 2: Révision examens (étudiant avancé)

**Profil**: Cours vu, révision 2 semaines avant partiel

**Stratégie intensive**:
```
Jour J-14 à J-8 (Phase 1: Balayage):
- Dashboard → identifier matières <60% précision
- Sessions 30 questions ciblées (boîtes 1-2)
- Types variés (60% QCM examen-like, 30% VF, 10% OpenQ)

Jour J-7 à J-4 (Phase 2: Examen blanc):
- Mode examen (50q, 40min chrono)
- Analyser erreurs → créer mini-sessions ciblées (10q/thème faible)
- Alterner examen blanc (matin) + révision ciblée (après-midi)

Jour J-3 à J-1 (Phase 3: Consolidation):
- Révision questions dues uniquement (algorithme Leitner)
- Flashcards mode (rapide, définitions pures)
- J-1: Repos mental (lecture légère cours, pas de nouvelles questions)

Jour J (Examen):
- Morning: 10 flashcards "réveil neuronal" (concepts clés)
- Exam: Appliquer stratégies entraînées
```

**Métriques cibles**:
- Précision >85% sur questions dues
- Temps moyen <30s (automatismes activés)
- Force moyenne >0.7 (rétention solide)

---

## 🎓 RÉFÉRENCES SCIENTIFIQUES

### Psychologie cognitive

1. **Spaced Repetition** (Ebbinghaus, 1885)
   - Courbe de l'oubli: 80% oubli après 24h sans révision
   - Révision espacée: ×2 rétention vs révision massive

2. **Leitner System** (Leitner, 1972)
   - Adaptation intervalle selon performance
   - Boîtes croissantes: 1j, 3j, 7j, 14j, 30j

3. **Retrieval Practice** (Roediger & Butler, 2011)
   - Tester > relire: +40% rétention long terme
   - Feedback immédiat: +25% apprentissage vs différé

4. **Cognitive Load Theory** (Sweller, 1988)
   - Working memory limitée (7±2 items)
   - Découpage micro-concepts réduit charge cognitive

### Pédagogie

5. **Bloom's Taxonomy** (Bloom, 1956; Anderson & Krathwohl, 2001)
   - 6 niveaux: Connaissance → Compréhension → Application → Analyse → Synthèse → Évaluation
   - Progression scaffolding: 40% bas niveau, 30% moyen, 20% haut, 10% expertise

6. **Mastery Learning** (Bloom, 1968)
   - 75-80% maîtrise requis avant progression
   - Feedback formatif continu (correction immédiate)

---

## 📌 CONCLUSION

### Checklist qualité questions

- ✅ **1 notion = 1 question** (pas de multi-concepts)
- ✅ **Métadonnées complètes** (difficulté, Bloom, tags, explication)
- ✅ **Énoncé ≤ 25 mots** (clarté maximale)
- ✅ **Distracteurs plausibles** (QCM: erreurs typiques, pas absurdes)
- ✅ **Validation binaire** (OpenQ: ALL keywords ou échec)
- ✅ **Progression Bloom** (40% Connaissance → 10% Analyse)
- ✅ **Espacement Leitner** (révisions dues respectées)

### Ressources liées

- **AUDIT_QUESTIONS.md**: Analyse qualité 123 fichiers, 12 questions trompeuses identifiées
- **FORMATS_OPENQ.md**: Spécification questions ouvertes, exemples par matière
- **prompts/generate-openq.md**: Automatisation LLM génération questions
- **prompts/split-course-sections.md**: Découpage intelligent chapitres

### Contact & contributions

Pour suggestions amélioration guide:
1. Tester approche 2 semaines
2. Analyser métriques dashboard
3. Proposer ajustements basés données empiriques

**Version**: 1.0 → 1.1 prévu après collecte feedback utilisateurs (décembre 2024)
