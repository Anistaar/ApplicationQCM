# 🚀 Import Rapide des Questions

## Première utilisation

Vous avez deux options pour importer les questions dans l'application :

### Option 1 : Import Automatique (RECOMMANDÉ) ⚡

**La plus simple** : Tout se fait en un clic !

1. Ouvrir : http://localhost:5175/welcome.html
2. Cliquer sur **"📥 Import Automatique"**
3. Cliquer sur **"🚀 Lancer l'import"**
4. Attendre la fin (environ 10-30 secondes)
5. Cliquer sur **"✨ Accéder à l'application"**

**Résultat** : 2630+ questions importées automatiquement !

---

### Option 2 : Import Manuel via Console (pour debug)

Si l'import automatique ne fonctionne pas, utilisez la console navigateur :

1. Ouvrir http://localhost:5175/src/new-ui/index.html
2. Appuyer sur **F12** (ouvrir DevTools)
3. Aller dans l'onglet **Console**
4. Copier-coller ce code :

```javascript
(async function() {
  const files = [
    '../questions/S1/MACRO/MACRO_MEGA_COMPLET.txt',
    '../questions/S1/INSTIT/INSTIT_MEGA_COMPLET.txt',
    '../questions/S1/STATS/STATS_MEGA_COMPLET.txt',
    '../questions/S1/RIAE/RIAE_MEGA_COMPLET.txt',
    '../questions/S1/HPE/HPE_MEGA_COMPLET.txt',
    '../questions/S1/DROIT/DROIT_MEGA_COMPLET.txt',
    '../questions/S1/ANALYSE_ECO/ANALYSE_ECO_MEGA_COMPLET.txt'
  ];
  
  await questionDB.init();
  
  for (const file of files) {
    try {
      const resp = await fetch(file);
      const text = await resp.text();
      const subject = file.split('/')[3];
      const result = await importService.importFromText(text, subject);
      console.log(`✅ ${subject}: ${result.success} questions importées`);
    } catch (error) {
      console.error(`❌ ${file}:`, error);
    }
  }
  
  console.log('✅ Import terminé! Rechargez la page.');
  location.reload();
})();
```

5. Appuyer sur **Entrée**
6. Attendre le message **"✅ Import terminé!"**

---

## Vérifier l'import

Une fois l'import terminé, vous devriez voir :

```
📊 7 matières disponibles
├── MACRO : 1210 questions
├── INSTIT : 655 questions
├── STATS : 173 questions
├── RIAE : 65 questions
├── HPE : 86 questions
├── DROIT : 80 questions
└── ANALYSE_ECO : 361 questions
```

---

## Réimporter / Mettre à jour

Pour mettre à jour les questions après modification des fichiers MEGA :

1. **Supprimer l'ancienne base** :
   - Ouvrir DevTools (F12) → Console
   - Taper : `await questionDB.clearDatabase()`
   - Recharger la page

2. **Relancer l'import** avec Option 1 ou 2

---

## Fichiers sources

Les fichiers MEGA consolidés sont dans :

```
src/questions/S1/
├── MACRO/MACRO_MEGA_COMPLET.txt (1210q)
├── INSTIT/INSTIT_MEGA_COMPLET.txt (655q)
├── STATS/STATS_MEGA_COMPLET.txt (173q)
├── RIAE/RIAE_MEGA_COMPLET.txt (65q)
├── HPE/HPE_MEGA_COMPLET.txt (86q)
├── DROIT/DROIT_MEGA_COMPLET.txt (80q)
└── ANALYSE_ECO/ANALYSE_ECO_MEGA_COMPLET.txt (361q)
```

**Total** : 2630 questions avec tags automatiques !

---

## Troubleshooting

### ❌ "Aucune question dans la base de données"
→ L'import n'a pas été fait. Suivez Option 1 ou 2 ci-dessus.

### ❌ "Failed to fetch"
→ Le serveur dev n'est pas lancé. Tapez : `npm run dev`

### ❌ Questions en double
→ Supprimez la base : `await questionDB.clearDatabase()` puis réimportez.

### ❌ Erreur d'import
→ Vérifiez que les fichiers MEGA existent dans `src/questions/S1/`

---

## Commandes utiles

```powershell
# Lancer le serveur
npm run dev

# Vérifier les fichiers MEGA
ls src/questions/S1/*/\*MEGA\*.txt

# Compter les questions
node scripts/import-all-mega.mjs
```

---

**Date** : Novembre 2024  
**Version** : 1.0
