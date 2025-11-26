# 🔍 AUDIT AUTOMATIQUE COMPLET - 120 Fichiers Questions

**Date**: 25/11/2025 15:13:42
**Script**: scripts/audit-complet.mjs

---

## 📊 RÉSUMÉ GLOBAL

| Métrique | Valeur |
|----------|--------|
| **Fichiers analysés** | 120 |
| **Questions totales** | 1805 |
| **Questions trompeuses** | 🔴 150 |
| **Questions ambiguës** | 🟡 14 |
| **Multi-concepts** | 🟡 0 |
| **Sans explication** | 🟢 26 |
| **Formats invalides** | 🔴 897 |

## 📚 RÉPARTITION PAR TYPE

| Type | Nombre | % |
|------|--------|---|
| **QCM** | 1428 | 79.1% |
| **VF** | 227 | 12.6% |
| **DragMatch** | 80 | 4.4% |
| **QR** | 65 | 3.6% |
| **OpenQ** | 5 | 0.3% |
| **Unknown** | 0 | 0.0% |

## 📁 STATISTIQUES PAR DOSSIER

| Dossier | Fichiers | Questions | Trompeuses | Ambiguës | Multi-concepts | Sans expl. |
|---------|----------|-----------|------------|----------|----------------|------------|
| **S2** | 52 | 1094 | 80 | 11 | 0 | 16 |
| **S1** | 54 | 501 | 63 | 2 | 0 | 5 |
| **HPE_Marx.txt** | 1 | 45 | 0 | 0 | 0 | 0 |
| **INST_QCM_Complet_v2.txt** | 1 | 40 | 1 | 1 | 0 | 1 |
| **HPE_Ricardo.txt** | 1 | 22 | 1 | 0 | 0 | 2 |
| **Examen_Macro_Fidele.txt** | 1 | 20 | 4 | 0 | 0 | 0 |
| **HPE_Smith.txt** | 1 | 19 | 1 | 0 | 0 | 2 |
| **CH1_Consommation_EXP_v2.txt** | 1 | 17 | 0 | 0 | 0 | 0 |
| **macroCH1.txt** | 1 | 17 | 0 | 0 | 0 | 0 |
| **MacroCH2.txt** | 1 | 14 | 0 | 0 | 0 | 0 |
| **TEST_PLAN** | 4 | 8 | 0 | 0 | 0 | 0 |
| **test_openq.txt** | 1 | 5 | 0 | 0 | 0 | 0 |
| **test_dragmatch.txt** | 1 | 3 | 0 | 0 | 0 | 0 |

## 🔴 QUESTIONS TROMPEUSES (150)

| Fichier | Ligne | Type | Question | Raison |
|---------|-------|------|----------|--------|
| `Examen_Macro_Fidele.txt` | 3 | QCM | Le PIB nominal est de 1500 unités l’année n, l’inflation sur l’année n est de 50% le PIB réel est ? | Calcul multi-étapes ou piège arithmétique |
| `Examen_Macro_Fidele.txt` | 11 | QCM | Dans une économie nationale la PMC s’établit respectivement à 0,50 et 0,80 le revenu national passe  | Calcul multi-étapes ou piège arithmétique |
| `Examen_Macro_Fidele.txt` | 27 | QCM | Un phénomène qui augmente de 30% la première année et qui augmente de 30% la deuxième année et baiss | Calcul multi-étapes ou piège arithmétique |
| `Examen_Macro_Fidele.txt` | 35 | QCM | Soit une économie fermée dans une optique keynésienne nous avons Co =100 milliards d’euros, c=0,75 e | Calcul multi-étapes ou piège arithmétique |
| `HPE_Ricardo.txt` | 25 | QCM | Supposons qu’un bien nécessite 1h de travail pour être produit. L’heure de travail vaut 15€. Ce bien | Calcul multi-étapes ou piège arithmétique |
| `HPE_Smith.txt` | 25 | QCM | Supposons qu’un bien nécessite 1h de travail pour être produit. L’heure de travail vaut 15€. Ce bien | Calcul multi-étapes ou piège arithmétique |
| `INST_QCM_Complet_v2.txt` | 4 | QCM | Gouvernance moderne (vision Banque mondiale années 1990) met l’accent surtout sur… | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\BANQUE_QUESTIONS_MACRO_v1.txt` | 35 | QCM | Yp = (1-λ)(Yt + λYt-1 + λ²Yt-2 + ...) montre que | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\BANQUE_QUESTIONS_MACRO_v1.txt` | 86 | QCM | Si C0 = 100, c = 0,75 et I0 = 50, le revenu d'équilibre Y* vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\BANQUE_QUESTIONS_MACRO_v1.txt` | 88 | QCM | Si le PIB passe de 1000 à 1100 et v = 2, l'investissement induit vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 6 | QCM | Éco fermée : C0=100, c=0,75, I0=10. Revenu d’équilibre ? | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 7 | QCM | Dans une économie, la PMC vaut 0,50 à Y=100 et 0,80 à Y=200. La PmC entre 100 et 200 est : | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 12 | VF | C = C0 + c·Y (sans impôts), 0 < c < 1. | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 13 | VF | S = Y − C = −C0 + (1−c)·Y ; PmE = 1 − c. | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 21 | QCM | (multi) Dans C = C0 + cY, une hausse simultanée de C0 de 5 et d’I de 5 : | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Consommation_v2.txt` | 22 | QCM | (multi) Si c passe de 0,6 à 0,8, alors : | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Intro_v2.txt` | 2 | QCM | Le PIB nominal est 1500 et l’inflation annuelle est 50 %. Quel est le PIB réel ? | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Intro_v2.txt` | 14 | QCM | Si l’indice des prix passe de 120 à 132, l’inflation est : | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Intro_v2.txt` | 15 | QCM | Enchaînement de variations : +10 % puis −10 %. Le niveau final par rapport à 100 est : | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Intro_v2.txt` | 25 | QCM | Un phénomène qui ↑ 30 % (an 1), ↑ 30 % (an 2), puis ↓ 30 % (an 3) : augmentation totale ? | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\Investissement_v2.txt` | 12 | VF | Accélérateur flexible : Kt = (1−δ)Kt−1 + It ; inertie (It−1). | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\macro_chap2_investissement.txt` | 745 | QCM | Si le PIB passe de 1000 à 1100 et v = 2, l'investissement induit vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\macro_unclassified.txt` | 1 | QCM | Yp = (1-λ)(Yt + λYt-1 + λ²Yt-2 + ...) montre que | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\macro_unclassified.txt` | 2 | QCM | Si C0 = 100, c = 0,75 et I0 = 50, le revenu d'équilibre Y* vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\MACRO\ModeleClassique_v2.txt` | 11 | QCM | (calcul) Avec P=2, W=40, MPL(N*)=20, le salaire réel vaut et la condition d’optimum est : | Calcul multi-étapes ou piège arithmétique |
| `S1\RIAE\PROMPTS\riae_generation_prompt.txt` | 45 | QR | Élasticité simple: le prix augmente de 10% et la quantité diminue de 5%. L'élasticité prix de la dem | Calcul multi-étapes ou piège arithmétique |
| `S1\RIAE\PROMPTS\riae_generation_prompt.txt` | 49 | QR | Demande Qd=100−2P, Offre Qs=−10+3P. Trouver P*,Q* | Calcul multi-étapes ou piège arithmétique |
| `S1\RIAE\riae_hpe_qcm_part0_methodo.txt` | 8 | QCM | Les « trois approches » proposées pour lire l'HPE (Potier, 2008) sont | Calcul multi-étapes ou piège arithmétique |
| `S1\RIAE\riae_hpe_qcm_part1.txt` | 31 | QCM | Montchrétien (1615) est associé à | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\Partiels\stats_partiels_2023_2_qcm.txt` | 11 | QCM | Fréquence d’une classe « 60 à 70% » notée f_{60-70} se calcule comme | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\Partiels\stats_partiels_2024_2_qcm.txt` | 5 | QCM | Série en pourcentage par classes [30;40[, [40;50[, …: graphique adapté | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap1_banque_difficile.txt` | 7 | QR | On mesure la satisfaction (1 à 5) dans 3 strates: A(40 pers, moyenne 3), B(30 pers, moyenne 4), C(30 | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap1_banque_difficile.txt` | 8 | QR | Dans une enquête, 120 réponses sur 200 envois; 30 réponses sont inexploitables. Le taux de réponses  | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap1_banque_difficile.txt` | 9 | QR | On code une variable ordinale (Très faible=1,...,Très élevé=5). On calcule une moyenne 3,7. Cette op | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap1_banque_moyen.txt` | 8 | QR | On relève les notes {8, 12, 12, 16}. La moyenne vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap1_banque_moyen.txt` | 9 | QR | Sur 40 individus, 12 sont de modalité A, 8 de modalité B, le reste C. La fréquence de C est | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_difficile.txt` | 7 | QR | Histogramme: classes [0;5[, [5;15[, [15;20[, effectifs 5, 10, 5. Donne les hauteurs (densités) h1,h2 | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_difficile.txt` | 8 | QR | On a 80 observations réparties en 4 catégories A,B,C,D avec parts 0,25; 0,35; 0,15; 0,25. Donne les  | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_difficile.txt` | 9 | QR | Un graphique tronqué démarre Y à 50 au lieu de 0 pour comparer deux séries 52 et 54. Quel est le ris | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_moyen.txt` | 5 | VF | Un diagramme en secteurs (camembert) convient bien à des parts de marché totales à 100% | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_moyen.txt` | 7 | QR | On observe 25 réponses: \nA=10, B=5, C=10. La part de A en % (arrondie) vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap2_banque_moyen.txt` | 8 | QR | Pour tracer un histogramme avec classes [0;5[, [5;15[, [15;20[, effectifs 5, 10, 5, les largeurs son | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_difficile.txt` | 7 | QR | Série pondérée: valeurs 10, 20, 30 avec poids 1, 2, 3. La moyenne pondérée vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_difficile.txt` | 8 | QR | Deux croissances successives +20% puis +25% vers 100. La valeur finale vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_difficile.txt` | 9 | QR | Vitesse aller 60 km/h, retour 40 km/h (même distance). La vitesse moyenne vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_moyen.txt` | 7 | QR | Série: 2, 4, 6, 8. La moyenne arithmétique vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_moyen.txt` | 8 | QR | Série ordonnée: 1, 2, 3, 10. La médiane vaut | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap3_banque_moyen.txt` | 9 | QR | Une croissance de +10% puis -10% sur 100 donne | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap4_banque_difficile.txt` | 7 | QR | Série: 1, 1, 2, 3, 9. Calcule: moyenne, variance (population), CV (en %) | Calcul multi-étapes ou piège arithmétique |
| `S1\STATS\stats_chap4_banque_difficile.txt` | 8 | QR | Deux séries A(μ=50, σ=5) et B(μ=100, σ=8). Lequel a la dispersion relative la plus forte ? | Calcul multi-étapes ou piège arithmétique |

*... et 100 autres.*

## 🟡 QUESTIONS AMBIGUËS (14)

| Fichier | Ligne | Type | Question | Raison |
|---------|-------|------|----------|--------|
| `INST_QCM_Complet_v2.txt` | 38 | QCM | Laquelle est fausse ? (institutions/organisations) | Formulation ambiguë (négation, "laquelle est fausse") |
| `S1\MACRO\Intro_v2.txt` | 20 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S1\MACRO\Investissement_v2.txt` | 20 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\HPE\HPE_Consommation_v2.txt` | 15 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\HPE\HPE_Friedman_v2.txt` | 18 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\HPE\HPE_InfoImparfaite_v2.txt` | 17 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\HPE\HPE_Keynes_v2.txt` | 19 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\HPE\HPE_NouveauxKeynesiens_v2.txt` | 17 | QCM | Laquelle est fausse ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_Asymetrie_Signaux_v1.txt` | 7 | QCM | Piège : laquelle est FAUSSE ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_Comptabilite_IFRS_v1.txt` | 8 | QCM | Piège : laquelle est FAUSSE ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_CoutsTransaction_v1.txt` | 6 | QCM | Piège : laquelle est FAUSSE ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_Definitions_Gouvernance_v1.txt` | 5 | QCM | Confusion fréquente : laquelle est FAUSSE ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_OMC_FMI_BM_v1.txt` | 8 | QCM | Piège : laquelle est FAUSSE ? | Formulation ambiguë (négation, "laquelle est fausse") |
| `S2\INSTIT\TRAIN_Pieges_Comparatifs_v1.txt` | 1 | QCM | Laquelle est FAUSSE ? (institutions/organisations) | Formulation ambiguë (négation, "laquelle est fausse") |

## 🟡 MULTI-CONCEPTS (0)

✅ Principe "1 notion = 1 question" respecté.

## 🔴 FORMATS INVALIDES (897)

| Fichier | Ligne | Type | Attendu | Actuel |
|---------|-------|------|---------|--------|
| `HPE_Marx.txt` | 1 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 2 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 3 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 4 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 5 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 6 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 7 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 8 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 9 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 10 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 26 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 27 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 28 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 29 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 30 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 31 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 32 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 33 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 34 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 35 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 36 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 37 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 38 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 39 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 40 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 41 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 42 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 43 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 44 | QCM | 4 cols | 3 cols |
| `HPE_Marx.txt` | 45 | QCM | 4 cols | 3 cols |

*... et 867 autres.*

## 💡 RECOMMANDATIONS

### 🔴 Priorité HAUTE: Questions trompeuses (150)
- Découper calculs multi-étapes en séquences (3 questions simples)
- Ajouter question concept AVANT calcul (ex: "Comment déflater un PIB ?")
- Éviter pièges arithmétiques non pédagogiques

### 🟡 Priorité MOYENNE: Questions ambiguës (14)
- Remplacer "Laquelle est fausse ?" par VF séquentiels
- Reformuler doubles négations en affirmations positives
- Privilégier questions directes

---

**Prochain audit**: Après corrections, relancer `npm run audit:questions`
