# PROMPT GÉNÉRATION QUESTIONS – DÉBATS CONTEMPORAINS

## Contexte
Tu es un expert en pédagogie universitaire (L1 économie, Bordeaux, cours Luc Désiré Omgba).
Tu crées des questions de révision pour l'examen Débats Contemporains (QCM + parties écrites).
Barème QCM : +1 / -0,5 / 0 — UNE seule bonne réponse.

## Format de sortie OBLIGATOIRE

```
### === [ID_NOTION] : [Nom notion] ===
### "[Description en 1 phrase]"
@add-theme: Tag1, Tag2

QCM || [Question] || V:[Réponse correcte]|[Mauvaise 1]|[Mauvaise 2]|[Mauvaise 3]
VF  || [Affirmation] || V || [Explication courte]
VF  || [Affirmation fausse] || F || [Explication pourquoi faux]
```

### Règles format
- `V:` devant la seule bonne réponse ; 3-5 options par QCM
- Option piège fréquente aux annales : "Aucune des assertions n'est correcte" (vérifier si vraie)
- Séparateur `---` entre sections

## Règles de qualité

### Types de questions (6-10 par notion)
1. **Définition/concept** (2 QCM) : Qu'est-ce que X ? Comment mesure-t-on Y ?
2. **Mécanisme** (2-3 QCM) : Effet de X sur Y ; pourquoi Z se produit
3. **Vrai/Faux** (2-3 VF) : Affirmations sur les faits empiriques et les théories
4. **Pays / Exemples** (1-2 QCM) : Chine, Inde, France, USA — données concrètes
5. **Théories commerciales** (1-2 QCM) : HO, avantages comparatifs, modèle gravité

### Tags auteurs / thèmes à utiliser
```
@add-theme: Ricardo          // avantages comparatifs
@add-theme: Heckscher-Ohlin  // dotations factorielles, HO
@add-theme: Krugman          // économies d'échelle, NEC, modèle gravité
@add-theme: Prebisch         // termes de l'échange, Sud
@add-theme: List             // protectionnisme éducateur, industrie naissante
@add-theme: Chine            // gradualisme, réformes, OMC
@add-theme: Inde             // services, capital humain, outsourcing
@add-theme: Trente Glorieuses // croissance France, reconstruction
@add-theme: Libre-échange    // gains à l'échange, avantages comparatifs
@add-theme: Protectionnisme  // barrières tarifaires/non tarifaires, dumping
@add-theme: Mondialisation   // fragmentation, géoéconomie, chaînes valeur
@add-theme: Modèle gravité   // Krugman, distance, taille économique
```

---

## PLAN DES CHAPITRES DÉBATS CONTEMPORAINS

### CHAPITRE 1 – Introduction : enjeux de l'économie ouverte
**ID préfixe** : `DC1`  
**Fichier source** : `intake/_txt/DEBATS/chapitre_1.txt`

**Notions à couvrir** :
- `DC1-I-1a` : Taux d'ouverture = (X + M) / (2 × PIB) ; définition économie ouverte
- `DC1-I-2a` : 8 thèmes en économie internationale : commerce, IED, balances, taux de change, politique commerciale, mondialisation, géoéconomie, fragmentation
- `DC1-I-3a` : Rôle des échanges dans la création de richesse (avantages comparatifs, interdépendance)
- `DC1-I-3b` : Fragmentation économique post-Covid, Ukraine, tensions géopolitiques

**Tags communs** : `Commerce international, Mondialisation, Ouverture`

---

### CHAPITRE 2 – Évolutions macroéconomiques en France et dans le monde
**ID préfixe** : `DC2`  
**Fichier source** : `intake/_txt/DEBATS/chapitre_2.txt`

**Notions à couvrir** :
- `DC2-I-1a` : Trente Glorieuses (1945–1973) : croissance forte et continue, reconstruction
- `DC2-I-1b` : Chocs pétroliers 1973, 1979, 2008 : rupture de tendance
- `DC2-I-2a` : Structure des exportations mondiales : produits manufacturés > agricoles > services
- `DC2-I-2b` : Montée des pays émergents dans le commerce mondial

**Tags communs** : `Trente Glorieuses, Croissance, Commerce mondial`

---

### CHAPITRE 3 – De la géoéconomie à la fragmentation
**ID préfixe** : `DC3`  
**Fichier source** : `intake/_txt/DEBATS/chapitre_3.txt`

**Notions à couvrir** :
- `DC3-I-1a` : Géoéconomie : rivalités économiques remplacent rivalités militaires (post-Guerre froide)
- `DC3-I-1b` : "Fin de l'histoire" (Fukuyama) : triomphe démocratie libérale
- `DC3-I-2a` : Fragmentation : démondialisation, reshoring, chaînes de valeur régionalisées
- `DC3-I-2b` : Tensions actuelles : Ukraine, mer Rouge, Chine–USA, Palestine

**Tags communs** : `Géoéconomie, Fragmentation, Mondialisation, Démondialisation`

---

### CHAPITRE 4 – La Chine : grande puissance du XXIe siècle
**ID préfixe** : `DC4`  
**Fichier source** : `intake/_txt/DEBATS/chapitre_4_la_chine_la_grande_puissance_du_21_e_siecle.txt`

**Notions à couvrir** :
- `DC4-I-1a` : Réformes Deng Xiaoping : gradualisme, zones économiques spéciales
- `DC4-I-1b` : Chine = exportatrice de produits manufacturés (avantage dotation travail, HO)
- `DC4-I-2a` : Chine vs Inde : Chine plus ouverte, plus de manufactures ; Inde plus extravertie en services
- `DC4-I-2b` : Sociétés cotées en bourse : Inde > Chine (fait contre-intuitif à mémoriser)

**Tags communs** : `Chine, Gradualisme, Heckscher-Ohlin, Exportations`

---

### CHAPITRE 5 – Aperçu du commerce international
**ID préfixe** : `DC5`  
**Fichier source** : `intake/_txt/DEBATS/chap_5_un_apercu_du_commerce_international_1.txt`

**Notions à couvrir** :
- `DC5-I-1a` : Structure commerce mondial : 55% produits manufacturés, 10% agricole, 20% services
- `DC5-I-1b` : Commerce intra-branche vs inter-branche ; différenciation produits
- `DC5-I-2a` : Avantages comparatifs (Ricardo) : spécialisation même sans avantage absolu
- `DC5-I-2b` : Théorème HO : pays exporte le bien intensif en facteur abondant

**Tags communs** : `Ricardo, Heckscher-Ohlin, Commerce international, Avantages comparatifs`

---

### CHAPITRE 6 – L'Inde : l'autre géant de l'Asie
**ID préfixe** : `DC6`  
**Fichier source** : `intake/_txt/DEBATS/chap_6_inde_autre_geant_de_lasie_1.txt`

**Notions à couvrir** :
- `DC6-I-1a` : Force de l'Inde : bas salaires (main d'œuvre abondante) + capital humain (ingénieurs)
- `DC6-I-1b` : Spécialisation dans les services (outsourcing, IT) vs Chine manufacture
- `DC6-I-1c` : Inde = plus extravertie dans son commerce que la Chine (donnée examen 2025)

**Tags communs** : `Inde, Capital humain, Services, Outsourcing`

---

### CHAPITRE 7 – Échanges internationaux et politiques commerciales
**ID préfixe** : `DC7`  
**Fichier source** : `intake/_txt/DEBATS/chapitre_7_echanges_internationaux_et_politiques_commerciales.txt`

**Notions à couvrir** :
- `DC7-I-1a` : Barrières tarifaires : droits de douane (seule vraie barrière tarifaire)
- `DC7-I-1b` : Barrières non tarifaires : quotas, normes, restrictions volontaires export, lois loyauté
- `DC7-I-2a` : Protectionnisme éducateur (List) : protéger industrie naissante à court terme
- `DC7-I-2b` : Gains à l'échange : pas universel — certains gagnent, d'autres perdent (≠ "tout le monde gagne")
- `DC7-I-3a` : Modèle de gravité (Krugman) : commerce ∝ taille économique / distance²

**Tags communs** : `Protectionnisme, Libre-échange, List, Barrières commerciales, Modèle gravité`

---

## INSTRUCTIONS D'UTILISATION

### Étape 1 : Découper le cours
Coller le contenu d'un fichier TXT de `intake/_txt/DEBATS/` dans le prompt `split-course-sections.md`.

### Étape 2 : Générer les QCM
Pour chaque section, préciser :
- L'ID préfixe (ex: `DC7`)
- Le fait que l'exam Omgba utilise souvent l'option "Aucune des assertions n'est correcte"
- Les tags auteurs à inclure

### Étape 3 : Ajouter dans le fichier
Coller le résultat à la fin de `src/questions/S2/DEBATS/DEBATS_QCM_v1.txt`.

### Étape 4 : Vérifier dans l'app
Aller sur http://localhost:5173/, sélectionner "Débats Contemporains", vérifier le nombre de questions.

---

## EXEMPLE DE REQUÊTE

> "Génère 8 questions QCM/VF pour la notion `DC7-I-1a` (barrières tarifaires vs non tarifaires) à partir du texte ci-dessous. Inclus des distracteurs qui confondent droits de douane et quotas, et l'option 'Aucune des assertions n'est correcte' quand pertinent. [COLLER LE TEXTE ICI]"

---

## ATTENTION – PIÈGES SPÉCIFIQUES À CE COURS

| Concept | Erreur fréquente | Bonne réponse |
|---|---|---|
| Barrières tarifaires | Confondre quotas avec droits douane | Seuls **droits de douane** = tarifaires |
| Force Inde | Dire "capital humain élevé" | **Bas salaires** d'abord, puis capital humain |
| Chine vs Inde extraversion | Chine = plus extravertie | **Inde** plus extravertie en proportion |
| Gains à l'échange | "Tout le monde gagne" | Certains gagnent, d'autres perdent |
| Protectionnisme définition | Seulement tarifaire | Inclut **tarifaire ET non tarifaire** |
