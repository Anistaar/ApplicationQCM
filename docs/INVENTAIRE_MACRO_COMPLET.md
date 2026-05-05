# 📊 Inventaire MACRO - Analyse Complète

**Date** : 30 novembre 2025  
**Objectif** : Cartographie détaillée des 14 fichiers MACRO pour le cours de Macroéconomie S1

---

## 📁 Fichiers (14 fichiers analysés)

| Fichier | Lignes | Questions estimées | Type dominant | Chapitres couverts |
|---------|--------|-------------------|---------------|-------------------|
| **BANQUE_QUESTIONS_MACRO_v1.txt** | ~450 | **90 QCM** | QCM multi-réponses | Ch0-4 (synthèse complète) |
| **macro_chap0_intro.txt** | ~360 | **90 QR + 6 QCM** | QR (brut de cours) | Ch0 Introduction |
| **macro_chap1_consommation.txt** | ~410 | **70 QR + 15 QCM** | QR + QCM | Ch1 Consommation |
| **macro_chap2_investissement.txt** | ~400 | **65 QR + 18 QCM** | QR + QCM | Ch2 Investissement |
| **macro_chap3_modele_classique_reel.txt** | ~380 | **60 QR + 9 QCM** | QR + QCM | Ch3 Modèle classique réel |
| **macro_chap3_theorie_quantitative_monnaie.txt** | ~180 | **30 QR + 1 QCM** | QR + QCM | Ch3 bis Théorie quantitative |
| **macro_chap4_modele_keynesien.txt** | ~520 | **85 QR + 1 QCM** | QR (très détaillé) | Ch4 Keynes (ISLM) |
| **Intro_v2.txt** | ~45 | **7 QCM** | QCM examen | Ch0 Introduction |
| **Consommation_v2.txt** | ~40 | **8 QCM** | QCM examen | Ch1 Consommation |
| **Investissement_v2.txt** | ~25 | **6 QCM (incomplet)** | QCM examen | Ch2 Investissement |
| **ModeleClassique_v2.txt** | ~30 | **6 QCM** | QCM examen | Ch3 Modèle classique |
| **DragMatch_v1.txt** | ~35 | **8 DragMatch** | DragMatch | Ch0-4 (associations) |
| **macro_unclassified.txt** | ~15 | **2 QCM** | QCM isolés | Ch1 (calculs) |
| **macro_chap1_openq_v1.txt** | ~120 | **20 OpenQ** | Questions ouvertes | Ch1 Consommation |

**Total estimé : ~570 questions** (dont ~260 QCM, ~300 QR, ~20 OpenQ, ~8 DragMatch)

---

## 🗂️ Structure des Chapitres Identifiés

### **Chapitre 0 : Introduction à la Macroéconomie**

**Fichiers** : `macro_chap0_intro.txt`, `Intro_v2.txt`, sections dans `BANQUE_v1.txt`

**Questions estimées** : ~100 (96 QR + 13 QCM)

**Notions principales** :
- Définition de la macroéconomie (phénomènes globaux : chômage, inflation, croissance)
- Fonctions de l'État : **affectation**, **redistribution**, **stabilisation**
- **Agrégats** économiques (PIB, consommation globale, investissement)
- Types de modèles : **littéraire**, **mathématique**, **graphique**
- **Statique comparative** vs modèle **dynamique**
- Circuit économique : offre/demande, emplois/ressources
- **PIB** : nominal vs réel, prix courants vs constants, déflateur
- **Taux de chômage** : définitions BIT/INSEE
- **Inflation** : IPC, origines (demande, offre, monétaire)

**Formules clés** :
- PIB = C + I + G + (X - M)
- PIB réel = PIB nominal / (Déflateur/100)
- Taux d'inflation = (P_t - P_{t-1}) / P_{t-1}
- u = U/L (taux de chômage)

---

### **Chapitre 1 : La Consommation**

**Fichiers** : `macro_chap1_consommation.txt`, `Consommation_v2.txt`, `macro_chap1_openq_v1.txt`, sections dans `BANQUE_v1.txt`

**Questions estimées** : ~115 (70 QR + 23 QCM + 20 OpenQ)

**Notions principales** :

#### **1.1 Fonction de consommation keynésienne**
- **C = C0 + cY** (C0 = consommation autonome, c = PMC)
- **Loi psychologique fondamentale** : la consommation augmente avec le revenu, mais moins vite
- **0 < c < 1** (PMC)
- Épargne = **résidu** de la consommation (S = Y - C)
- **PMC + PME = 1**
- **Multiplicateur keynésien** : k = 1/(1-c)

#### **1.2 Théories intertemporelles**
- **Revenu relatif** (Duesenberry, 1948)
  - **Effet de cliquet** : consommation irréversible
  - PMC dépend de la position relative dans l'échelle des revenus
  - Ménages pauvres ont PMC plus élevée

- **Cycle de vie** (Modigliani, 1954)
  - Objectif : **lisser la consommation** sur la durée de vie
  - **Courbe en bosse** du patrimoine (négatif → max → 0)
  - A/Y (patrimoine/revenu) décroissant avec g
  - PMC = 1 sur la vie entière

- **Revenu permanent** (Friedman, 1957)
  - **Y = Yp + Yt** (permanent + transitoire)
  - **Yp = (1-λ)(Yt + λY_{t-1} + λ²Y_{t-2} + ...)**
  - Consommation dépend du revenu permanent, pas du revenu courant
  - Anticipations adaptatives

#### **1.3 Déterminants de l'épargne**
**Court terme** :
- Pouvoir d'achat (effet négatif si ralentissement)
- Taux de chômage (effet positif → épargne de précaution)
- Inflation (effet ambigu : fuite devant la monnaie vs effet d'encaisses réelles)
- Taux d'intérêt (débiteur vs créditeur)

**Long terme** :
- Vieillissement de la population (effet négatif)
- Système de retraite par répartition (effet ambigu)

---

### **Chapitre 2 : L'Investissement**

**Fichiers** : `macro_chap2_investissement.txt`, `Investissement_v2.txt`, sections dans `BANQUE_v1.txt`

**Questions estimées** : ~90 (65 QR + 24 QCM)

**Notions principales** :

#### **2.1 Définitions**
- **FBCF** (Formation Brute de Capital Fixe)
- **Investissement brut** = Investissement de remplacement + Investissement net
- Investissement de remplacement : maintien des capacités
- Investissement net : **augmentation** des capacités

#### **2.2 Principe de l'accélérateur**
- **Accélérateur simple** (Clark, 1917)
  - **It = v·ΔYt** (investissement proportionnel à la variation de la demande)
  - v = K/Y (coefficient de capital)
  - Hypothèses : absence de capacités oisives, v constant, rendements constants

- **Accélérateur flexible**
  - Introduit **δ** (dépréciation), **λ** (vitesse d'ajustement)
  - **Kt = (1-δ)Kt-1 + It**
  - Effet d'inertie : It-1 influence It
  - Variations moins brutales

#### **2.3 Investissement et taux d'intérêt**
- **VAN** (Valeur Actuelle Nette)
  - VAN = -I + Σ(Rt-Ct)/(1+i)^t
  - **Décision : investir si VAN > 0**

- **TRI** (Taux de Rendement Interne)
  - Taux qui annule la VAN
  - **Investir si TRI > i**
  - **Efficacité marginale du capital** (Keynes)

- **Fonction d'investissement** : I = -ei + I0
  - Décroissante du taux d'intérêt

#### **2.4 Financement**
- **Modalités** : autofinancement, actions, dette
- **Effet de levier** : si P > r, l'endettement améliore la rentabilité des fonds propres
- **q de Tobin** : valeur boursière / prix capital neuf
  - Si q > 1 : investir en capital neuf
  - Si q < 1 : favoriser acquisitions

---

### **Chapitre 3 : Modèle Classique**

**Fichiers** : `macro_chap3_modele_classique_reel.txt`, `macro_chap3_theorie_quantitative_monnaie.txt`, `ModeleClassique_v2.txt`, sections dans `BANQUE_v1.txt`

**Questions estimées** : ~105 (90 QR + 15 QCM)

**Notions principales** :

#### **3.1 Principes fondamentaux**
- **Loi de Say** : l'offre crée sa propre demande (pas de crise de surproduction)
- **Dichotomie classique** : séparation sphère réelle / sphère monétaire
- **Monnaie = voile** sur l'économie (neutre à long terme)
- Plein emploi des facteurs (K, L)
- Chômage = **volontaire** (hors rigidités)
- Ajustement par les **prix** (flexibilité)

#### **3.2 Marché du travail**
- **Demande de travail** : décroissante du salaire réel (W/P)
  - Condition d'optimum : **MPL = W/P**
- **Offre de travail** : croissante du salaire réel
  - Effet de substitution > effet revenu
- **Équilibre** : (W/P)*, N*, Y*
- Production : **Y = f(N)** (K fixe à court terme)

#### **3.3 Théorie quantitative de la monnaie**
- **Fisher (1911)** : **P·Y = M·v**
  - P = niveau général des prix
  - Y = production réelle (constante à court terme)
  - M = masse monétaire
  - v = vitesse de circulation (constante)
- **Neutralité de la monnaie** : ΔM → ΔP (pas d'effet sur Y, N)
- **Équation de Cambridge** : M = k·P·Y (k = 1/v)

---

### **Chapitre 4 : Modèle Keynésien**

**Fichiers** : `macro_chap4_modele_keynesien.txt`, sections dans `BANQUE_v1.txt`

**Questions estimées** : ~85 (85 QR + 1 QCM)

**Notions principales** :

#### **4.1 Révolution keynésienne**
- Rupture avec le modèle classique
- **Modèle de demande** (vs modèle d'offre classique)
- **Économie monétaire de production**
- Possibilité de **sous-emploi** durable
- Chômage **involontaire**
- Ajustement par les **quantités** (rigidité des prix à court terme)
- Intervention de l'État nécessaire

#### **4.2 Principe de la demande effective**
- **Prix de l'offre globale** (Z) : coûts minimaux + profit minimal
- **Prix de la demande globale** (D) : recettes anticipées
- **Demande effective** : point où Z = D (profit maximal)
- Niveau d'emploi déterminé par les anticipations des entreprises

#### **4.3 Invalidation de la loi des débouchés**
- L'offre de plein emploi ne trouve pas nécessairement preneur
- Incertitude sur les débouchés → sous-emploi possible

#### **4.4 Multiplicateur keynésien**
- **k = 1/(1-c)**
- **ΔY = k·ΔI**
- Effet de chaîne : I ↑ → Y ↑ → C ↑ → Y ↑...
- En économie ouverte : k = 1/(1-c+m) (m = propension à importer)
- Multiplicateur des dépenses publiques : k_G = 1/(1-c)
- Multiplicateur des impôts : k_T = -c/(1-c)
- **Théorème de Haavelmo** : multiplicateur d'équilibre budgétaire = 1

#### **4.5 Préférence pour la liquidité**
- Demande de monnaie pour **3 motifs** :
  - **Transaction** : L1(Y)
  - **Précaution** : L1(Y)
  - **Spéculation** : L2(r)
- Taux d'intérêt = **prix de la renonciation à la liquidité**
- **Trappe à liquidité** : r minimum, préférence absolue pour la liquidité

#### **4.6 Modèle ISLM**
- **Courbe IS** : équilibre sur le marché des biens & services
  - I(r) = S(Y)
  - Décroissante (r ↓ → I ↑ → Y ↑ via k)
- **Courbe LM** : équilibre sur le marché de la monnaie
  - L(Y, r) = M/P (offre exogène)
  - Croissante (Y ↑ → L1 ↑ → r ↑)
- **Équilibre global** : intersection IS-LM → (Y*, r*)
- Abandon de la dichotomie réel/monétaire

---

## 🏷️ Thèmes Actuels (Tags identifiés)

**Liste alphabétique des thèmes présents dans les fichiers :**

1. **Accélérateur** (simple, flexible)
2. **Consommation** (fonction, théories)
3. **CH1, CH2, CH3, CH4** (chapitres)
4. **Chapitre 0, 1, 2, 3, 4** (variante)
5. **Droit** (mention isolée)
6. **DragMatch** (type de question)
7. **Épargne** (déterminants, cycle de vie)
8. **Financement** (investissement)
9. **Investissement** (FBCF, TRI, VAN, q Tobin)
10. **Keynes** (omniprésent dans Ch4)
11. **Macro** (tag générique sur tous les fichiers)
12. **Marché du travail** (offre, demande, W/P)
13. **Modèle classique** (CPP, dichotomie)
14. **Offre-Demande** (équilibre, débouchés)
15. **PIB** (nominal, réel, déflateur)
16. **Prix** (inflation, IPC, niveau général)
17. **QCM, QR** (types de questions)
18. **Ricardo** (mention isolée)
19. **Smith** (Adam, main invisible)
20. **Taux d'intérêt** (investissement, liquidité)
21. **Théories intertemporelles** (cycle de vie, revenu permanent)

**Thèmes manquants ou sous-représentés :**
- Politique monétaire (BCE, banques)
- Politique budgétaire (détails)
- Balance commerciale (X-M)
- Multiplicateur d'exportations
- Marché des changes (absent)
- Croissance économique à long terme

---

## 📐 Formules Détectées (avec contexte)

### **Chapitre 0 - Introduction**
- **Y + M = C + I + G + X** (équilibre emplois-ressources)
- **Y = C + I + G + (X - M)** (équilibre en économie ouverte)
- **PIB réel = PIB nominal / (Déflateur/100)**
- **Taux d'inflation π = (P_t - P_{t-1}) / P_{t-1}**
- **Taux de chômage u = U/L** (U = chômeurs, L = population active)

### **Chapitre 1 - Consommation**
- **C = C0 + cY** (fonction keynésienne, 0 < c < 1)
- **S = Y - C = -C0 + (1-c)Y** (épargne résiduelle)
- **PMC = C/Y** ; **PmC = ΔC/ΔY = c**
- **PME = S/Y = 1 - C/Y** ; **PmE = 1 - c**
- **k = 1/(1-c)** (multiplicateur keynésien)
- **Y* = k(C0 + I0) = (C0 + I0)/(1-c)** (revenu d'équilibre)
- **Élasticité e_C/Yd = (ΔC/C) / (ΔYd/Yd)**
- **Yd = Y - T + F** (revenu disponible avec impôts et transferts)

**Cycle de vie (Modigliani)** :
- **C_t = α·Y^L_t + β·A_t** (Y^L = revenu d'activité, A = patrimoine)
- **A/Y ≈ fonction décroissante de g** (taux de croissance)

**Revenu permanent (Friedman)** :
- **Y = Yp + Yt** (permanent + transitoire)
- **Yp = (1-λ)(Yt + λY_{t-1} + λ²Y_{t-2} + ...)** (anticipations adaptatives)
- **Cp = γ·Yp** (0 < γ ≤ 1)

### **Chapitre 2 - Investissement**
- **It = v·ΔYt** (accélérateur simple, v = K/Y)
- **Kt = (1-δ)Kt-1 + It** (stock de capital avec dépréciation)
- **It = v(1-λ)Yt - λKt-1** (accélérateur flexible)
- **VAN = -I + Σ(Rt-Ct)/(1+i)^t** (valeur actuelle nette)
- **TRI : VAN = 0** (taux de rendement interne)
- **I = -ei + I0** (fonction d'investissement)
- **Π/A = P + (P-r)·(E/A)** (effet de levier)
- **q de Tobin = Valeur boursière K / Prix K neuf**

### **Chapitre 3 - Modèle Classique**
- **MPL = W/P** (productivité marginale = salaire réel)
- **Y = f(N)** (fonction de production, K fixe)
- **N^d(W/P) = N^s(W/P)** (équilibre du marché du travail)
- **P·Y = M·v** (équation de Fisher)
- **M = k·P·Y** (équation de Cambridge, k = 1/v)

### **Chapitre 4 - Modèle Keynésien**
- **Z = N·w(1+α)** (prix de l'offre globale)
- **D = C(Y) + I** (prix de la demande globale)
- **Y = C(Y) + I** → **Y = [C0 + I0]/(1-c)** (équilibre keynésien)
- **k = 1/(1-c)** (multiplicateur en économie fermée)
- **k_ouverte = 1/(1-c+m)** (m = propension à importer)
- **k_G = 1/(1-c)** (multiplicateur des dépenses publiques)
- **k_T = -c/(1-c)** (multiplicateur des impôts)
- **L = L1(Y) + L2(r)** (demande de monnaie totale)
- **L1 = t·Y** (transaction + précaution)
- **L2 = l0 - lr** (spéculation)
- **I(r) = S(Y)** (courbe IS)
- **L(Y,r) = M/P** (courbe LM)

---

## 👥 Auteurs Cités (économistes)

### **Classiques et néoclassiques**
1. **Adam Smith** (Ch3) - Main invisible, régulation spontanée
2. **Jean-Baptiste Say** (Ch3) - Loi des débouchés ("l'offre crée sa propre demande")
3. **David Ricardo** (Ch3) - État stationnaire, absence de crises
4. **Walras** (Ch3) - Équilibre général, condition d'abondance
5. **Irving Fisher** (Ch3) - Théorie quantitative de la monnaie (1911)
6. **Alfred Marshall** (Ch3) - Équation de Cambridge
7. **Pigou** (Ch3) - Équation de Cambridge

### **Keynésiens et post-keynésiens**
8. **John Maynard Keynes** (omniprésent Ch1, 4) - Théorie générale (1936), fonction de consommation, principe de demande effective, préférence pour la liquidité
9. **James Duesenberry** (Ch1) - Revenu relatif (1948, 1949), effet de cliquet, effet de démonstration
10. **Franco Modigliani** (Ch1) - Théorie du cycle de vie (1954, avec Brumberg)
11. **Milton Friedman** (Ch1, 3) - Revenu permanent (1957), anticipations adaptatives
12. **Edgar Brown** (Ch1) - Effet d'inertie de la consommation (1952)
13. **Simon Kuznets** (Ch1) - Études empiriques sur les séries longues (1946)

### **Autres**
14. **Ernest Engel** (Ch1) - Lois d'Engel (1857) sur structure de consommation
15. **John Maurice Clark** (Ch2) - Accélérateur simple (1917)
16. **Jan Tinbergen** (Ch2) - Études empiriques sur l'investissement
17. **James Tobin** (Ch2) - Ratio q de Tobin (1969)
18. **John Hicks** & **Alvin Hansen** (Ch4) - Modèle ISLM (synthèse keynésienne)
19. **Trygve Haavelmo** (Ch4) - Théorème d'équilibre budgétaire
20. **Léon Koyck** (Ch2) - Modèle d'ajustement avec retards distribués (λ)
21. **Jean Bodin** (Ch3) - Controverse sur afflux de métaux précieux et inflation

---

## 🏗️ Plan Hiérarchique Suggéré

**Structure cohérente basée sur l'analyse des 14 fichiers :**

```
MACROÉCONOMIE S1
│
├── PARTIE 0 : INTRODUCTION ET OUTILS
│   ├── 0.1 Qu'est-ce que la macroéconomie ?
│   │   ├── Définition (phénomènes globaux)
│   │   ├── Fonctions de l'État (affectation, redistribution, stabilisation)
│   │   └── Agrégats économiques
│   ├── 0.2 Méthodologie
│   │   ├── Types de modèles (littéraire, mathématique, graphique)
│   │   ├── Statique vs dynamique
│   │   └── Statique comparative
│   ├── 0.3 Circuit économique
│   │   ├── Emplois-Ressources
│   │   ├── Agents (ménages, entreprises, État, RdM)
│   │   └── Équilibre comptable Y + M = C + I + G + X
│   └── 0.4 Grandeurs macroéconomiques
│       ├── PIB (nominal, réel, déflateur)
│       ├── Taux de chômage (BIT, INSEE)
│       └── Inflation (IPC, origines)
│
├── PARTIE 1 : LES COMPOSANTES DE LA DEMANDE GLOBALE
│   │
│   ├── CHAPITRE 1 : LA CONSOMMATION
│   │   ├── 1.1 Structure et revenu disponible
│   │   │   ├── Définitions (marchande, non-marchande)
│   │   │   ├── Revenu primaire et disponible
│   │   │   └── Nomenclatures et coefficients budgétaires
│   │   ├── 1.2 Fonction de consommation keynésienne
│   │   │   ├── Loi psychologique fondamentale
│   │   │   ├── C = C0 + cY (PMC, PmC)
│   │   │   ├── Épargne résiduelle
│   │   │   └── Multiplicateur keynésien k = 1/(1-c)
│   │   ├── 1.3 Développements post-keynésiens
│   │   │   ├── Revenu relatif (Duesenberry)
│   │   │   │   ├── Effet de cliquet
│   │   │   │   └── Effet de démonstration
│   │   │   └── Effet d'inertie (Brown)
│   │   ├── 1.4 Approches intertemporelles
│   │   │   ├── Théorie du cycle de vie (Modigliani)
│   │   │   │   ├── Lissage de la consommation
│   │   │   │   ├── Courbe en bosse du patrimoine
│   │   │   │   └── PMC = 1 sur la vie
│   │   │   └── Théorie du revenu permanent (Friedman)
│   │   │       ├── Y = Yp + Yt
│   │   │       ├── Anticipations adaptatives
│   │   │       └── Consommation fonction de Yp
│   │   └── 1.5 Déterminants de l'épargne
│   │       ├── Court terme (pouvoir d'achat, chômage, inflation, taux d'intérêt)
│   │       └── Long terme (vieillissement, retraites)
│   │
│   └── CHAPITRE 2 : L'INVESTISSEMENT
│       ├── 2.1 Définitions et composantes
│       │   ├── FBCF (Formation Brute de Capital Fixe)
│       │   ├── Investissement de remplacement vs net
│       │   └── Déterminants généraux
│       ├── 2.2 Principe de l'accélérateur
│       │   ├── Accélérateur simple (Clark)
│       │   │   ├── It = v·ΔYt
│       │   │   ├── Hypothèses (v constant, pas de capacités oisives)
│       │   │   └── Critiques théoriques et empiriques
│       │   └── Accélérateur flexible
│       │       ├── Dépréciation δ
│       │       ├── Vitesse d'ajustement λ
│       │       └── Effet d'inertie
│       ├── 2.3 Investissement et rentabilité
│       │   ├── Procédure de choix
│       │   │   ├── Anticipations et actualisation
│       │   │   └── Rendements futurs
│       │   ├── Critères de décision
│       │   │   ├── VAN (Valeur Actuelle Nette)
│       │   │   └── TRI (Taux de Rendement Interne)
│       │   └── Fonction d'investissement I = -ei + I0
│       └── 2.4 Financement et effet de levier
│           ├── Modalités (autofinancement, actions, dette)
│           ├── Effet de levier (P vs r)
│           └── Ratio q de Tobin
│
├── PARTIE 2 : LE MODÈLE CLASSIQUE
│   │
│   └── CHAPITRE 3 : MODÈLE NÉOCLASSIQUE ET THÉORIE QUANTITATIVE
│       ├── 3.1 Principes fondamentaux
│       │   ├── Loi de Say (l'offre crée sa demande)
│       │   ├── Dichotomie réel/monétaire
│       │   ├── Monnaie neutre (voile)
│       │   └── Plein emploi et chômage volontaire
│       ├── 3.2 Secteur réel
│       │   ├── Marché des biens et services
│       │   │   └── Loi des débouchés
│       │   ├── Marché du travail
│       │   │   ├── Demande de travail (MPL = W/P)
│       │   │   ├── Offre de travail (effet de substitution)
│       │   │   ├── Équilibre (W/P)*, N*, Y*
│       │   │   └── Fonction de production Y = f(N)
│       │   └── Marché des capitaux (fonds prêtables)
│       │       ├── Offre (épargne des ménages)
│       │       ├── Demande (investissement + déficit État)
│       │       └── Taux d'intérêt réel d'équilibre
│       ├── 3.3 Secteur monétaire
│       │   ├── Théorie quantitative de la monnaie
│       │   │   ├── Équation de Fisher (P·Y = M·v)
│       │   │   ├── Équation de Cambridge (M = k·P·Y)
│       │   │   └── Hypothèses (v constant, Y insensible à M)
│       │   └── Détermination du niveau général des prix
│       └── 3.4 Résolution globale du modèle
│           ├── Équilibres simultanés
│           └── Inefficacité des politiques économiques
│
└── PARTIE 3 : LE MODÈLE KEYNÉSIEN
    │
    └── CHAPITRE 4 : RÉVOLUTION KEYNÉSIENNE ET MODÈLE ISLM
        ├── 4.1 Généralités et rupture
        │   ├── Caractéristiques de l'analyse keynésienne
        │   ├── Économie monétaire de production
        │   ├── Sous-emploi durable possible
        │   └── Nécessité de l'intervention de l'État
        ├── 4.2 Critique de la vision classique
        │   ├── Invalidation de la loi des débouchés
        │   ├── Principe de la demande effective
        │   │   ├── Prix de l'offre globale (Z)
        │   │   ├── Prix de la demande globale (D)
        │   │   └── Point d'équilibre (demande effective)
        │   └── Remise en cause de la théorie quantitative
        ├── 4.3 Composantes de la demande globale
        │   ├── Fonction de consommation (C = C0 + cY)
        │   └── Fonction d'investissement (I = f(r))
        ├── 4.4 Équilibres et déséquilibres macroéconomiques
        │   ├── Modèle revenu-dépense
        │   │   ├── Y = C + I (équilibre en économie fermée)
        │   │   ├── Multiplicateur keynésien k = 1/(1-c)
        │   │   ├── Économie ouverte k = 1/(1-c+m)
        │   │   └── Multiplicateurs budgétaires
        │   │       ├── k_G = 1/(1-c)
        │   │       ├── k_T = -c/(1-c)
        │   │       └── Théorème de Haavelmo (k = 1)
        │   └── Préférence pour la liquidité
        │       ├── 3 motifs de demande de monnaie
        │       │   ├── Transaction L1(Y)
        │       │   ├── Précaution L1(Y)
        │       │   └── Spéculation L2(r)
        │       ├── Taux d'intérêt = prix de la liquidité
        │       └── Trappe à liquidité
        └── 4.5 Modèle ISLM
            ├── Courbe IS (équilibre marché des biens)
            │   ├── I(r) = S(Y)
            │   └── Décroissante
            ├── Courbe LM (équilibre marché de la monnaie)
            │   ├── L(Y,r) = M/P
            │   └── Croissante
            └── Équilibre global (Y*, r*)
                ├── Intersection IS-LM
                └── Abandon de la dichotomie
```

---

## 📊 Répartition par Type de Question

| Type | Nombre estimé | Fichiers principaux |
|------|--------------|-------------------|
| **QCM** | ~260 | BANQUE_v1, chap0-4, v2 |
| **QR (Questions-Réponses)** | ~300 | chap0-4 (cours brut) |
| **OpenQ** | ~20 | macro_chap1_openq_v1 |
| **DragMatch** | ~8 | DragMatch_v1 |

---

## 🎯 Recommandations pour la Structuration

### **1. Fichiers à fusionner**
- `Intro_v2.txt` + `macro_chap0_intro.txt` → **CH0_COMPLET.txt**
- `Consommation_v2.txt` + `macro_chap1_consommation.txt` + `macro_chap1_openq_v1.txt` → **CH1_COMPLET.txt**
- `Investissement_v2.txt` + `macro_chap2_investissement.txt` → **CH2_COMPLET.txt**
- `ModeleClassique_v2.txt` + `macro_chap3_modele_classique_reel.txt` + `macro_chap3_theorie_quantitative_monnaie.txt` → **CH3_COMPLET.txt**
- `macro_chap4_modele_keynesien.txt` → **CH4_COMPLET.txt**

### **2. Fichiers à nettoyer**
- `macro_unclassified.txt` : intégrer les 2 QCM dans CH1
- `BANQUE_QUESTIONS_MACRO_v1.txt` : conserver comme fichier de synthèse/révision

### **3. Fichiers à enrichir**
- **CH2 Investissement_v2.txt** : incomplet (seulement 6 QCM)
- **CH4** : manque QCM de type examen (uniquement 1 QCM dans BANQUE)

### **4. Questions manquantes**
- Politique monétaire détaillée (rôle BCE)
- Politique budgétaire (déficit, dette)
- Modèle Mundell-Fleming (économie ouverte avancée)
- Questions sur croissance à long terme (Solow, progrès technique)

---

## 📈 Statistiques Globales

**Total questions** : ~570

**Répartition par chapitre** :
- Ch0 Introduction : ~100 questions (17%)
- Ch1 Consommation : ~115 questions (20%)
- Ch2 Investissement : ~90 questions (16%)
- Ch3 Modèle classique : ~105 questions (18%)
- Ch4 Modèle keynésien : ~85 questions (15%)
- Banque synthèse : ~90 questions (16%)

**Densité de couverture** :
- ✅ **Excellente** : Ch0, Ch1, Ch2
- ✅ **Bonne** : Ch3, BANQUE
- ⚠️ **À enrichir** : Ch4 (manque QCM examen)

**Types de formules** :
- Définitions comptables : 12
- Fonctions comportementales : 18
- Multiplicateurs : 8
- Optimisation : 6
- **Total : ~44 formules clés**

---

## 🔍 Observations Finales

### **Points forts**
✅ Couverture complète du programme S1  
✅ Diversité des formats (QCM, QR, OpenQ, DragMatch)  
✅ Hiérarchie claire des chapitres (0-4)  
✅ Formules détaillées et contextualisées  
✅ Bonne représentation des auteurs classiques (Say, Smith, Ricardo)  
✅ Excellente couverture des théories keynésiennes  
✅ Tags @themes: cohérents et exploitables  

### **Points d'amélioration**
⚠️ Questions de type "examen réaliste" limitées (seulement fichiers v2)  
⚠️ Ch4 sous-représenté en QCM (1 seul)  
⚠️ Manque questions sur politique économique concrète  
⚠️ Absence de questions sur Mundell-Fleming (économie ouverte avancée)  
⚠️ Peu de questions de calcul numérique (VAN, multiplicateur)  
⚠️ Pas de questions sur croissance à long terme (Solow)  

---

**Date de création** : 30 novembre 2025  
**Fichiers analysés** : 14  
**Lignes totales** : ~2 960  
**Questions totales** : ~570  
**Auteurs cités** : 21  
**Formules inventoriées** : 44  

---

