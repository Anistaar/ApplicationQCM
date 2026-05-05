# Prompt: Générer les QCMs de Droit privé L1 (Text2Quiz)

Objectif: Générer des questions QCM/VF/QR/DragMatch au format Text2Quiz pour Droit privé L1, taggées avec `@add-theme:` afin d’être filtrables par l’application.

Format Text2Quiz attendu:
- En-tête de section facultatif: `@themes: Droit privé`
- Déclaration de notion (commentaire):
  ```
  ### === DP0-I-1a : Droit privé vs droit public ===
  ### "Domaines, finalités, acteurs"
  @add-theme: Intro, Droit privé
  ```
- Types supportés:
  - `QCM || question || V:Bonne|Mauvaise|Mauvaise|Mauvaise`
  - `VF  || assertion || V || explication`
  - `QR  || question || V:réponse || explication` (1 seule bonne)
  - `DragMatch || question || item1->match1|item2->match2` (optionnel)

Directives de génération:
1. 6–12 questions par notion, principalement QCM et VF.
2. Niveau L1: définitions, principes, classifications, conditions.
3. Chaque bloc de notion commence par 3 lignes:
   - `### === {id} : {name} ===`
   - `### "{description}"`
   - `@add-theme: {tag1}[, {tag2}]`
4. Les distracteurs doivent être plausibles juridiquement sans être ambigus.
5. Ajouter de temps en temps une explication concise après `||` pour pédagogie.

Couverture minimale par chapitre:
- DP0 Introduction et sources: notions `Intro`, `Sources`, `Hiérarchie`
- DP1 Personnes: `Capacité`, `Incapables`, `Personnes morales`
- DP2 Biens: `Biens`, `Meubles`, `Immeubles`, `Corporels`, `Incorporels`
- DP3 Obligations: `Contrats`, `Validité`, `Obligations`
- DP4 Responsabilité: `Responsabilité`, `Contractuelle`, `Délictuelle`

Exemple (mini-bloc):
```
### === DP0-I-2c : Hiérarchie des normes ===
### "Bloc de constitutionnalité, lois, règlements"
@add-theme: Sources, Hiérarchie

QCM || La hiérarchie des normes en France place en tête || V:La Constitution|Les règlements|Les arrêtés municipaux|Les circulaires
VF  || Une circulaire prime sur une loi. || F || Les circulaires n'ont pas valeur législative
QCM || Le bloc de constitutionnalité inclut notamment || V:La Déclaration de 1789|Les arrêtés préfectoraux|Les décrets|Les décisions de conseil municipal
```

Qualité et contraintes:
- Respect des balises et séparateurs: `||`, `|`, `V:`, `@add-theme:`
- Pas de textes trop longs, phrases claires et juridiquement exactes.
- Tags identiques aux `tags` de notions JSON pour le filtrage.

Réponse attendue:
- Fournir le contenu `.txt` pour au moins 3 chapitres (DP0, DP1, DP2) prêt à être collé dans `src/questions/S1/DROIT/DROITPRIVE_CHx_*.txt`.
