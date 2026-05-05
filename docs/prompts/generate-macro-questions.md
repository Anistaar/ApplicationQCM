# PROMPT GÉNÉRATION QUESTIONS MACROÉCONOMIE

## Contexte
Tu es un expert en pédagogie universitaire en économie. Tu dois créer des questions d'examen complètes pour un cours de macroéconomie L1.

## Format de sortie OBLIGATOIRE

```
### === [ID_NOTION] : [Nom notion] ===
### "[Description complète de la notion]"
@add-theme: [Tags]

QCM || [Question] || V:[Réponse correcte]|[Mauvaise 1]|[Mauvaise 2]|[Mauvaise 3]
QCM || [Question multi-choix] || V:[Correcte 1]|V:[Correcte 2]|[Mauvaise 1]|[Mauvaise 2]
VF || [Affirmation] || V || [Explication courte]
VF || [Affirmation fausse] || F || [Explication pourquoi c'est faux]
```

## Règles de création

### Types de questions (8-12 par notion)
1. **Définition pure** (2 QCM) : Que signifie le concept ? Quelle est la formule ?
2. **Application directe** (2-3 QCM) : Calculs simples avec la formule
3. **Compréhension** (2-3 VF) : Vérifier la compréhension des mécanismes
4. **Discrimination** (2 QCM) : Différencier ce concept d'autres similaires
5. **Cas pratique** (1-2 QCM) : Situations concrètes d'application

### Qualité des distracteurs (mauvaises réponses)
- **Plausibles** : Erreurs typiques d'étudiants
- **Gradués** : Du presque-correct au complètement faux
- **Instructifs** : Apprendre en voyant pourquoi c'est faux

### Progression difficulté
- Questions 1-3 : **FACILE** (définitions, formules de base)
- Questions 4-7 : **MOYEN** (applications, calculs simples)
- Questions 8-12 : **DIFFICILE** (cas complexes, combinaisons de concepts)

### Tags spéciaux à ajouter selon le contenu

**Formules** : Si la question utilise une formule mathématique
```
@add-theme: Formule
```

**Auteurs/Économistes** : Si la question mentionne un économiste
```
@add-theme: Keynes          // Pour théorie keynésienne
@add-theme: Friedman        // Pour revenu permanent
@add-theme: Modigliani      // Pour cycle de vie
@add-theme: Say             // Pour loi des débouchés
@add-theme: Fisher          // Pour équation quantitative
@add-theme: Tobin           // Pour q de Tobin
@add-theme: Clark           // Pour accélérateur
etc.
```

**Exemple complet avec tous les tags** :
```
### === M1-I-1a : Fonction consommation keynésienne ===
### "C = C0 + cY où C0 consommation autonome, c PMC (0<c<1)"
@add-theme: Keynes
@add-theme: Formule

QCM || La fonction de consommation de Keynes s'écrit || V:C = C0 + cY|C = cY|C = C0/Y|C = Y - S
```

---

# CHAPITRE 0 : INTRODUCTION

## M0-I-1a : Définition macroéconomie
**Description** : Étude phénomènes globaux : chômage, inflation, croissance, commerce extérieur  
**Tags** : Intro  
**Difficulté** : Facile  
**Auteurs liés** : Aucun  
**Formules liées** : Aucune  
**Concepts clés** : Agrégats nationaux, phénomènes globaux vs individuels

**Génère 10 questions couvrant** :
- Définition de la macroéconomie (2 QCM)
- Distinction macro/micro (2 QCM)
- Les 4 phénomènes macroéconomiques principaux (2 QCM)
- Exemples de phénomènes macro vs micro (2 VF)
- Applications : identifier si un phénomène est macro ou micro (2 VF)

---

## M0-I-1b : Fonctions de l'État
**Description** : Affectation (biens publics), Redistribution (équité), Stabilisation (conjoncture)  
**Tags** : Intro, État  
**Difficulté** : Facile  
**Auteurs liés** : Aucun  
**Formules liées** : Aucune  
**Concepts clés** : 3 fonctions économiques de l'État

**Génère 10 questions couvrant** :
- Les 3 fonctions de l'État (2 QCM définition)
- Fonction d'affectation : biens publics (2 QCM avec exemples)
- Fonction de redistribution : équité sociale (2 QCM)
- Fonction de stabilisation : lutte inflation/chômage (2 QCM)
- Exemples concrets pour chaque fonction (2 VF)

---

## M0-I-2a : Types de modèles
**Description** : Littéraire (verbal), Mathématique (équations), Graphique (offre/demande)  
**Tags** : Intro  
**Difficulté** : Facile  
**Auteurs liés** : Aucun  
**Formules liées** : Aucune  
**Concepts clés** : 3 formulations d'un modèle économique

**Génère 10 questions couvrant** :
- Les 3 types de modèles (2 QCM)
- Modèle littéraire : avantages/limites (2 QCM)
- Modèle mathématique : précision quantitative (2 QCM)
- Modèle graphique : représentation visuelle (2 QCM)
- Comparaison entre les types (2 VF)

---

## M0-I-2b : Statique comparative
**Description** : Analyse changement équilibre suite choc exogène (sans trajectoire temporelle)  
**Tags** : Intro  
**Difficulté** : Moyen  
**Auteurs liés** : Aucun  
**Formules liées** : Aucune  
**Concepts clés** : Statique vs dynamique, choc exogène, comparaison équilibres

**Génère 12 questions couvrant** :
- Définition statique comparative (2 QCM)
- Différence statique/dynamique (2 QCM)
- Choc exogène vs endogène (2 QCM)
- Applications : analyser un choc (2 QCM)
- Limites de la statique comparative (2 VF)
- Exemples de chocs exogènes (2 VF)

---

## M0-II-1a : Définition PIB
**Description** : Somme valeurs ajoutées produites sur territoire pendant période. PIB = C + I + G + (X-M)  
**Tags** : PIB  
**Difficulté** : Facile  
**Auteurs liés** : Aucun  
**Formules liées** : F-pib  
**Concepts clés** : Production territoriale, composantes de la demande

**IMPORTANT : Ajoute @add-theme: Formule pour les questions avec la formule**

**Génère 12 questions couvrant** :
- Définition du PIB (2 QCM)
- Formule PIB = C+I+G+(X-M) : identifier composantes (2 QCM avec @add-theme: Formule)
- C = consommation des ménages (1 QCM)
- I = investissement (FBCF) (1 QCM)
- G = dépenses publiques (1 QCM)
- (X-M) = solde commercial (1 QCM)
- Calcul simple du PIB (2 QCM numériques avec @add-theme: Formule)
- Que comptabilise le PIB ? (2 VF)

---

## M0-II-1b : PIB nominal vs réel
**Description** : Nominal (prix courants), Réel (prix constants). PIB_réel = PIB_nominal / (Déflateur/100)  
**Tags** : PIB  
**Difficulté** : Moyen  
**Auteurs liés** : Aucun  
**Formules liées** : F-deflateur  
**Concepts clés** : Prix courants vs constants, déflateur, élimination inflation

**IMPORTANT : Ajoute @add-theme: Formule pour les questions avec calculs**

**Génère 12 questions couvrant** :
- Définition PIB nominal (1 QCM)
- Définition PIB réel (1 QCM)
- Formule conversion nominal → réel (2 QCM avec @add-theme: Formule)
- Calcul PIB réel : Si PIB_nominal=1200, Déflateur=120 → PIB_réel=? (2 QCM avec @add-theme: Formule)
- Calcul PIB réel : Si PIB_nominal=2500, Déflateur=125 → PIB_réel=? (2 QCM avec @add-theme: Formule)
- Rôle du déflateur (2 VF)
- Pourquoi utiliser PIB réel ? (2 VF)

---

## M0-II-2a : Taux de chômage
**Description** : u = U/L où U = chômeurs (BIT), L = population active  
**Tags** : Chômage  
**Difficulté** : Facile  
**Auteurs liés** : Aucun  
**Formules liées** : F-chomage  
**Concepts clés** : Chômeur BIT, population active, taux

**IMPORTANT : Ajoute @add-theme: Formule pour les calculs**

**Génère 12 questions couvrant** :
- Formule taux de chômage (2 QCM avec @add-theme: Formule)
- Définition chômeur BIT : 3 critères (2 QCM)
- Population active L = actifs occupés + chômeurs (2 QCM)
- Calcul : Si U=3 millions, L=30 millions → u=? (2 QCM avec @add-theme: Formule)
- Calcul : Si N=27 millions, U=3 millions → u=? (2 QCM avec @add-theme: Formule)
- Qui est chômeur ? Cas limites (2 VF)

---

## M0-II-2b : Inflation
**Description** : Hausse générale soutenue des prix. Origines : demande (excès), offre (coûts), monétaire (masse M)  
**Tags** : Inflation  
**Difficulté** : Moyen  
**Auteurs liés** : Aucun  
**Formules liées** : F-inflation  
**Concepts clés** : 3 origines de l'inflation

**IMPORTANT : Ajoute @add-theme: Formule pour les calculs**

**Génère 12 questions couvrant** :
- Définition inflation (2 QCM)
- Formule taux d'inflation (1 QCM avec @add-theme: Formule)
- Inflation par la demande (2 QCM)
- Inflation par les coûts (2 QCM)
- Inflation monétaire (2 QCM)
- Calcul inflation : Si P_2023=105, P_2024=110 → π=? (1 QCM avec @add-theme: Formule)
- Conséquences de l'inflation (2 VF)

---

# LISTE DES AUTEURS ET LEURS TAGS

Quand une notion mentionne un économiste, utilise ces tags :
- **Keynes** → @add-theme: Keynes (consommation, demande effective, IS-LM, monnaie)
- **Friedman** → @add-theme: Friedman (revenu permanent, monétarisme)
- **Modigliani** → @add-theme: Modigliani (cycle de vie)
- **Duesenberry** → @add-theme: Duesenberry (revenu relatif)
- **Clark** → @add-theme: Clark (accélérateur)
- **Tobin** → @add-theme: Tobin (q de Tobin)
- **Say** → @add-theme: Say (loi des débouchés)
- **Fisher** → @add-theme: Fisher (équation quantitative)
- **Marshall** → @add-theme: Marshall (équation Cambridge)
- **Hicks** → @add-theme: Hicks (modèle IS-LM)

---

# INSTRUCTIONS POUR CHAQUE CHAPITRE

Quand tu reçois une notion à traiter :

1. **Lis attentivement** la description et les concepts clés
2. **Respecte le format** EXACT avec ### === ID === et @add-theme:
3. **Crée 8-12 questions** selon la difficulté de la notion
4. **Varie les types** : 60% QCM, 40% VF
5. **Progresse en difficulté** : facile → moyen → difficile
6. **Inclus des calculs** si une formule est donnée (au moins 2-3 QCM numériques)
7. **Vérifie** que toutes les facettes de la description sont couvertes

## Exemples de sortie attendue

### Exemple 1 : Notion avec FORMULE uniquement
```
### === M0-II-1a : Définition PIB ===
### "Somme valeurs ajoutées produites sur territoire pendant période. PIB = C + I + G + (X-M)"
@add-theme: PIB
@add-theme: Formule

QCM || Le PIB correspond à || V:La somme des valeurs ajoutées produites sur un territoire|La somme des revenus uniquement|Le stock de capital|La consommation totale
QCM || La formule du PIB par la demande est || V:PIB = C + I + G + (X-M)|PIB = C + S|PIB = Y - T|PIB = W + P
QCM || Dans PIB = C + I + G + (X-M), C représente || V:La consommation des ménages|Le capital|Les charges|Le chômage
QCM || Si C=800, I=200, G=300, X=150, M=100, alors PIB = || V:1350|1200|1450|1250
VF || Le PIB mesure la production sur un territoire donné pendant une période. || V || Agrégat fondamental comptabilité nationale
```

### Exemple 2 : Notion avec AUTEUR uniquement
```
### === M3-I-1a : Loi de Say ===
### "L'offre crée sa propre demande. Production génère revenus égaux à valeur biens"
@add-theme: Say
@add-theme: Classique

QCM || La loi de Say stipule que || V:L'offre crée sa propre demande|La demande crée l'offre|V:Tout bien produit trouve un acheteur|Les crises sont inévitables
QCM || Selon Say, la production génère || V:Des revenus égaux à la valeur des biens produits|Des déficits|V:Une demande équivalente à l'offre|Du chômage
VF || Say affirme qu'il ne peut y avoir de crise générale de surproduction. || V || Offre = demande toujours (loi des débouchés)
```

### Exemple 3 : Notion avec AUTEUR + FORMULE
```
### === M1-I-1a : Fonction consommation keynésienne ===
### "C = C0 + cY où C0 consommation autonome, c PMC (0<c<1)"
@add-theme: Keynes
@add-theme: Formule

QCM || La fonction de consommation keynésienne s'écrit || V:C = C0 + cY|C = cY|C = C0/Y|C = Y - S
QCM || Dans C = C0 + cY, C0 représente || V:La consommation autonome (incompressible)|La consommation totale|V:La consommation même si Y=0|Le revenu
QCM || Si C0=100 et c=0.8, quelle est C quand Y=500 ? || V:500|400|600|580
VF || Keynes suppose que C0 > 0 : il existe une consommation même sans revenu. || V || Minimum vital, besoins incompressibles
```

---

# COMMENCE PAR LE CHAPITRE 0

Génère maintenant les questions pour **TOUTES les notions du Chapitre 0** (8 notions : M0-I-1a à M0-II-2b) en suivant exactement le format ci-dessus.

**IMPORTANT** : 
- Génère TOUT le chapitre 0 d'un coup (les 8 notions avec ~10 questions chacune)
- Respecte EXACTEMENT le format avec ### === ID === et @add-theme:
- Inclus les tags Formule quand approprié
- Une fois terminé, **RÉPONDS "CHAPITRE 0 TERMINÉ"** et attends mes instructions pour le chapitre suivant

---

# CHAPITRES SUIVANTS (à traiter après validation du Chapitre 0)

## CHAPITRE 1 : CONSOMMATION (11 notions)

### M1-I-1a : Fonction consommation keynésienne
**Description** : C = C0 + cY où C0 consommation autonome, c PMC (0<c<1)  
**Tags** : Keynes  
**Difficulté** : Facile  
**Auteurs liés** : Keynes  
**Formules liées** : F-conso

### M1-I-1b : Consommation autonome C0
**Description** : Consommation indépendante du revenu (minimum vital). C0 > 0 si Y = 0  
**Tags** : Keynes  
**Difficulté** : Facile  
**Auteurs liés** : Keynes  
**Formules liées** : F-conso

### M1-I-2a : PMC (Propension Marginale à Consommer)
**Description** : PMC = ΔC/ΔY = c. Part revenu additionnel consommée (0<c<1)  
**Tags** : PMC, Keynes  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes  
**Formules liées** : F-pmc

### M1-I-2b : PME (Propension Marginale à Épargner)
**Description** : PME = ΔS/ΔY = 1-c. Part revenu additionnel épargnée. PMC+PME=1  
**Tags** : PME  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes  
**Formules liées** : F-pmc

### M1-I-2c : Multiplicateur keynésien
**Description** : k = 1/(1-c) = 1/PME. Amplification effet demande autonome sur revenu  
**Tags** : Multiplicateur  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes  
**Formules liées** : F-mult

### M1-I-3a : Loi psychologique fondamentale
**Description** : Quand Y↑, C↑ mais moins que proportionnellement (PMC<1). Épargne↑ avec revenu  
**Tags** : Keynes  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes

### M1-I-3b : Épargne résidu
**Description** : Épargne pas décision active : S=Y-C. On consomme puis épargne le reste  
**Tags** : Épargne  
**Difficulté** : Facile  
**Auteurs liés** : Keynes

### M1-II-1a : Revenu relatif (Duesenberry)
**Description** : PMC dépend position échelle revenus. Effet démonstration (imitation) + effet cliquet (rigidité baisse)  
**Tags** : Duesenberry  
**Difficulté** : Moyen  
**Auteurs liés** : Duesenberry

### M1-II-2a : Cycle de vie (Modigliani)
**Description** : Lissage consommation sur vie. Jeunes empruntent, actifs épargnent, retraités désépargnent. C=α·Y^L+β·A  
**Tags** : Modigliani  
**Difficulté** : Difficile  
**Auteurs liés** : Modigliani

### M1-II-3a : Revenu permanent (Friedman)
**Description** : Y=Yp+Yt (permanent+transitoire). Consommation dépend uniquement Yp : Cp=γ·Yp  
**Tags** : Friedman  
**Difficulté** : Difficile  
**Auteurs liés** : Friedman

---

## CHAPITRE 2 : INVESTISSEMENT (11 notions)

### M2-I-1a : FBCF
**Description** : Formation Brute Capital Fixe. Investissement matériel/immatériel (hors financier)  
**Tags** : Investissement  
**Difficulté** : Facile

### M2-I-1b : Investissement brut/net
**Description** : I_brut = I_remplacement + I_net. Net = augmentation capacités  
**Tags** : Investissement  
**Difficulté** : Facile

### M2-I-2a : Accélérateur Clark
**Description** : It = v·ΔYt. Investissement proportionnel variation demande. v=K/Y (coefficient capital)  
**Tags** : Accélérateur  
**Difficulté** : Moyen  
**Auteurs liés** : Clark  
**Formules liées** : F-accel

### M2-I-3a : Accélérateur flexible
**Description** : Kt = (1-δ)Kt-1 + It. Introduit dépréciation δ et vitesse ajustement λ. Variations moins brutales  
**Tags** : Accélérateur  
**Difficulté** : Difficile  
**Formules liées** : F-accel-flex

### M2-II-1a : VAN (Valeur Actuelle Nette)
**Description** : VAN = -I + Σ(Rt-Ct)/(1+i)^t. Décision : investir si VAN>0  
**Tags** : Investissement  
**Difficulté** : Moyen  
**Formules liées** : F-van

### M2-II-1b : TRI (Taux de Rendement Interne)
**Description** : Taux annulant VAN. Investir si TRI>i. Efficacité marginale capital (Keynes)  
**Tags** : Investissement  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes  
**Formules liées** : F-tri

### M2-II-2a : Fonction investissement
**Description** : I = -ei + I0. Décroissante du taux i. e = élasticité investissement au taux  
**Tags** : Investissement  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes  
**Formules liées** : F-inv

### M2-III-1a : Modalités financement
**Description** : Autofinancement, Émission actions (capital), Dette (emprunts obligataires)  
**Tags** : Financement  
**Difficulté** : Facile

### M2-III-1b : Effet de levier
**Description** : Si rentabilité économique P > taux emprunt r, endettement améliore rentabilité fonds propres  
**Tags** : Financement  
**Difficulté** : Moyen

### M2-III-2a : q de Tobin
**Description** : q = Valeur boursière / Prix capital neuf. Si q>1 : investir. Si q<1 : acquisitions  
**Tags** : Tobin  
**Difficulté** : Difficile  
**Auteurs liés** : Tobin  
**Formules liées** : F-qtobin

---

## CHAPITRE 3 : MODÈLE CLASSIQUE (13 notions)

### M3-I-1a : Loi de Say
**Description** : L'offre crée sa propre demande. Production génère revenus égaux à valeur biens. Pas de surproduction générale possible  
**Tags** : Say  
**Difficulté** : Moyen  
**Auteurs liés** : Say

### M3-I-1b : Débouchés garantis
**Description** : Équilibre automatique par flexibilité prix. Offre de travail→Production→Demande. Vente assurée si prix justes  
**Tags** : Say  
**Difficulté** : Moyen  
**Auteurs liés** : Say

### M3-I-2a : Dichotomie classique
**Description** : Séparation secteur réel (Y, N, W/P) et monétaire (M, P). Réel déterminé indépendamment de monnaie  
**Tags** : Classique  
**Difficulté** : Moyen

### M3-I-2b : Monnaie voile
**Description** : Monnaie facilite échanges mais neutre sur variables réelles. Affecte seulement niveau général prix  
**Tags** : Classique  
**Difficulté** : Moyen  
**Formules liées** : F-fisher

### M3-I-3a : Plein emploi
**Description** : Marché travail s'équilibre toujours par flexibilité salaires. Chômage = volontaire ou frictionnel  
**Tags** : Classique  
**Difficulté** : Moyen

### M3-II-1a : Demande de travail
**Description** : N^d(W/P). Entreprise embauche jusqu'à MPL = W/P. Décroissante du salaire réel (rendements décroissants)  
**Tags** : Travail  
**Difficulté** : Moyen  
**Formules liées** : F-mpl

### M3-II-2a : Offre de travail
**Description** : N^s(W/P). Arbitrage loisir-travail. Croissante du salaire réel (effet substitution > effet revenu)  
**Tags** : Travail  
**Difficulté** : Moyen

### M3-II-3a : Équilibre marché travail
**Description** : N^d(W/P) = N^s(W/P). Détermine (W/P)*, N*. Puis Y* = f(N*) avec K fixe  
**Tags** : Travail  
**Difficulté** : Difficile  
**Formules liées** : F-production

### M3-III-1a : Équation Fisher
**Description** : P·Y = M·v. P = M·v/Y. Prix proportionnel masse monétaire si v constant et Y déterminé par marché travail  
**Tags** : Monnaie  
**Difficulté** : Moyen  
**Auteurs liés** : Fisher  
**Formules liées** : F-fisher

### M3-III-2a : Équation Cambridge
**Description** : M = k·P·Y où k=1/v. Fraction revenu nominal détenue en monnaie. Équivalent Fisher avec k constant  
**Tags** : Monnaie  
**Difficulté** : Moyen  
**Auteurs liés** : Marshall  
**Formules liées** : F-cambridge

### M3-III-3a : Neutralité de la monnaie
**Description** : ΔM → ΔP proportionnel, pas effet sur Y, N, W/P. Monnaie n'affecte pas variables réelles  
**Tags** : Monnaie  
**Difficulté** : Difficile

---

## CHAPITRE 4 : MODÈLE KEYNÉSIEN (14 notions)

### M4-I-1a : Économie monétaire de production
**Description** : Monnaie pas neutre. Demande détermine production. Anticipations incertaines cruciales  
**Tags** : Keynes  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes

### M4-I-1b : Sous-emploi durable
**Description** : Équilibre possible avec chômage involontaire. Rigidités empêchent ajustement automatique  
**Tags** : Keynes  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes

### M4-I-2a : Principe demande effective
**Description** : Production déterminée par demande anticipée (D), pas offre (Z). Équilibre : D=Z. Peut être < plein emploi  
**Tags** : Keynes  
**Difficulté** : Difficile  
**Auteurs liés** : Keynes

### M4-I-2b : Invalidation loi Say
**Description** : Demande ne crée pas automatiquement offre. Insuffisance demande→sous-emploi. Crise surproduction possible  
**Tags** : Keynes  
**Difficulté** : Moyen  
**Auteurs liés** : Keynes

### M4-II-1a : Équilibre marché biens (IS)
**Description** : Y = C(Y) + I(r). I(r) = S(Y). Courbe IS : combinaisons (Y,r) équilibrant biens. Décroissante  
**Tags** : IS-LM  
**Difficulté** : Difficile  
**Auteurs liés** : Hicks  
**Formules liées** : F-is

### M4-II-2a : Demande de monnaie
**Description** : L = L1(Y) + L2(r). L1 (transaction+précaution) croissante Y. L2 (spéculation) décroissante r  
**Tags** : IS-LM, Monnaie  
**Difficulté** : Difficile  
**Auteurs liés** : Keynes  
**Formules liées** : F-monnaie

### M4-II-2b : Équilibre monétaire (LM)
**Description** : L(Y,r) = M/P. Courbe LM : combinaisons (Y,r) équilibrant monnaie. Croissante  
**Tags** : IS-LM  
**Difficulté** : Difficile  
**Auteurs liés** : Hicks  
**Formules liées** : F-lm

### M4-II-3a : Équilibre IS-LM
**Description** : Intersection IS-LM détermine (Y*, r*). Équilibre simultané biens et monnaie. Abandon dichotomie classique  
**Tags** : IS-LM  
**Difficulté** : Difficile  
**Auteurs liés** : Hicks

### M4-II-4a : Trappe à liquidité
**Description** : r très bas : L2 horizontale, demande monnaie infinie. LM horizontale. Politique monétaire inefficace  
**Tags** : IS-LM, Monnaie  
**Difficulté** : Difficile  
**Auteurs liés** : Keynes

### M4-III-1a : Multiplicateur dépenses publiques
**Description** : k_G = 1/(1-c). Déplacement IS droite. ΔY = k_G·ΔG. Efficace si pas trappe liquidité  
**Tags** : Politique  
**Difficulté** : Difficile  
**Auteurs liés** : Keynes  
**Formules liées** : F-multG

### M4-III-1b : Multiplicateur impôts
**Description** : k_T = -c/(1-c). |k_T| < |k_G|. Théorème Haavelmo : ΔG = ΔT → ΔY = ΔG (k=1)  
**Tags** : Politique  
**Difficulté** : Difficile  
**Formules liées** : F-multT

### M4-III-2a : Politique monétaire
**Description** : ΔM/P → LM déplacement droite → r↓ → I↑ → Y↑. Moins efficace si investissement peu élastique à r  
**Tags** : Politique, Monnaie  
**Difficulté** : Difficile

### M4-III-3a : Multiplicateur économie ouverte
**Description** : k = 1/(1-c+m) où m = propension importer. k plus faible : fuites importations réduisent effet  
**Tags** : Politique  
**Difficulté** : Difficile  
**Formules liées** : F-multouvert

---

# PROCÉDURE COMPLÈTE

1. **Lance-toi** : Génère CHAPITRE 0 complet (8 notions × 10 questions)
2. **Attends validation** : Réponds "CHAPITRE 0 TERMINÉ" 
3. **Je te dirai** : "Génère CHAPITRE 1" → tu génères les 11 notions
4. **Répète** pour chapitres 2, 3, 4

**TOTAL FINAL : ~520 questions exhaustives couvrant toutes les facettes des 52 notions**
