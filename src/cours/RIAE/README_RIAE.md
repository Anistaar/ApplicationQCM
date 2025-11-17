# RIAE — Renforcement à l'introduction à l'analyse économique

Ce dossier contient la matière RIAE structurée par chapitres.

## Où déposer vos sources
- Placez vos notes/diapos/fiche dans `src/cours/RIAE/SOURCES/` (PDF, DOCX ou TXT).

## Conversion rapide (optionnel)
- PDF → TXT: `npm run convert:riae:pdf` (écrit des `.txt` avec un en-tête `chapter:` dans `src/cours/RIAE/`)
- DOCX → TXT: `npm run convert:riae:docx` (convertit tous les `.docx` du dossier SOURCES)

## Format des questions (rappel)
Chaque question est une seule ligne:
```
TYPE || Question || Réponses || Explication || Thèmes
```
Types: VF, QR, QCM, DragMatch (voir `FORMATS_QUESTIONS.md`).

Ajoutez toujours un tag de difficulté dans les thèmes: `Diff: Facile | Diff: Moyen | Diff: Difficile`.

## Organisation conseillée
- Garder 1 fichier de cours par chapitre (`riae_chapX_...txt`) avec la ligne `chapter:` en tête.
- Créer des banques par difficulté par chapitre si besoin:
  - `riae_chapX_banque_facile.txt`
  - `riae_chapX_banque_moyen.txt`
  - `riae_chapX_banque_difficile.txt`

## Prompt de génération
Voir `src/cours/RIAE/PROMPTS/riae_generation_prompt.txt` pour produire automatiquement des banques couvrant tout le cours (F/M/D) avec formats VF/QR/QCM/DragMatch.
