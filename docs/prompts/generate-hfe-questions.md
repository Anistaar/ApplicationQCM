# PROMPT GÉNÉRATION QUESTIONS – HISTOIRE DES FAITS ÉCONOMIQUES (HFE)

## Contexte
Tu es un expert en pédagogie universitaire (L1 économie, Université de Bordeaux, cours Christelle Mougeot).
Tu crées des questions de révision pour l'examen HFE (QCM 20 questions, 30 min, barème +1 / -0,5 / 0 — UNE seule bonne réponse par question).

## Format de sortie OBLIGATOIRE

```
### === [ID_NOTION] : [Nom notion] ===
### "[Description en 1 phrase"
@add-theme: Tag1, Tag2, Auteur

QCM || [Question] || V:[Réponse correcte]|[Mauvaise 1]|[Mauvaise 2]|[Mauvaise 3]
VF  || [Affirmation vraie ou fausse] || V || [Explication courte]
VF  || [Affirmation fausse] || F || [Explication pourquoi c'est faux]
```

### Règles de format
- `V:` devant la **seule** bonne réponse QCM
- 3 à 4 options par QCM (reproduire le format de l'exam : 3 options pour les questions style 2023)
- VF : exactement 3 colonnes après `VF` : affirmation | V ou F | explication courte
- **Jamais** de `V:` sur plusieurs réponses dans le même QCM
- Séparateur `---` entre sections

## Règles de qualité

### Types de questions (6-10 par notion)
1. **Définition** (2 QCM) : Qu'est-ce que X ? Qui a dit ça ?
2. **Mécanisme** (2-3 QCM) : Comment fonctionne X ? Quelle est la conséquence de Y ?
3. **Vrai/Faux** (2-3 VF) : Affirmations sur les mécanismes — varier V et F
4. **Auteur/Citation** (1-2 QCM) : À qui attribuer cette théorie ou citation ?
5. **Discrimination** (1 QCM) : Distinguer X de Y (notions proches)

### Qualité des distracteurs
- **Plausibles** : Confusions typiques (ex: confondre Keynes et Friedman sur la crise 1929)
- **Instructifs** : La mauvaise réponse enseigne aussi quelque chose

### Tags auteurs à utiliser
```
@add-theme: Malthus          // trappe malthusienne
@add-theme: Ricardo          // avantages comparatifs, rente diff
@add-theme: Solow            // modèle croissance, état stationnaire
@add-theme: Schumpeter       // destruction créatrice, grappes innovations
@add-theme: Marx             // matérialisme historique, forces productives
@add-theme: Douglas North    // institutions, coûts de transaction
@add-theme: Rostow           // étapes croissance, décollage
@add-theme: Hobsbawm         // révolution industrielle, exportations
@add-theme: Allen            // salaires, coût capital, révolution industrielle
@add-theme: Eichengreen      // étalon or, crise 1929
@add-theme: Friedman         // monétarisme, offre monnaie, crise 1929
@add-theme: Keynes           // demande, dépenses publiques, crise 1929
@add-theme: Kindleberger     // stabilisateur hégémonique, crise 1929
@add-theme: Boserup          // contrainte agraire, population favorable
```

---

## PLAN DES CHAPITRES HFE

### CHAPITRE 1 – La trappe malthusienne
**ID préfixe** : `HFE0`  
**Fichier source** : `intake/_txt/HFE/chap_1_la_trappe_malthusienne.txt`

**Notions à couvrir** :
- `HFE0-I-1a` : Définition trappe malthusienne (revenu par tête constant, gains prod → hausse pop)
- `HFE0-I-1b` : 3 conditions : décroissance productivité + réponse démo aux revenus + PT insuffisant
- `HFE0-I-1c` : Corrélation pop/salaires en Angleterre XIIIe–XVIIe (négative, Peste noire)
- `HFE0-I-1d` : Modèle formel : Y = f(L), f'(L) < 0 ; N* = f(w), w* = niveau subsistance

**Tags communs** : `Malthus, Trappe malthusienne`

---

### CHAPITRE 2 – La sortie de la trappe malthusienne
**ID préfixe** : `HFE1`  
**Fichier source** : `intake/_txt/HFE/chap_2_la_sortie_de_la_trappe_malthusienne.txt`

**Notions à couvrir** :
- `HFE1-I-1a` : Rupture XIXe : gains prod → hausse revenu/tête (plus hausse pop)
- `HFE1-I-1b` : Transition démographique : passage fort natal/mort → faible natal/mort
- `HFE1-I-1c` : Corrélation pop/salaires devient positive à partir XIXe
- `HFE1-I-1d` : Rôle de la révolution industrielle vs changement démographique (débat)

**Tags communs** : `Révolution industrielle, Transition démographique`

---

### CHAPITRE 3 – Pourquoi la révolution industrielle en Angleterre ?
**ID préfixe** : `HFE2`  
**Fichier source** : `intake/_txt/HFE/chap_3_pourquoi_la_ravolution_industrielle_en_angleterre.txt`

**Notions à couvrir** :
- `HFE2-I-1a` : Révolution agricole : enclosures, nouvelles méthodes, libération main d'œuvre
- `HFE2-I-2a` : Hobsbawm : marchés d'exportation → révolution industrielle "presque obligatoire"
- `HFE2-I-2b` : Allen : hauts salaires + bas coût capital → adoption machines rentable EN Angleterre
- `HFE2-I-2c` : Coal/énergie : accès charbon peu cher unique avantage anglais (thèse Wrigley)
- `HFE2-I-3a` : Institutions (Douglas North) : droits prop, contrats, coûts transaction faibles

**Tags communs** : `Révolution industrielle, Angleterre, Hobsbawm, Allen, Douglas North`

---

### CHAPITRE 4 – Le modèle de Solow
**ID préfixe** : `HFE3`  
**Fichier source** : `intake/_txt/HFE/chap_4_le_moda_le_de_solow.txt`

**Notions à couvrir** :
- `HFE3-I-1a` : Intensité capitalistique k = K/L, productivité y = Y/L
- `HFE3-I-1b` : Accumulation capital : k augmente si I > dépréciation + croissance démo
- `HFE3-I-2a` : État stationnaire : k* et y* constants, croissance s'arrête
- `HFE3-I-2b` : Après état stationnaire : seul progrès technique génère croissance long terme
- `HFE3-I-3a` : Convergence absolue vs conditionnelle (bêta-convergence)
- `HFE3-I-3b` : Sous-développement = retard d'accumulation capital (dérive du modèle)

**Tags communs** : `Solow, Croissance économique, Convergence, État stationnaire`

---

### CHAPITRE 5 – Continuité ou rupture historique ? (Schumpeter, Marx, North, Rostow)
**ID préfixe** : `HFE4`  
**Fichier source** : `intake/_txt/HFE/chap_5_continuita_ou_rupture_historique.txt`

**Notions à couvrir** :
- `HFE4-I-1a` : Schumpeter – grappes d'innovations, destruction créatrice, cycle Kondratieff
- `HFE4-I-2a` : Marx – matérialisme historique : forces productives > rapports de production → révolution
- `HFE4-I-2b` : Marx – citation "rapports de production / forces productives" (à attribuer)
- `HFE4-I-3a` : Douglas North – institutions = règles du jeu ; coûts de transaction ; citation
- `HFE4-I-4a` : Rostow – 5 étapes (société trad → précond → décollage → maturité → consomm masse)
- `HFE4-I-4b` : Rostow – décollage : taux invest + secteurs 2/3 ; développement linéaire

**Tags communs** : `Schumpeter, Marx, Douglas North, Rostow, Institutions`

---

### CHAPITRE 6 – La Grande Dépression de 1873
**ID préfixe** : `HFE5`  
**Fichier source** : `intake/_txt/HFE/chap_6_la_grande_dapression_de_1873.txt`

**Notions à couvrir** :
- `HFE5-I-1a` : Caractéristiques : déflation (pas inflation ni chômage massif)
- `HFE5-I-1b` : Causes monétaristes : cycle ferroviaire achevé + baisse production or → contraction M
- `HFE5-I-2a` : Étalon or : définition (poids fixe en or), rôle (rééquilibrage balance commerciale)
- `HFE5-I-2b` : Mécanisme price-specie flow (Hume) : excédent → or → hausse prix → rééquilibre
- `HFE5-I-3a` : Première mondialisation : baisse coûts transport (train, vapeur) → ouverture commerciale

**Tags communs** : `Crise 1873, Étalon or, Grande Dépression XIXe, Première mondialisation`

---

### CHAPITRE 7 – La Grande Dépression des années 1930
**ID préfixe** : `HFE6`  
**Fichier source** : `intake/_txt/HFE/chap_7_la_grande_depression_des_annaes_1930.txt`

**Notions à couvrir** :
- `HFE6-I-1a` : Krach 1929 : origine, faillites bancaires, contraction M (Friedman)
- `HFE6-I-1b` : Friedman : BCE aurait dû augmenter M ; maintien taux élevés = erreur
- `HFE6-I-1c` : Keynes : baisse demande autonome années 1920 → multiplicateur négatif
- `HFE6-I-1d` : Affirmation FAUSSE : le gouvernement a AUGMENTÉ les dépenses publiques (en réalité : austérité)
- `HFE6-I-2a` : Eichengreen : étalon or = canal transmission USA → Europe
- `HFE6-I-2b` : Kindleberger : absence stabilisateur hégémonique (USA refus remplacer GB)

**Tags communs** : `Crise 1929, Friedman, Keynes, Étalon or, Eichengreen, Kindleberger`

---

## INSTRUCTIONS D'UTILISATION

### Étape 1 : Découper le cours
Coller le contenu d'un fichier TXT de `intake/_txt/HFE/` et demander au LLM de le découper en sections avec le prompt `split-course-sections.md`.

### Étape 2 : Générer les QCM
Pour chaque section, utiliser ce prompt + le contenu section. Indiquer :
- L'ID préfixe (ex: `HFE3`)
- Le nombre de questions souhaité (6-10 par notion)
- Les tags auteurs à inclure

### Étape 3 : Ajouter dans le fichier
Coller le résultat à la fin de `src/questions/S2/HFE/HFE_QCM_v1.txt`.

### Étape 4 : Vérifier dans l'app
Aller sur http://localhost:5173/, sélectionner "Histoire des Faits Éco", vérifier que le nombre de questions a augmenté.

---

## EXEMPLE DE REQUÊTE

> "Génère 8 questions QCM/VF pour la notion `HFE3-I-2a` (état stationnaire de Solow) à partir du texte ci-dessous. Utilise le format HFE avec tags Solow, État stationnaire. [COLLER LE TEXTE ICI]"
