# Système de Codification des IDs

## 📋 Principe

Codes **courts et systématiques** pour éviter de se perdre lors de la création des structures JSON.

---

## 🎯 Matières (Préfixe)

| Matière | Code | Exemple |
|---------|------|---------|
| **Macroéconomie** | `M` | M1, M2, M3... |
| **Institutions** | `I` | I1, I2, I3... |
| **Statistiques** | `S` | S1, S2, S3... |
| **Test** | `T` | T1, T2, T3... |

---

## 📚 Hiérarchie (Chapitres)

### Format: `[Matière][Numéro]`

**Exemples**:
- `M1` = MACRO Chapitre 1 (Consommation)
- `M2` = MACRO Chapitre 2 (Investissement)
- `M3` = MACRO Chapitre 3 (Modèle classique)
- `I1` = INSTIT Thème 1 (FMI)
- `S1` = STATS Chapitre 1 (Collecte)

---

## 📖 Sections

### Format: `[Chapitre]-[Chiffre Romain]`

**Exemples**:
- `M1-I` = MACRO Chap1, Section I
- `M1-II` = MACRO Chap1, Section II
- `M2-I` = MACRO Chap2, Section I
- `S1-I` = STATS Chap1, Section I

---

## 📝 Sous-Sections

### Format: `[Section]-[Numéro]`

**Exemples**:
- `M1-I-1` = MACRO Chap1, Section I, Sous-section 1
- `M1-I-2` = MACRO Chap1, Section I, Sous-section 2
- `M1-II-1` = MACRO Chap1, Section II, Sous-section 1
- `S2-I-3` = STATS Chap2, Section I, Sous-section 3

---

## 💡 Notions (Niveau Granulaire)

### Format: `[Sous-Section][Lettre]`

**Exemples**:
- `M1-I-1a` = MACRO Chap1, Section I, Sous-section 1, Notion a
- `M1-I-1b` = MACRO Chap1, Section I, Sous-section 1, Notion b
- `M1-I-2a` = MACRO Chap1, Section I, Sous-section 2, Notion a
- `M1-II-3a` = MACRO Chap1, Section II, Sous-section 3, Notion a
- `S1-I-2c` = STATS Chap1, Section I, Sous-section 2, Notion c

**Lettres**: a, b, c, d, e... (ordre dans la sous-section)

---

## 🔗 Cross-Cutting

### Formules: `F-[nom-court]`

**Exemples**:
- `F-conso` = Fonction de consommation (C = C0 + cY)
- `F-pmc` = PMC et PME
- `F-mult` = Multiplicateur keynésien
- `F-van` = Valeur Actuelle Nette
- `F-tri` = Taux de Rendement Interne
- `F-fisher` = Équation de Fisher
- `F-moyenne` = Moyenne arithmétique (STATS)
- `F-variance` = Variance (STATS)

### Auteurs: `A-[nom]`

**Exemples**:
- `A-keynes` = John Maynard Keynes
- `A-friedman` = Milton Friedman
- `A-modigliani` = Franco Modigliani
- `A-say` = Jean-Baptiste Say
- `A-fisher` = Irving Fisher
- `A-coase` = Ronald Coase (INSTIT)
- `A-north` = Douglass North (INSTIT)

### Organisations: `O-[sigle]`

**Exemples** (INSTIT uniquement):
- `O-fmi` = Fonds Monétaire International
- `O-omc` = Organisation Mondiale du Commerce
- `O-bm` = Banque Mondiale
- `O-bce` = Banque Centrale Européenne
- `O-insee` = Institut National de la Statistique
- `O-eurostat` = Office statistique de l'UE
- `O-ined` = Institut National d'Études Démographiques

---

## 📊 Exemples Complets

### MACRO Chapitre 1 (Consommation)

```
M1                          Chapitre 1
├─ M1-I                     Section I (Théorie keynésienne)
│  ├─ M1-I-1                Sous-section 1 (Fonction conso)
│  │  ├─ M1-I-1a            Notion: Fonction conso keynésienne
│  │  └─ M1-I-1b            Notion: Consommation autonome
│  ├─ M1-I-2                Sous-section 2 (Propensions)
│  │  ├─ M1-I-2a            Notion: PMC
│  │  ├─ M1-I-2b            Notion: PME
│  │  └─ M1-I-2c            Notion: Multiplicateur
│  └─ M1-I-3                Sous-section 3 (Loi psycho)
│     ├─ M1-I-3a            Notion: Loi psychologique
│     └─ M1-I-3b            Notion: Épargne résidu
└─ M1-II                    Section II (Théories alternatives)
   ├─ M1-II-1               Sous-section 1 (Revenu relatif)
   │  └─ M1-II-1a           Notion: Revenu relatif
   ├─ M1-II-2               Sous-section 2 (Cycle de vie)
   │  └─ M1-II-2a           Notion: Cycle de vie
   └─ M1-II-3               Sous-section 3 (Revenu permanent)
      └─ M1-II-3a           Notion: Revenu permanent

Cross-Cutting:
├─ F-conso                  Formule: C = C0 + cY
├─ F-pmc                    Formule: PMC + PME = 1
├─ F-mult                   Formule: k = 1/(1-c)
├─ A-keynes                 Auteur: Keynes
├─ A-modigliani             Auteur: Modigliani
├─ A-friedman               Auteur: Friedman
├─ A-duesenberry            Auteur: Duesenberry
└─ A-brown                  Auteur: Brown
```

### STATS Chapitre 2 (Graphiques)

```
S2                          Chapitre 2
├─ S2-I                     Section I
│  ├─ S2-I-1                Sous-section 1
│  │  ├─ S2-I-1a            Notion a
│  │  └─ S2-I-1b            Notion b
│  └─ S2-I-2                Sous-section 2
│     └─ S2-I-2a            Notion a
└─ S2-II                    Section II
   └─ S2-II-1               Sous-section 1
      └─ S2-II-1a           Notion a

Cross-Cutting:
├─ F-histogramme            Formule histogramme
└─ F-ogive                  Formule courbe cumulative
```

### INSTIT Thème 1 (FMI)

```
I1                          Thème 1 (FMI)
├─ I1-I                     Section I (Histoire)
│  └─ I1-I-1                Sous-section 1
│     ├─ I1-I-1a            Notion: Bretton Woods
│     └─ I1-I-1b            Notion: Création 1944
└─ I1-II                    Section II (Missions)
   └─ I1-II-1               Sous-section 1
      └─ I1-II-1a           Notion: Stabilité monétaire

Cross-Cutting:
├─ O-fmi                    Organisation: FMI
├─ A-keynes                 Auteur: Keynes (fondateur)
└─ A-white                  Auteur: Harry Dexter White
```

---

## ✅ Avantages

1. **Court**: `M1-I-2a` vs `chap1.I.2.pmc` (-40% caractères)
2. **Systématique**: Facile à générer automatiquement
3. **Hiérarchique**: Structure visible dans l'ID
4. **Unique**: Pas de collision possible
5. **Scannable**: Facile à lire et retrouver
6. **Multilingue**: Pas de mots français/anglais mélangés

---

## 🔄 Migration

Pour les 4 chapitres restants de MACRO:
- M0 (Introduction)
- M2 (Investissement)
- M3 (Modèle classique)
- M4 (Modèle keynésien)

Et les autres matières:
- I1-I7 (INSTIT)
- S1-S4 (STATS)
- T1-T5 (TEST)

---

## 📝 Convention Naming

**IDs**: TOUJOURS en majuscules avec tirets
- ✅ `M1-I-2a`
- ❌ `m1-i-2a`
- ❌ `M1.I.2.a`

**Cross-cutting préfixes**:
- `F-` pour Formules
- `A-` pour Auteurs
- `O-` pour Organisations

---

**Date de création**: 30 novembre 2025  
**Version**: 1.0
