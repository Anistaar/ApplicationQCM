# 📚 Guide d'utilisation du système de Tags/Thèmes

## 🎯 Vue d'ensemble

Le nouveau système de tags permet de gérer efficacement vos questions sans créer des dizaines de fichiers par thème. À la place, vous créez **un seul fichier "Mega"** par matière avec tous les thèmes, puis vous filtrez par tags.

---

## 📁 Structure des fichiers "Mega"

### Exemple: `MACRO_MEGA_v1.txt`

```text
# MACRO - Fichier consolidé avec tous les thèmes
@themes: Macroéconomie, S1

# Chapitre 1 - Consommation
@add-theme: Chapitre1, Consommation

QR || Question sur la consommation || Réponse || Explication || Consommation, Keynésien, Facile

# Chapitre 2 - Investissement
@themes: Chapitre2, Investissement

QCM || Question sur l'investissement || Réponses || Explication || Investissement, FBCF, Moyen
```

### Avantages

✅ **Un seul fichier** par matière au lieu de 10-20 fichiers  
✅ **Tags flexibles** : combinez plusieurs tags pour cibler précisément  
✅ **Compteur de questions** par tag visible dans l'interface  
✅ **Recherche** de tags en temps réel  
✅ **Mise à jour facile** : ajoutez des questions/tags sans créer de nouveaux fichiers

---

## 🏷️ Syntaxe des tags

### 1. Tags en entête de section

```text
@themes: Theme1, Theme2
# Tous les QCM suivants auront ces tags

@add-theme: ThemeSupplementaire
# Ajoute un tag sans remplacer les précédents
```

### 2. Tags dans la colonne 5

```text
QCM || Question || Réponses || Explication || Tag1, Tag2, Tag3
```

### 3. Tags inline dans la question

```text
QCM || Question avec [#TagInline] dans le texte || Réponses || Explication
```

---

## 🎨 Interface de sélection (UI moderne)

### Fonctionnalités

1. **Chips cliquables** : Cliquez sur un tag pour le sélectionner/désélectionner
2. **Recherche** : Filtrez les tags en temps réel
3. **Compteur** : Voir le nombre de questions par tag `(12)`
4. **Résumé** : "3 thème(s) sélectionné(s) — ~45 question(s)"
5. **Actions rapides** :
   - "Tout sélectionner" : sélectionne tous les tags visibles
   - "Tout effacer" : désélectionne tout

### Activation

👉 Cochez **"Options avancées"** dans l'interface pour voir la section Tags.

---

## 📖 Exemples d'utilisation

### Cas 1 : Réviser un chapitre spécifique

1. Sélectionnez `MACRO_MEGA_v1.txt`
2. Recherchez "Chapitre1" dans les tags
3. Cliquez sur les chips `Chapitre1` et `Consommation`
4. Lancez une série → Seules les questions de ce chapitre

### Cas 2 : Réviser les formules uniquement

1. Sélectionnez `MACRO_MEGA_v1.txt`
2. Cliquez sur le tag `Formules`
3. Lancez → Vous obtenez toutes les questions de formules (FormulaBuilder + QCM sur formules)

### Cas 3 : Réviser les questions difficiles

1. Sélectionnez le cours
2. Cliquez sur `Difficile`
3. Lancez → Vous ne voyez que les questions difficiles

### Cas 4 : Combiner plusieurs thèmes

1. Sélectionnez `INSTIT_MEGA_v1.txt`
2. Cliquez sur `FMI` + `BanqueMondiale`
3. Lancez → Questions des deux institutions mélangées

---

## 🚀 Migration des fichiers existants

### Avant (ancienne méthode)

```
questions/
├── macro_chap1_consommation.txt
├── macro_chap1_epargne.txt
├── macro_chap2_investissement.txt
├── macro_chap2_fbcf.txt
├── macro_chap3_modele_keynesien.txt
└── ... (20+ fichiers)
```

### Après (nouvelle méthode)

```
questions/
└── MACRO_MEGA_v1.txt (tous les chapitres avec tags)
```

### Comment migrer

1. **Créez un nouveau fichier `MATIERE_MEGA_v1.txt`**
2. **Copiez toutes vos questions** des anciens fichiers
3. **Ajoutez des tags** dans la colonne 5 de chaque question
4. **Utilisez `@themes:`** pour grouper par section
5. **Testez** : sélectionnez le fichier Mega, filtrez par tags

---

## 🆕 Nouveaux fichiers Mega créés

### ✅ `MACRO_MEGA_v1.txt`

**Contenu** : ~40 questions  
**Tags disponibles** :  
- Par chapitre : `Intro`, `Chapitre1`, `Chapitre2`, `Chapitre3`, `Chapitre4`
- Par concept : `Consommation`, `Investissement`, `ISLM`, `ModeleClassique`, `Keynésien`
- Par difficulté : `Facile`, `Moyen`, `Difficile`
- Par type : `Formules`, `DragMatch`, `OpenQ`

### ✅ `INSTIT_MEGA_v1.txt`

**Contenu** : ~35 questions  
**Tags disponibles** :
- Par institution : `OMC`, `FMI`, `BanqueMondiale`
- Par thème : `Commerce`, `Monnaie`, `Developpement`, `Theories`, `Gouvernance`
- Par auteur : `North`, `Coase`, `Williamson`, `Hardin`, `Ostrom`
- Par difficulté : `Facile`, `Moyen`, `Difficile`

---

## 🛠️ Fonctionnalité bonus : Export des questions ratées

### En mode Examen

1. Terminez un examen
2. Cliquez sur **"📥 Exporter les erreurs"**
3. Un fichier `.txt` est téléchargé avec :
   - Les questions que vous avez ratées
   - Format text2quiz standard (réutilisable)
   - Header avec date, mode, nombre d'erreurs

### Utilisation

👉 Importez ce fichier pour une révision ciblée de vos erreurs !

---

## 📊 Bonnes pratiques

### Nommage des tags

- **Utilisez des noms courts** : `Chap1` > `Chapitre 1 - Introduction à la macro`
- **Soyez cohérent** : Toujours `Keynésien` (pas `Keynesien`, `keynes`, etc.)
- **Combinez difficultés** : Ajoutez toujours `Facile`, `Moyen` ou `Difficile`
- **Ajoutez le type** : `Formules`, `DragMatch`, `OpenQ` si pertinent

### Organisation des fichiers Mega

```text
1. Header avec description
2. @themes globaux
3. Sections par chapitre avec @add-theme
4. Questions avec tags détaillés dans colonne 5
5. Footer avec récapitulatif des tags disponibles
```

---

## ❓ FAQ

**Q : Puis-je encore utiliser mes anciens fichiers par thème ?**  
R : Oui ! Les deux systèmes coexistent. Mais les fichiers Mega sont plus pratiques.

**Q : Comment ajouter un nouveau tag sans tout réécrire ?**  
R : Utilisez `@add-theme: NouveauTag` dans la section concernée.

**Q : Combien de tags par question ?**  
R : Recommandation : 3-5 tags (chapitre, concept, difficulté, type, auteur/théorie)

**Q : Les tags inline `[#Tag]` fonctionnent-ils ?**  
R : Oui, le parser les extrait automatiquement.

**Q : Puis-je créer des tags personnalisés ?**  
R : Absolument ! Ajoutez n'importe quel tag dans la colonne 5.

---

## 🎓 Prochaines étapes (Sprint 5 - optionnel)

- ✨ **Éditeur de tags inline** : Modifier les tags d'une question directement dans l'UI
- 💾 **Sauvegarde localStorage** : Vos tags personnalisés sans toucher au fichier source
- 📈 **Statistiques par tag** : Voir votre progression par thème

---

## 🏁 Conclusion

Le système de tags/thèmes vous permet de :

✅ **Gérer des centaines de questions** dans un seul fichier  
✅ **Filtrer avec précision** par thème, difficulté, type  
✅ **Réviser efficacement** en combinant plusieurs tags  
✅ **Exporter vos erreurs** pour révision ciblée

**Conseil** : Commencez avec les fichiers Mega fournis (`MACRO_MEGA_v1.txt`, `INSTIT_MEGA_v1.txt`) et adaptez-les à vos besoins !

---

**Auteur** : GitHub Copilot  
**Date** : 28 novembre 2025  
**Version** : 1.0
