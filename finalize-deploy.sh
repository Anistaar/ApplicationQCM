#!/bin/bash
# Script de finalisation du déploiement
cd /opt/text2quiz
TIMESTAMP=$(date +%Y%m%d%H%M%S)
sudo mkdir -p /var/www/text2quiz/releases/$TIMESTAMP
sudo rsync -a --delete dist/ /var/www/text2quiz/releases/$TIMESTAMP/
sudo ln -sfnT /var/www/text2quiz/releases/$TIMESTAMP /var/www/text2quiz/current
sudo systemctl reload nginx
echo "Deploy complete: /var/www/text2quiz/current -> releases/$TIMESTAMP"
