# Guide de déploiement rapide

## ✅ Changements poussés sur GitHub

Le code est maintenant sur GitHub avec :
- FormulaBuilder simplifié : saisie texte directe (comme OpenQ)
- Validation automatique qui ignore les espaces
- Interface épurée sans drag-drop

## 🚀 Pour déployer sur le serveur

### Option 1 : Via SSH (recommandé)

```bash
ssh anistaar@192.168.1.72
cd /opt/text2quiz
sudo git config --global --add safe.directory /opt/text2quiz
sudo git fetch origin
sudo git reset --hard origin/main
sudo git pull origin main
sudo npm ci
sudo npm run build
sudo bash deploy.sh  # Si tu as le script de déploiement complet
```

### Option 2 : Build local + copie

Si tu as accès direct au serveur web :
```bash
# Sur ta machine Windows
npm run build

# Copie dist/ vers le serveur
scp -r dist/* anistaar@192.168.1.72:/var/www/text2quiz/current/
```

### Option 3 : Script automatique (si on configure les permissions)

Pour éviter sudo à chaque fois, sur le serveur :
```bash
sudo chown -R anistaar:anistaar /opt/text2quiz
sudo chmod -R u+w /opt/text2quiz
```

Puis tu pourras utiliser : `.\scripts\release.ps1 -Message "ton message" -SkipTests -SkipLocalBuild`

## 🔍 Vérifier le déploiement

Une fois déployé, va sur : **http://192.168.1.72**

Navigue vers ANALYSE_ECO → Questions FormulaBuilder
Tu devrais voir un simple champ de saisie texte.

## 📝 Nouveau comportement FormulaBuilder

**Avant :** Drag-drop de tokens, boutons indice/undo/espace
**Maintenant :** Simple champ texte où tu tapes la formule directement

Exemple : 
- Question : "Reconstruis la formule : VA = ?"
- Tu tapes : `Production - CI` (les espaces sont ignorés)
- Validation automatique lors de la saisie
