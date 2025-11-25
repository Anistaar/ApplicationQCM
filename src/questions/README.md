# ❓ Dossier Questions

Ce dossier contient les **banques de questions** utilisées par l'application.

## Structure

```
questions/
├── ANALYSE_ECO/       # Analyse Économique (Ricardo, Marx, Smith, etc.)
├── DROIT/             # Droit
├── HPE/               # Histoire Pensée Économique
├── INSTIT/            # Institutions
├── MACRO/             # Macroéconomie (CH1, CH2, etc.)
├── RIAE/              # Relations Internationales et Affaires Européennes
├── STATS/             # Statistiques (Chap 1-4, partiels)
├── TEST_PLAN/         # Tests techniques
└── test_*.txt         # Fichiers de test (DragMatch, OpenQ)
```

## Formats Supportés

### Types de Questions
- **QCM** : Questions à choix multiples (≥1 bonnes réponses)
- **QR** : Questions à réponse unique (1 seule bonne réponse)
- **VF** : Vrai/Faux
- **DragMatch** : Glisser-déposer (associer paires)
- **OpenQ** : Questions ouvertes (réponse rédigée)

### Documentation
- Formats détaillés : `/FORMATS_QUESTIONS.md`
- Format OpenQ : `/FORMATS_OPENQ.md`

## Naming Convention

Format recommandé : `[matière]_[chapitre]_[type].txt`

**Exemples** :
- `macro_ch1_qcm.txt` : Macro chapitre 1, QCM
- `analyse_eco_mi3_qcm.txt` : Analyse Éco MI3, QCM
- `stats_partiel_chap3_qcm.txt` : Stats partiel chapitre 3
- `hpe_smith_openq.txt` : HPE Smith, questions ouvertes

## Métadonnées (Première Ligne)

```
chapter: Matière > Chapitre > Section
```

**Exemple** :
```
chapter: Macroéconomie > CH2 Investissement > Déterminants

QCM || Question 1 || ...
QR || Question 2 || ...
```

## Génération Automatique

### Workflow LLM
1. **Découper cours** : `prompts/split-course-sections.md`
2. **Générer questions** : `prompts/generate-openq.md`
3. **Placer fichier** : `questions/[MATIERE]/[nom]_openq.txt`

### Statistiques Cibles
- **1 cours (80 lignes)** → **6 sections** → **40-60 questions OpenQ**
- **Temps** : ~5 min avec Claude/Gemini/GPT
- **Coverage** : 100% du contenu pédagogique

## Bonnes Pratiques

1. **Chapitrage systématique** : Utiliser `chapter:` en première ligne
2. **Nomenclature cohérente** : Matière_Chapitre_Type.txt
3. **Tags thématiques** : Utiliser colonne 5 ou `@themes:` en entête
4. **Questions variées** : Mélanger QCM/QR/VF/OpenQ/DragMatch
5. **Explications riches** : Colonne 4 avec contexte pédagogique

## Maintenance

- Vérifier parsers après ajout : `npm run build`
- Tester nouvelles questions : Mode Entraînement
- Valider cohérence : Score précision ≥85%
