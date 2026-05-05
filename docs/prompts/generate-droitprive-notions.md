# Prompt: Générer les notions de Droit privé L1

Objectif: À partir du plan de cours de Droit privé L1 et de la structure JSON cible, produire une liste exhaustive de notions (id, nom, description, tags, difficulté, temps estimé) alignées avec la taxonomie utilisée par l’application.

Contexte:
- Structure cible JSON: Chapter > Section > SubSection > Notion
- Les `tags` servent au filtrage et au mapping avec les questions via `@add-theme:` dans les `.txt`
- Style attendu identique à `MACRO_complete.json`

Ressources:
- Plan de cours: Droit privé L1 (Introduction, Personnes, Biens, Obligations, Responsabilité)
- Exemple de structure prête: `src/database/structures/DROITPRIVE_complete.json`

Tâche pour ChatGPT:
1. Parcourir chaque chapitre du plan Droit privé et définir 2 à 4 sous-sections avec 1 à 3 notions chacune.
2. Pour chaque notion, fournir:
   - `id` canonique: `DP{chapitre}-{section}-{index}{lettre}` (ex: `DP1-I-1a`)
   - `name`: bref et précis
   - `description`: définition synthétique utile pour QCM
   - `tags`: 1 à 3 mots clés normalisés (ex: `"Intro"`, `"Sources"`, `"Biens"`, `"Contrats"`, `"Responsabilité"`)
   - `difficulty`: `Facile` | `Moyen` | `Difficile` | `Expert`
   - `estimatedTime`: minutes de révision (5–15)
3. Respecter la granularité: notions atomiques, non redondantes, couvrant le plan.
4. Sortie: bloc JSON prêt à intégrer dans `DROITPRIVE_complete.json` sous la clé `chapters[].sections[].subsections[].notions`.

Contraintes et formats:
- Ne pas inventer de cas pratiques complexes; rester au niveau L1.
- Tags doivent être réutilisables côté questions (`@add-theme:`). Pas d’espaces superflus.
- Utiliser un vocabulaire juridique précis et pédagogique.

Exemple de notion (modèle):
```json
{"id": "DP0-I-2c", "name": "Hiérarchie des normes", "description": "Bloc de constitutionnalité, lois, règlements", "tags": ["Sources", "Hiérarchie"], "difficulty": "Moyen", "estimatedTime": 9}
```

Validation demandée:
- Couverture du plan: Introduction, Personnes (physiques/morales), Biens, Obligations, Responsabilité
- Total ~25–35 notions
- Tags cohérents et réutilisables

Réponse attendue:
- Fournir le JSON pour l’ensemble des notions, prêt à copier-coller dans le fichier de structure.
