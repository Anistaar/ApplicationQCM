# 📊 EXEMPLE DE STRUCTURE INTERACTIVE - MACROÉCONOMIE

## 🎨 Interface Visuelle

```
┌─────────────────────────────────────────────────────────┐
│  📊 MACROÉCONOMIE                        [1210 questions]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎯 Filtres Rapides                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Facile   │ │ Moyen    │ │ Difficile│ │ Expert   │   │
│  │   340q   │ │   520q   │ │   250q   │ │   100q   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ QCM      │ │ QR       │ │ OpenQ    │                │
│  │   600q   │ │   550q   │ │   60q    │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  📚 Plan du Cours (Cliquer pour sélectionner)           │
│                                                          │
│  ▼ Chapitre 0 : Introduction à la Macro       [121 q]   │
│     ├─ Définitions                            [45 q]    │
│     ├─ Agrégats économiques                   [38 q]    │
│     ├─ Théories (Keynes, Classiques)          [28 q]    │
│     └─ Politique économique                   [10 q]    │
│                                                          │
│  ▼ Chapitre 1 : La Consommation              [192 q]    │
│     ├─ Définitions & Concepts                 [55 q]    │
│     │   ├─ Revenu disponible                  [15 q]    │
│     │   ├─ Propensions                        [20 q]    │
│     │   └─ Épargne                             [20 q]    │
│     ├─ Fonction de consommation keynésienne   [65 q]    │
│     │   ├─ Équation C = c0 + c1*Yd            [30 q]    │
│     │   ├─ Multiplicateur keynésien           [25 q]    │
│     │   └─ Applications numériques            [10 q]    │
│     ├─ Théorie du revenu permanent (Friedman) [42 q]    │
│     └─ Théorie du cycle de vie (Modigliani)   [30 q]    │
│                                                          │
│  ▼ Chapitre 2 : L'Investissement             [274 q]    │
│     ├─ Définitions                            [40 q]    │
│     ├─ Déterminants de l'investissement      [85 q]    │
│     │   ├─ Taux d'intérêt                     [30 q]    │
│     │   ├─ Profit anticipé                    [30 q]    │
│     │   └─ Accélérateur                       [25 q]    │
│     ├─ Modèle néoclassique (q de Tobin)      [74 q]    │
│     └─ Investissement public vs privé         [75 q]    │
│                                                          │
│  ▼ Chapitre 3 : Modèle Classique             [147 q]    │
│     ├─ Loi de Say                             [35 q]    │
│     ├─ Équilibre de plein emploi              [52 q]    │
│     ├─ Flexibilité des prix                   [40 q]    │
│     └─ Critique keynésienne                   [20 q]    │
│                                                          │
│  ▼ Chapitre 4 : Modèle Keynésien & IS-LM    [476 q]    │
│     ├─ Demande globale                        [68 q]    │
│     ├─ Courbe IS (Marché des biens)          [125 q]    │
│     │   ├─ Équation IS                        [45 q]    │
│     │   ├─ Déplacement IS                     [40 q]    │
│     │   └─ Politique budgétaire               [40 q]    │
│     ├─ Courbe LM (Marché monétaire)          [135 q]    │
│     │   ├─ Demande de monnaie                 [50 q]    │
│     │   ├─ Offre de monnaie                   [45 q]    │
│     │   └─ Politique monétaire                [40 q]    │
│     ├─ Équilibre IS-LM                        [98 q]    │
│     └─ Politiques économiques mixtes          [50 q]    │
│                                                          │
│  🎓 Thèmes Experts                                       │
│     ├─ Modèles avancés                        [45 q]    │
│     ├─ Controverses théoriques                [32 q]    │
│     └─ Applications empiriques                [23 q]    │
│                                                          │
│  👥 Par Auteur                                           │
│     ├─ Keynes (Demande globale, IS-LM)       [285 q]    │
│     ├─ Friedman (Revenu permanent)           [68 q]     │
│     ├─ Modigliani (Cycle de vie)             [52 q]     │
│     ├─ Tobin (q de Tobin)                    [48 q]     │
│     └─ Classiques (Say, Ricardo)             [95 q]     │
│                                                          │
│  📐 Par Type de Contenu                                  │
│     ├─ Définitions                            [245 q]    │
│     ├─ Formules & Calculs                    [380 q]    │
│     ├─ Graphiques                             [185 q]    │
│     ├─ Théories & Modèles                    [280 q]    │
│     └─ Applications pratiques                 [120 q]    │
│                                                          │
└─────────────────────────────────────────────────────────┘

🎯 SÉLECTION ACTUELLE : 
┌──────────────────────────────────────────────────────┐
│ ✓ Chapitre 1 : Consommation (192q)                  │
│ ✓ Formules & Calculs                                │
│ ✓ Difficulté : Moyen                                │
│                                                      │
│ → 85 questions correspondent à vos critères         │
│                                                      │
│ [🚀 Lancer le QCM]  [🔄 Réinitialiser filtres]      │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 FONCTIONNEMENT

### 1. Structure de données

```javascript
const MACRO_STRUCTURE = {
  subject: "MACRO",
  name: "Macroéconomie",
  totalQuestions: 1210,
  
  chapters: [
    {
      id: "chap0",
      name: "Introduction à la Macro",
      expanded: false,
      questionCount: 121,
      themes: [
        { id: "chap0_def", name: "Définitions", count: 45 },
        { id: "chap0_agregats", name: "Agrégats économiques", count: 38 },
        { id: "chap0_theories", name: "Théories", count: 28 },
        { id: "chap0_politique", name: "Politique économique", count: 10 }
      ]
    },
    {
      id: "chap1",
      name: "La Consommation",
      expanded: false,
      questionCount: 192,
      themes: [
        {
          id: "chap1_def",
          name: "Définitions & Concepts",
          count: 55,
          subthemes: [
            { id: "revenu_dispo", name: "Revenu disponible", count: 15 },
            { id: "propensions", name: "Propensions", count: 20 },
            { id: "epargne", name: "Épargne", count: 20 }
          ]
        },
        {
          id: "chap1_keynes",
          name: "Fonction keynésienne",
          count: 65,
          subthemes: [
            { id: "equation_conso", name: "Équation C = c0 + c1*Yd", count: 30 },
            { id: "multiplicateur", name: "Multiplicateur", count: 25 },
            { id: "appli_num", name: "Applications numériques", count: 10 }
          ]
        },
        {
          id: "chap1_friedman",
          name: "Revenu permanent (Friedman)",
          count: 42
        },
        {
          id: "chap1_modigliani",
          name: "Cycle de vie (Modigliani)",
          count: 30
        }
      ]
    }
    // ... autres chapitres
  ],
  
  authors: [
    { id: "keynes", name: "Keynes", tags: ["Keynes", "Keynésien"], count: 285 },
    { id: "friedman", name: "Friedman", tags: ["Friedman"], count: 68 },
    { id: "modigliani", name: "Modigliani", tags: ["Modigliani"], count: 52 },
    { id: "tobin", name: "Tobin", tags: ["Tobin"], count: 48 },
    { id: "classiques", name: "Classiques", tags: ["Classique", "Say"], count: 95 }
  ],
  
  contentTypes: [
    { id: "definitions", name: "Définitions", tags: ["Definitions"], count: 245 },
    { id: "formules", name: "Formules & Calculs", tags: ["Formules", "Equations"], count: 380 },
    { id: "graphiques", name: "Graphiques", tags: ["Graphiques"], count: 185 },
    { id: "theories", name: "Théories & Modèles", tags: ["Theories", "Modeles"], count: 280 },
    { id: "pratique", name: "Applications pratiques", tags: ["Applications"], count: 120 }
  ],
  
  difficulties: [
    { id: "facile", name: "Facile", count: 340 },
    { id: "moyen", name: "Moyen", count: 520 },
    { id: "difficile", name: "Difficile", count: 250 },
    { id: "expert", name: "Expert", count: 100 }
  ],
  
  questionTypes: [
    { id: "qcm", name: "QCM", count: 600 },
    { id: "qr", name: "QR", count: 550 },
    { id: "openq", name: "OpenQ", count: 60 }
  ]
};
```

### 2. Système de filtrage

```javascript
// État des filtres sélectionnés
const selectedFilters = {
  chapters: ["chap1"],           // Chapitre 1
  themes: ["chap1_keynes"],      // Fonction keynésienne
  contentTypes: ["formules"],    // Formules uniquement
  difficulties: ["moyen"],       // Difficulté moyenne
  questionTypes: [],             // Tous types
  authors: []                    // Tous auteurs
};

// Filtrage des questions
const filteredQuestions = allQuestions.filter(q => {
  // Filtrer par tags qui matchent les sélections
  const matchChapter = selectedFilters.chapters.length === 0 || 
    q.themes.some(t => selectedFilters.chapters.includes(extractChapter(t)));
  
  const matchDifficulty = selectedFilters.difficulties.length === 0 ||
    selectedFilters.difficulties.includes(q.difficulty.toLowerCase());
  
  const matchType = selectedFilters.questionTypes.length === 0 ||
    selectedFilters.questionTypes.includes(q.question.type.toLowerCase());
  
  return matchChapter && matchDifficulty && matchType;
});

// Résultat : 85 questions correspondent
```

### 3. Interface interactive

**Interactions :**
- ✅ **Clic sur un chapitre** → Expand/Collapse
- ✅ **Clic sur un thème** → Toggle sélection (badge bleu)
- ✅ **Clic sur difficulté** → Toggle filtre
- ✅ **Compteur en temps réel** → "X questions correspondent"
- ✅ **Bouton "Lancer QCM"** → Démarre avec les questions filtrées

---

## 🎨 DESIGN VISUEL

### Badges de sélection

```css
/* Non sélectionné */
.filter-tag {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  color: #64748b;
}

/* Sélectionné */
.filter-tag.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  color: white;
  font-weight: 600;
}

/* Hover */
.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

### Arborescence

```css
/* Chapitre */
.chapter-item {
  padding: 1rem;
  background: white;
  border-left: 4px solid #667eea;
  margin: 0.5rem 0;
  cursor: pointer;
}

.chapter-item.expanded {
  border-left-color: #764ba2;
  background: #f8fafc;
}

/* Thème (niveau 2) */
.theme-item {
  padding: 0.75rem 2rem;
  margin-left: 2rem;
  border-left: 2px solid #cbd5e1;
}

/* Sous-thème (niveau 3) */
.subtheme-item {
  padding: 0.5rem 3rem;
  margin-left: 4rem;
  font-size: 0.9rem;
  color: #64748b;
}
```

---

## 📊 EXEMPLE D'UTILISATION

### Scénario 1 : "Je veux réviser les formules de consommation (niveau moyen)"

1. Utilisateur clique sur **"Chapitre 1 : Consommation"** → Expand
2. Clique sur **"Fonction keynésienne"** → Badge bleu
3. Clique sur filtre **"Formules & Calculs"** → Badge bleu
4. Clique sur difficulté **"Moyen"** → Badge bleu
5. Compteur affiche : **"32 questions correspondent"**
6. Clique sur **"🚀 Lancer le QCM"**
7. → Démarre un QCM avec 32 questions de formules keynésiennes niveau moyen

### Scénario 2 : "Je veux tout réviser sur Keynes"

1. Utilisateur clique sur onglet **"Par Auteur"**
2. Clique sur **"Keynes (285q)"** → Badge bleu
3. Compteur : **"285 questions correspondent"**
4. Clique sur **"🚀 Lancer le QCM"**
5. → Démarre avec toutes les questions liées à Keynes

### Scénario 3 : "Je veux seulement les définitions faciles"

1. Clique sur **"Définitions (245q)"** dans "Par Type"
2. Clique sur **"Facile"** dans filtres
3. Compteur : **"78 questions correspondent"**
4. Lance le QCM

---

## 🚀 VALIDATION DEMANDÉE

**Avant d'implémenter, confirmez :**

1. ✅ **Structure hiérarchique** : Chapitres → Thèmes → Sous-thèmes OK ?
2. ✅ **Filtres multiples** : Difficulté + Type contenu + Auteurs OK ?
3. ✅ **Compteur temps réel** : Afficher "X questions correspondent" OK ?
4. ✅ **Design** : Badges cliquables + arborescence expandable OK ?
5. ✅ **Exemple MACRO** : Structure proposée est complète ?

**Questions :**
- Voulez-vous aussi un filtre **"Déjà réussies"** / **"À réviser"** ?
- Faut-il sauvegarder les **filtres favoris** ?
- Voulez-vous un bouton **"Mode découverte"** (questions jamais vues) ?

**Une fois validé, je lance l'implémentation complète ! 🎯**
