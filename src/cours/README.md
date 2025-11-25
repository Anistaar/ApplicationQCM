# 📚 Dossier Cours Sources

Ce dossier contient les **supports de cours originaux** (documents PDF, DOCX, transcriptions, etc.).

## Structure

- Les fichiers sources ne sont **pas importés par l'application**
- Utilisés comme référence pour générer les questions
- Scripts de conversion disponibles dans `/scripts`

## Workflow

1. Placer documents sources ici (PDF, DOCX, TXT)
2. Utiliser scripts de conversion (`scripts/convert-docx-to-txt.mjs`, `scripts/convert-pdf-to-txt.mjs`)
3. Utiliser prompts LLM (`prompts/split-course-sections.md`, `prompts/generate-openq.md`)
4. Générer questions dans `/src/questions`

## Scripts Disponibles

- `convert-docx-to-txt.mjs` : Convertir Word → TXT
- `convert-pdf-to-txt.mjs` : Convertir PDF → TXT (OCR)
- `ocr-partiels-*.mjs` : OCR spécifiques (Analyse Éco, Stats)

## Exemples

- Cours PDF scannés (partiels, polycopiés)
- Transcriptions audio/vidéo
- Supports PowerPoint exportés
- Documents Word enseignants
