# 🚀 Guide de démarrage rapide - Nouvelle interface

## En 5 minutes chrono ⏱️

### Étape 1 : Importer vos questions

1. **Démarrez le serveur**
   ```bash
   npm run dev
   ```

2. **Ouvrez l'admin**
   ```
   http://localhost:5173/src/admin/admin-panel.html
   ```

3. **Importez un fichier**
   - Cliquez sur l'onglet "📤 Import"
   - Glissez-déposez `MACRO_MEGA_v1.txt` (ou tout autre fichier .txt)
   - Sélectionnez la matière : **MACRO**
   - Cochez "Détecter automatiquement les thèmes"
   - Cliquez "🚀 Lancer l'import"
   - ✅ Attendez la confirmation

### Étape 2 : Utiliser la nouvelle interface

1. **Ouvrez la nouvelle UI**
   ```
   http://localhost:5173/src/new-ui/
   ```

2. **Sélectionnez une matière**
   - Cliquez sur la card "Macroéconomie" (ou autre)

3. **Sélectionnez des thèmes**
   - Cliquez sur les chips de thèmes (ex: Chapitre1, Consommation)
   - Ou cliquez "✓ Tout sélectionner"

4. **Configurez le quiz**
   - Nombre de questions : 20
   - Mode : Entraînement
   - Cliquez "🚀 Lancer le quiz"

---

## 📦 Fichiers exemple prêts à l'emploi

Vous avez déjà ces fichiers dans `src/questions/S1/` :

- ✅ `MACRO/MACRO_MEGA_v1.txt` (~40 questions, 15+ thèmes)
- ✅ `INSTIT/INSTIT_MEGA_v1.txt` (~35 questions, 20+ thèmes)

**Import rapide** :
```
Admin → Import → Glisser ces 2 fichiers
Matière MACRO pour le premier, INSTIT pour le second
→ Lancer l'import
```

---

## 🎯 Vous n'avez pas encore de fichiers Mega ?

### Option 1 : Convertir vos fichiers existants

1. **Consolidez vos questions**
   - Ouvrez tous vos fichiers d'un sujet (ex: tous les MACRO)
   - Copiez-collez tout dans un seul fichier `MACRO_MEGA_v1.txt`

2. **Ajoutez des tags**
   - Format : `|| Question || Réponses || Explication || Tag1, Tag2, Difficile`
   - Exemple :
     ```
     || Qu'est-ce que le PIB ? || C'est... || ... || Chapitre1, Definitions, Facile
     ```

3. **Importez dans l'admin**

### Option 2 : Utiliser les fichiers existants

Vous pouvez importer vos fichiers actuels **tels quels** :
- L'admin détectera automatiquement les tags (colonne 5)
- Si pas de tags, ajoutez des "Thèmes par défaut" lors de l'import
- Exemple : `Chapitre1, Moyen` pour un fichier de chapitre 1

---

## 🔧 Commandes utiles

```bash
# Démarrer le dev
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

---

## 📍 URLs importantes

| Page | URL | Fonction |
|------|-----|----------|
| **Admin** | `/src/admin/admin-panel.html` | Import, gestion DB |
| **Nouvelle UI** | `/src/new-ui/` | Sélection par thèmes |
| **Ancienne UI** | `/` | Interface classique (toujours dispo) |

---

## ❓ Problèmes courants

### "Aucune question dans la base de données"

➡️ **Solution** : Allez dans l'admin et importez des fichiers

### "Import failed"

➡️ **Solution** : Vérifiez que :
- Le fichier est au format text2quiz (colonnes avec `||`)
- Vous avez sélectionné une matière
- Le fichier contient bien des questions valides

### "Les thèmes n'apparaissent pas"

➡️ **Solution** :
- Vérifiez la colonne 5 de vos questions
- Ou ajoutez des "Thèmes par défaut" lors de l'import
- Actualisez les statistiques dans l'admin (onglet Dashboard)

### "Base de données corrompue"

➡️ **Solution** :
- Admin → Dashboard → "🗑️ Vider la base"
- Réimportez vos fichiers

---

## 💡 Tips

1. **Backup régulier**
   - Admin → "📥 Exporter DB"
   - Sauvegardez le JSON

2. **Tags intelligents**
   - Combinez plusieurs niveaux : `Chapitre1, Consommation, Graphiques, Moyen`
   - Permet des sélections très précises

3. **Recherche de thèmes**
   - Tapez dans la barre de recherche pour filtrer
   - Exemple : "graph" → affiche tous les thèmes avec "Graphiques"

4. **Statistiques en temps réel**
   - Le résumé affiche combien de questions matchent votre sélection
   - Utile pour calibrer la difficulté

---

## 🎓 Pour aller plus loin

Consultez `NEW_ARCHITECTURE.md` pour :
- Architecture complète
- API de la base de données
- Workflow pour experts en audit
- Futures fonctionnalités

---

**Vous êtes prêt ! 🚀**

Commencez par importer quelques fichiers et testez la nouvelle interface.
