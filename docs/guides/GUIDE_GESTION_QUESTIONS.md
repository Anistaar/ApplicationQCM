# 📚 GUIDE DE GESTION DES QUESTIONS TEXT2QUIZ

## 🎯 Workflow Complet

### 1. Consolidation des Questions (FAIT ✅)

Les scripts Python ont consolidé **2630 questions** en 7 fichiers MEGA :

```bash
# Scripts de consolidation
python scripts/consolidate-macro.py        # → 1210 questions
python scripts/consolidate-instit.py       # → 655 questions
python scripts/consolidate-stats.py        # → 173 questions
python scripts/consolidate-riae.py         # → 65 questions
python scripts/consolidate-hpe.py          # → 86 questions
python scripts/consolidate-droit.py        # → 80 questions
python scripts/consolidate-analyse-eco.py  # → 361 questions
```

**Fichiers créés :**
- `src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt`
- `src/questions/S1/INSTIT/INSTIT_MEGA_COMPLET.txt`
- `src/questions/S1/STATS/STATS_MEGA_COMPLET.txt`
- `src/questions/S1/RIAE/RIAE_MEGA_COMPLET.txt`
- `src/questions/S1/HPE/HPE_MEGA_COMPLET.txt`
- `src/questions/S1/DROIT/DROIT_MEGA_COMPLET.txt`
- `src/questions/S1/ANALYSE_ECO/ANALYSE_ECO_MEGA_COMPLET.txt`

---

### 2. Normalisation des Fichiers

**But :** Ajouter automatiquement les types manquants (QR, QCM, etc.)

```bash
# Normaliser un fichier
npm run normalize -- fichier.txt

# Normaliser tous les MEGA
npm run normalize:all-mega

# Normaliser avec output différent
python scripts/normalize-text2quiz.py normalize input.txt -o output.txt
```

**Détection automatique :**
- QCM : si contient `V:`, `|`, `;vrai`, `;faux`
- DragMatch : si contient des paires `item:match`
- QR : par défaut

---

### 3. Fusion de Fichiers (MEGA)

**Cas d'usage :** Combiner plusieurs petits fichiers en un seul MEGA

```bash
# Fusionner plusieurs fichiers
npm run merge:questions -- file1.txt file2.txt file3.txt -o MEGA.txt

# Sans séparateurs entre fichiers
python scripts/normalize-text2quiz.py merge file1.txt file2.txt -o output.txt --no-separators
```

**Exemple pratique :**
```bash
# Fusionner tous les fichiers MACRO en un seul
python scripts/normalize-text2quiz.py merge \
  src/questions/S1/MACRO/macro_chap*.txt \
  -o src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt
```

---

### 4. Découpage par Thème (SPLIT)

**Cas d'usage :** Découper un gros MEGA en plusieurs fichiers thématiques

```bash
# Split un fichier MEGA par chapitre/thème
npm run split:by-theme -- MEGA.txt -o output_dir/

# Exemple
python scripts/normalize-text2quiz.py split \
  src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt \
  -o src/questions/S1/MACRO/chapitres/
```

**Le script détecte automatiquement :**
- Les headers `@themes: Theme1, Theme2`
- Les sections `# CHAPITRE X`
- Les sections `# =========`

---

## 🔧 Format Text2Quiz

### Structure de base

```text
TYPE || Question || Réponses || Explication || Tags

# TYPE: QR, QCM, VF, DragMatch, OpenQ, FormulaBuilder
# Tags: séparés par virgules
```

### Exemples

**QR (Question-Réponse) :**
```text
QR || Qu'est-ce que le PIB ? || Produit Intérieur Brut || Mesure de richesse || Macro, PIB, Facile
```

**QCM (Multiple choix) :**
```text
QCM || Quels sont des agrégats ? || V:PIB | V:Consommation | Salaire | V:Investissement || || Macro, Agregats, Moyen
```

**VF (Vrai/Faux) :**
```text
VF || Le PIB mesure la richesse ? || V || Vrai car... || Macro, PIB, Facile
```

**DragMatch (Correspondances) :**
```text
DragMatch || Associez les auteurs || Smith:Main invisible | Keynes:Demande globale | Marx:Plus-value || || HPE, Auteurs, Moyen
```

---

## 📦 Import dans l'Admin Panel

### 1. Accéder à l'admin

```bash
npm run dev
# → http://localhost:5174/src/admin/admin-panel.html
```

### 2. Importer un fichier

1. **Onglet "Import"**
2. **Drag & Drop** ou **Cliquer** pour sélectionner
3. **Choisir la matière** (MACRO, INSTIT, etc.)
4. **Activer "Auto-detect themes"** ✅
5. **Lancer l'import**

### 3. Options d'import

- **Subject** : Matière (MACRO, INSTIT, STATS, etc.)
- **Auto-detect themes** : ✅ Extrait les tags de la colonne 5
- **Default themes** : Tags ajoutés à toutes les questions
- **Overwrite existing** : Remplacer les doublons

---

## 🎨 Cas d'Usage Pratiques

### Scénario 1 : Ajouter de nouvelles questions

```bash
# 1. Créer un fichier avec vos questions
nano nouvelles_questions.txt

# 2. Normaliser le format
npm run normalize -- nouvelles_questions.txt

# 3. Merger avec le MEGA existant
python scripts/normalize-text2quiz.py merge \
  src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt \
  nouvelles_questions.txt \
  -o src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt

# 4. Importer dans l'admin
# → http://localhost:5174/src/admin/admin-panel.html
```

### Scénario 2 : Réorganiser par chapitres

```bash
# 1. Split le MEGA par thème
python scripts/normalize-text2quiz.py split \
  src/questions/S1/MACRO/MACRO_MEGA_COMPLET.txt \
  -o src/questions/S1/MACRO/par_chapitre/

# → Crée : chapitre0.txt, chapitre1.txt, etc.

# 2. Éditer les fichiers individuels

# 3. Re-merger si besoin
python scripts/normalize-text2quiz.py merge \
  src/questions/S1/MACRO/par_chapitre/*.txt \
  -o src/questions/S1/MACRO/MACRO_MEGA_COMPLET_V2.txt
```

### Scénario 3 : Créer un nouveau MEGA

```bash
# 1. Normaliser tous les fichiers sources
npm run normalize -- src/questions/S1/NOUVELLE_MATIERE/*.txt

# 2. Les fusionner
python scripts/normalize-text2quiz.py merge \
  src/questions/S1/NOUVELLE_MATIERE/*.txt \
  -o src/questions/S1/NOUVELLE_MATIERE/MEGA_COMPLET.txt

# 3. Importer dans l'admin
```

---

## 🔍 Commandes Rapides

```bash
# Development
npm run dev                    # Démarrer le serveur
npm run build                  # Build production

# Normalisation
npm run normalize -- file.txt  # Normaliser 1 fichier
npm run normalize:all-mega     # Normaliser tous les MEGA

# Fusion/Split
npm run merge:questions -- file1.txt file2.txt -o output.txt
npm run split:by-theme -- MEGA.txt -o output_dir/

# Consolidation (scripts Python)
python scripts/consolidate-macro.py
python scripts/consolidate-instit.py
# ... etc

# Tests
npm run test                   # Tests unitaires
```

---

## 📊 Statistiques Actuelles

**Total consolidé : 2630 questions**

| Matière | Questions | Fichiers sources |
|---------|-----------|------------------|
| MACRO | 1210 | 14 |
| INSTIT | 655 | 16 |
| STATS | 173 | 19 |
| RIAE | 65 | 10 |
| HPE | 86 | 3 |
| DROIT | 80 | 1 |
| ANALYSE_ECO | 361 | 18 |

---

## 🚀 Workflow Recommandé

### Pour ajouter des questions :

1. **Petit volume** (< 50 questions) → Éditer directement le MEGA
2. **Moyen volume** (50-200) → Créer fichier séparé → Merger
3. **Gros volume** (> 200) → Créer script consolidation spécifique

### Pour réorganiser :

1. **Split** le MEGA par thème/chapitre
2. Éditer les fichiers individuels
3. **Merge** à nouveau
4. **Normaliser** pour vérifier le format
5. **Importer** dans l'admin

### Pour corriger des erreurs :

1. Éditer le fichier source ou le MEGA
2. **Normaliser** pour détecter les formats invalides
3. **Rebuild** : `npm run build`
4. **Ré-importer** dans l'admin (avec overwrite ✅)

---

## 🛠️ Troubleshooting

### Import détecte 0 questions

→ Vérifier le format : `QR ||`, `QCM ||`, etc. en début de ligne  
→ Lancer : `npm run normalize -- fichier.txt`

### Tags ne s'affichent pas

→ Vérifier colonne 5 : `|| Tag1, Tag2, Tag3`  
→ Activer "Auto-detect themes" ✅ dans l'import

### Encodage incorrect (é → Ã©)

→ Les scripts gèrent UTF-8, latin-1, cp1252 automatiquement  
→ Si problème, convertir : `iconv -f latin1 -t utf8 input.txt > output.txt`

### Doublon
s détectés

→ Désactiver "Overwrite existing" dans l'import  
→ Ou nettoyer manuellement le MEGA avant import

---

## 📝 Notes

- Les fichiers MEGA sont en **UTF-8**
- Les scripts gèrent **multi-encodage** en lecture
- La normalisation est **idempotente** (peut être relancée)
- Le parser **ignore les lignes vides et commentaires** (#)
- Les thèmes sont **dédupliqués** automatiquement

---

**Créé le : 2025-11-28**  
**Version : 1.0**  
**Auteur : GitHub Copilot + Consolidation Scripts**
