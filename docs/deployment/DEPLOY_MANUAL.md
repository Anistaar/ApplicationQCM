# Guide de déploiement manuel

## Étapes à suivre sur le serveur (192.168.1.72)

1. **Connecte-toi en SSH :**
   ```bash
   ssh anistaar@192.168.1.72
   ```

2. **Va dans le répertoire du projet :**
   ```bash
   cd /opt/text2quiz
   ```

3. **Configure le répertoire comme sûr (si nécessaire) :**
   ```bash
   sudo git config --global --add safe.directory /opt/text2quiz
   ```

4. **Pull les derniers changements :**
   ```bash
   sudo git fetch origin
   sudo git reset --hard origin/main
   sudo git pull origin main
   ```

5. **Installe les dépendances :**
   ```bash
   sudo npm ci
   ```

6. **Build le projet :**
   ```bash
   sudo npm run build
   ```

7. **Copie le dist vers le répertoire web (si nécessaire) :**
   ```bash
   sudo mkdir -p /var/www/text2quiz/releases/$(date +%Y%m%d%H%M%S)
   sudo rsync -a --delete dist/ /var/www/text2quiz/releases/$(date +%Y%m%d%H%M%S)/
   sudo ln -sfnT /var/www/text2quiz/releases/$(date +%Y%m%d%H%M%S) /var/www/text2quiz/current
   ```

8. **Recharge Nginx :**
   ```bash
   sudo systemctl reload nginx
   ```

## Changements déployés

✅ **Interface FormulaBuilder améliorée**
- Affichage visuel des tokens avec chips colorées
- Bouton "💡 Indice" pour ajouter le prochain token correct
- Bouton "⏶ Annuler" pour retirer le dernier token
- Bouton "⎵ Espace" pour ajouter des espaces
- Barre de progression animée
- Feedback visuel lors de l'ajout de tokens
- Design moderne avec animations

✅ **30 nouvelles questions FormulaBuilder pour ANALYSE_ECO**
- Couvre toutes les formules clés (MA1, MA2, MI1-4)
- Mode d'apprentissage interactif
- Validation en temps réel

## Vérification

Une fois déployé, teste sur : http://192.168.1.72

Navigue vers une question FormulaBuilder en ANALYSE_ECO pour tester l'interface.
