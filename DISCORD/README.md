# Text2Quiz Discord Bot

Bot Discord qui lit les fichiers TXT de `src/cours` (formats VF/QR/QCM/DragMatch) et propose des sessions d'entraînement et d'examen dans Discord.

## Prérequis
- Node.js LTS (>=18, recommandé 20/22)
- Un bot Discord (token) et un serveur de test (GUILD_ID)

## Installation
1. Copier `.env.example` en `.env` et renseigner `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `GUILD_ID`.
2. Installer les dépendances:
   - PowerShell (Windows):
     ```powershell
     npm install
     ```
3. Déployer les slash commands (dans un serveur de test):
   ```powershell
   npm run deploy-commands
   ```
4. Démarrer le bot (dev):
   ```powershell
   npm run dev
   ```

## Variables d'environnement
- `DISCORD_TOKEN`: token du bot
- `DISCORD_CLIENT_ID`: ID de l'application Discord
- `GUILD_ID`: ID du serveur (guild) pour enregistrer les commandes en dev
- `COURSES_DIR`: chemin vers les fichiers de cours (défaut `../src/cours`)

## Commandes
- `/quiz list-courses` — liste les cours disponibles
- `/quiz start` — démarre une session (mode entraînement ou examen)
- `/quiz next`, `/quiz answer`, `/quiz stats`, `/quiz show-correct`, `/quiz reload`

## Notes
- Les questions sont parsées via une version Node du parseur de l'appli web.
- Le mode entraînement applique une mémorisation espacée (Leitner) simple.
- Le stockage utilise SQLite (better-sqlite3) avec fallback mémoire pour la dev.
