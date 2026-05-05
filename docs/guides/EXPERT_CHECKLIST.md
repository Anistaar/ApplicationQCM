# ✅ Checklist Expert - Mise en place du système

## 📋 Pour les experts en audit de questions

Cette checklist vous guide pour mettre en place le nouveau système de gestion de questions par thèmes.

---

## Phase 1 : Préparation des fichiers 📝

### ☐ Créer des fichiers "Mega" par matière

**Objectif** : Un seul fichier par matière avec toutes les questions

**Exemple de structure** :
```
src/questions/
├── MACRO/
│   └── MACRO_MEGA_v1.txt          # ~100+ questions
├── INSTIT/
│   └── INSTIT_MEGA_v1.txt         # ~80+ questions
├── STATS/
│   └── STATS_MEGA_v1.txt          # ~70+ questions
├── DROIT/
│   └── DROIT_MEGA_v1.txt          # ~60+ questions
└── DEMO/
    └── DEMO_COMPLET_v1.txt        # Fichier de test (déjà créé)
```

**Comment créer un fichier Mega** :
1. Ouvrir tous les fichiers d'une matière
2. Copier-coller toutes les questions dans un seul fichier
3. Sauvegarder avec le nom `MATIERE_MEGA_v1.txt`

---

### ☐ Taguer exhaustivement les questions

**Format** : Colonne 5 avec tags séparés par des virgules

```
|| Question || Réponses || Explication || Tag1, Tag2, Tag3, Difficulté
```

**Catégories de tags recommandées** :

#### 1. **Chapitres / Sections**
```
Chapitre1, Chapitre2, Chapitre3, Introduction, Conclusion
```

#### 2. **Concepts clés**
```
Consommation, Investissement, ISLM, Monnaie, PIB
OMC, FMI, Gouvernance, IPC, BrettonWoods
Regression, Correlation, EcartType, Probabilite
```

#### 3. **Auteurs / Théories**
```
Keynes, Friedman, Lucas, Solow
North, Coase, Williamson, Ostrom, Hardin
```

#### 4. **Difficulté** (OBLIGATOIRE)
```
Facile, Moyen, Difficile, Expert
```

#### 5. **Type de contenu**
```
Formules, Graphiques, Definitions, Calculs, Theories
DragMatch, OpenQ, FormulaBuilder
```

#### 6. **Thèmes transversaux**
```
Transversal, Multidisciplinaire, ApplicationPratique
HistoriqueEconomique, Methodologie
```

**Exemple complet** :
```
|| Quelle est la fonction de consommation keynésienne ? || C = c0 + c1 * Y || ... || Chapitre2, Consommation, Keynes, Formules, Moyen

|| Qu'est-ce que l'OMC ? || Organisation Mondiale du Commerce || ... || OMC, Institutions, Definitions, Facile

QCM || Quels sont les instruments de politique monétaire ? || Taux directeur;vrai || ... || Monnaie, PolitiqueEconomique, BCE, Difficile
```

---

### ☐ Utiliser les directives de section (optionnel)

Pour grouper des questions, utilisez `@themes:` et `@add-theme:`

```
@themes: Chapitre1, Consommation, Facile

|| Question 1... ||
|| Question 2... ||

@add-theme: Keynésien

|| Question 3... || ... || (hérite de Chapitre1, Consommation, Facile, Keynésien)

@themes: Chapitre2, Investissement, Moyen

|| Question 4... ||
```

---

## Phase 2 : Import dans le système 📤

### ☐ Démarrer le serveur

```bash
npm run dev
```

### ☐ Ouvrir le panneau d'administration

**URL** : `http://localhost:5173/src/admin/admin-panel.html`

### ☐ Importer chaque fichier Mega

**Pour chaque matière** :

1. **Onglet "📤 Import"**
2. **Glisser-déposer** le fichier `MATIERE_MEGA_v1.txt`
3. **Sélectionner la matière** dans le menu déroulant
4. **Cocher** "Détecter automatiquement les thèmes"
5. **Optionnel** : Ajouter des thèmes par défaut
6. **Cliquer** "🚀 Lancer l'import"
7. **Vérifier les logs** :
   - ✅ Nombre de questions importées
   - ⏭️ Doublons ignorés
   - ❌ Erreurs éventuelles
8. **Répéter** pour chaque matière

### ☐ Actualiser les statistiques

1. **Onglet "📊 Tableau de bord"**
2. **Cliquer** "🔄 Actualiser stats"
3. **Vérifier** :
   - Questions totales
   - Thèmes actifs
   - Matières

---

## Phase 3 : Vérification et validation ✓

### ☐ Vérifier les questions importées

1. **Onglet "📝 Questions"**
2. **Filtrer** par matière
3. **Rechercher** des mots-clés
4. **Vérifier** :
   - Toutes les questions sont là
   - Les thèmes sont corrects
   - Les explications sont présentes

### ☐ Vérifier les thèmes

1. **Onglet "🏷️ Thèmes"**
2. **Parcourir** la liste des thèmes
3. **Vérifier** :
   - Pas de doublons (ex: "Chapitre1" vs "chapitre1")
   - Compteurs cohérents
   - Orthographe correcte

### ☐ Vérifier les matières

1. **Onglet "📚 Matières"**
2. **Vérifier** :
   - Toutes les matières sont listées
   - Compteurs de questions corrects
   - Compteurs de thèmes corrects

---

## Phase 4 : Tester l'interface utilisateur 🎯

### ☐ Ouvrir la nouvelle interface

**URL** : `http://localhost:5173/src/new-ui/`

### ☐ Test 1 : Sélection simple

1. **Sélectionner** une matière (ex: MACRO)
2. **Sélectionner** 2-3 thèmes (ex: Chapitre1, Consommation)
3. **Vérifier** :
   - Les thèmes s'affichent correctement
   - Le compteur de questions est cohérent
   - La configuration du quiz apparaît

### ☐ Test 2 : Recherche de thèmes

1. **Taper** "chapitre" dans la recherche
2. **Vérifier** que seuls les thèmes correspondants s'affichent
3. **Effacer** la recherche
4. **Vérifier** que tous les thèmes réapparaissent

### ☐ Test 3 : Sélection multiple

1. **Cliquer** "✓ Tout sélectionner"
2. **Vérifier** que tous les thèmes sont sélectionnés
3. **Cliquer** "✗ Tout décocher"
4. **Vérifier** que la sélection est vide

### ☐ Test 4 : Configuration du quiz

1. **Sélectionner** quelques thèmes
2. **Modifier** le nombre de questions
3. **Changer** le mode (Entraînement / Examen / Contre la montre)
4. **Changer** la difficulté minimale
5. **Vérifier** que le résumé se met à jour

### ☐ Test 5 : Lancer un quiz

1. **Configurer** un quiz
2. **Cliquer** "🚀 Lancer le quiz"
3. **Vérifier** l'alerte avec la configuration
   - Nombre correct de questions
   - Mode correct
   - Thèmes corrects

---

## Phase 5 : Backup et documentation 💾

### ☐ Exporter la base de données

1. **Admin** → **Tableau de bord**
2. **Cliquer** "📥 Exporter DB"
3. **Sauvegarder** le fichier JSON
4. **Stocker** dans un endroit sûr (cloud, USB, etc.)

**Nom recommandé** : `text2quiz-backup-YYYY-MM-DD.json`

### ☐ Documenter votre configuration

Créer un fichier `CONFIGURATION.md` avec :

```markdown
# Configuration Text2Quiz VIP

## Matières configurées
- MACRO : 120 questions, 18 thèmes
- INSTIT : 95 questions, 22 thèmes
- STATS : 78 questions, 15 thèmes
- ...

## Tags utilisés

### Macro
- Chapitres : Intro, Chapitre1-8
- Concepts : Consommation, Investissement, ISLM, Monnaie
- Auteurs : Keynes, Friedman, Lucas
- Difficultés : Facile (30), Moyen (50), Difficile (30), Expert (10)

### Institutions
- ...

## Backup
- Dernier backup : 2024-12-15
- Fichier : text2quiz-backup-2024-12-15.json
- Emplacement : Google Drive / Cours / Text2Quiz
```

### ☐ Créer un guide pour les étudiants

Créer un fichier `GUIDE_ETUDIANTS.md` avec :

```markdown
# Guide pour les étudiants

## Comment utiliser Text2Quiz VIP

1. Ouvrir : http://localhost:5173/src/new-ui/
2. Choisir une matière
3. Sélectionner les thèmes à réviser
4. Configurer le quiz (nombre, mode, difficulté)
5. Lancer !

## Conseils

- **Facile** : Pour découvrir le cours
- **Moyen** : Pour s'entraîner
- **Difficile** : Pour approfondir
- **Expert** : Pour se challenger

## Thèmes recommandés par chapitre

### Macro - Chapitre 1
Sélectionner : Chapitre1, Consommation, Keynésien, Facile, Moyen

### Macro - Chapitre 2
Sélectionner : Chapitre2, Investissement, ...

...
```

---

## Phase 6 : Maintenance continue 🔧

### ☐ Ajouter de nouvelles questions

**Méthode 1 : Modifier le fichier Mega**
1. Ouvrir `MATIERE_MEGA_v1.txt`
2. Ajouter les nouvelles questions avec tags
3. Réimporter le fichier (cocher "Écraser les doublons")

**Méthode 2 : Créer un fichier complémentaire**
1. Créer `MATIERE_MEGA_v2.txt` avec les nouvelles questions
2. Importer le fichier
3. Les questions s'ajoutent automatiquement

### ☐ Corriger des erreurs

1. **Admin** → **Questions**
2. **Rechercher** la question problématique
3. **Option A** : Supprimer et réimporter le fichier corrigé
4. **Option B** : Utiliser l'éditeur inline (future feature)

### ☐ Réorganiser les thèmes

1. Modifier les tags dans les fichiers sources
2. Réimporter avec "Écraser les doublons"
3. Actualiser les statistiques

### ☐ Backups réguliers

**Recommandé** : 1 backup par semaine ou après chaque gros import

1. **Admin** → "📥 Exporter DB"
2. Sauvegarder avec la date
3. Archiver les anciens backups

---

## 🎯 Objectifs de qualité

### Minimum viable
- ✅ Toutes les questions importées
- ✅ Tags de base (Chapitres, Difficulté)
- ✅ 1 backup

### Standard recommandé
- ✅ Tags détaillés (Chapitres, Concepts, Difficulté)
- ✅ Thèmes cohérents et sans doublons
- ✅ Documentation pour étudiants
- ✅ Backups hebdomadaires

### Excellence
- ✅ Tags exhaustifs (Chapitres, Concepts, Auteurs, Types, Difficulté)
- ✅ Hiérarchie de thèmes (via `@themes:`)
- ✅ Métadonnées personnalisées
- ✅ Guide pédagogique complet
- ✅ Analytics et suivi des résultats
- ✅ Backups automatisés

---

## 🆘 Problèmes fréquents

### Import échoue

**Causes possibles** :
- Format text2quiz incorrect
- Colonne manquante
- Caractères spéciaux mal encodés

**Solutions** :
- Vérifier le format avec `||` séparateurs
- S'assurer de l'encodage UTF-8
- Tester avec `DEMO_COMPLET_v1.txt` d'abord

### Thèmes dupliqués

**Causes** :
- Casse différente (Chapitre1 vs chapitre1)
- Espaces en trop
- Accents (Difficile vs Difficilé)

**Solution** :
- Normaliser les tags dans les fichiers
- Utiliser toujours la même casse
- Réimporter avec "Écraser les doublons"

### Questions manquantes

**Causes** :
- Doublons ignorés lors de l'import
- Erreur de parsing

**Solution** :
- Vérifier les logs d'import
- Cocher "Écraser les doublons" pour réimporter
- Vérifier le format des questions problématiques

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consulter `NEW_ARCHITECTURE.md` pour l'architecture complète
2. Consulter `QUICK_START.md` pour le guide de démarrage
3. Vérifier la console navigateur (F12) pour les erreurs
4. Exporter la DB et analyser le JSON
5. Créer une issue GitHub avec le détail du problème

---

**Bon courage pour l'audit ! 🚀**
