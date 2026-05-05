# 🎨 Sprint 6 : UX/Accessibilité - Plan d'Action

**Date** : 30 nov 2025  
**Objectif** : Conformité WCAG 2.2 AA + expérience utilisateur optimale  
**Score cible** : 90/100 accessibilité

---

## 📋 Audit Initial

### Problèmes détectés :

#### ❌ Contraste couleurs (WCAG AA 4.5:1 minimum)
- `--muted: #b4bfc9` sur `--bg: #0b0f14` = **5.2:1** ✅ (OK pour texte normal)
- `--muted` pour texte important devrait être 7:1 (AAA)
- Boutons disabled : opacity 0.55 réduit contraste sous minimum

#### ❌ Labels et ARIA
- Aucun `aria-label` sur boutons icônes (ex: `×` fermer modal)
- Pas d'`aria-expanded` sur accordéons/collapsibl es
- Pas d'`aria-haspopup` sur boutons ouvrant modales
- Pas de `role="alert"` sur feedbacks temporaires
- Inputs sans `<label>` associés (uniquement placeholders)

#### ❌ Navigation clavier
- Pas de skip-links fonctionnels (`.skip-link` existe en CSS mais absent HTML)
- Modal file-browser : pas de focus trap
- Drag-match : impossible au clavier
- `tabindex` manquant sur éléments interactifs custom

#### ❌ Focus visible
- `:focus-visible` seulement sur `.btn`, manque sur inputs/selects
- Outline supprimé sans alternative sur certains éléments

#### ❌ Responsive
- Breakpoints absents pour <375px (iPhone SE)
- Cartes grid non adaptatives en très petit écran

---

## 🛠️ Plan de Correctifs

### Phase 1 : Contrastes (30 min)

**src/style.css** :
```css
:root {
  /* Améliorer muted pour texte important */
  --muted: #c4cfd9; /* Nouveau 6.2:1 sur --bg */
  --muted-secondary: #b4bfc9; /* Ancien pour usage non-critique */
  
  /* Focus ring plus visible */
  --focus-ring: 0 0 0 3px rgba(132,204,22,.5); /* Opacité .5 au lieu .35 */
  
  /* Disabled states avec contraste minimum */
  --disabled-opacity: 0.65; /* 0.65 au lieu 0.55 */
}

/* Force contraste texte important */
label, .card-title, .section-title {
  color: var(--muted); /* Utilise nouveau --muted 6.2:1 */
}

/* Texte secondaire OK avec ancien */
.card-subtitle, .char-counter {
  color: var(--muted-secondary);
}

/* Boutons disabled avec contraste minimum */
.btn:disabled {
  opacity: var(--disabled-opacity);
}
```

---

### Phase 2 : Skip Links (15 min)

**quiz.html, index.html, legacy.html** - Ajouter en début `<body>` :
```html
<a href="#main-content" class="skip-link">
  Aller au contenu principal
</a>
```

**src/style.css** - Améliorer `.skip-link` :
```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1rem 1.5rem;
  background: var(--accent);
  color: var(--bg);
  text-decoration: none;
  border-radius: 0 0 var(--radius-md) 0;
  font-weight: 600;
  transition: .2s;
}

.skip-link:focus {
  position: fixed !important;
  left: 8px !important;
  top: 8px !important;
  outline: 3px solid var(--fg);
  outline-offset: 2px;
  box-shadow: var(--shadow-lg);
}
```

---

### Phase 3 : ARIA Labels (45 min)

#### quiz.html corrections :
```html
<!-- Topbar -->
<button id="btn-quit" class="btn-close" aria-label="Quitter le quiz">
  Quitter
</button>

<!-- Question card -->
<div class="quiz-container" role="main" id="main-content">
  <div class="progress-bar" role="progressbar" 
       aria-valuenow="1" aria-valuemin="1" aria-valuemax="20"
       aria-label="Progression du quiz">
    <div class="progress-fill" style="width: 5%"></div>
  </div>
  
  <div class="question-card" role="region" aria-live="polite">
    <h2 id="question-text">Question...</h2>
    
    <div class="options" role="radiogroup" aria-labelledby="question-text">
      <!-- Options QCM -->
      <button class="option-btn" role="radio" aria-checked="false">
        <span class="option-label">A</span>
        <span class="option-text">Réponse A</span>
      </button>
    </div>
  </div>
  
  <!-- Feedback -->
  <div class="feedback" role="alert" aria-live="assertive">
    <!-- Feedback content -->
  </div>
  
  <!-- Actions -->
  <button id="btn-validate" class="btn-primary" disabled
          aria-label="Valider la réponse sélectionnée">
    Valider
  </button>
  <button id="btn-next" class="btn-primary" 
          aria-label="Passer à la question suivante" style="display:none">
    Suivant
  </button>
</div>

<!-- Modal résultats -->
<div class="results-modal" role="dialog" aria-labelledby="results-title" 
     aria-modal="true" style="display:none">
  <h2 id="results-title">Résultats du quiz</h2>
  <!-- ... -->
</div>
```

#### index.html/legacy.html corrections :
```html
<!-- File browser button -->
<button id="btn-explorer" class="primary" 
        aria-haspopup="dialog" aria-expanded="false"
        aria-controls="file-browser-modal">
  📁 Explorer mes cours
</button>

<!-- Modal file browser -->
<div id="file-browser-modal" class="fb-modal" 
     role="dialog" aria-labelledby="fb-title" aria-modal="true"
     style="display:none">
  <div class="fb-content">
    <button class="fb-close" aria-label="Fermer l'explorateur">×</button>
    <h3 id="fb-title">Explorateur de fichiers</h3>
    <!-- ... -->
  </div>
</div>

<!-- Cours checkbox items -->
<div class="cours-checkbox-item" role="checkbox" 
     aria-checked="false" aria-labelledby="cours-label-1"
     tabindex="0">
  <input type="checkbox" id="cours-1" tabindex="-1">
  <label for="cours-1" id="cours-label-1">
    <strong>Chapitre 1</strong> - 45 questions
  </label>
</div>

<!-- Mode selection -->
<div class="modes" role="radiogroup" aria-label="Mode de quiz">
  <label>
    <input type="radio" name="qmode" value="adaptive" 
           aria-describedby="mode-adaptive-desc">
    <span>Adaptatif (Leitner)</span>
  </label>
  <span id="mode-adaptive-desc" class="sr-only">
    Questions adaptées à votre niveau de maîtrise
  </span>
</div>

<!-- Start button -->
<button id="start-quiz-btn" class="btn-primary" disabled
        aria-label="Lancer le quiz avec les paramètres sélectionnés">
  🚀 Lancer
</button>
```

**Ajouter classe `.sr-only` (screen reader only)** :
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

### Phase 4 : Focus Visible (30 min)

**src/style.css** - Étendre `:focus-visible` :
```css
/* Focus ring universel pour tous éléments interactifs */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
a:focus-visible,
[tabindex]:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  position: relative;
  z-index: 1;
}

/* Focus pour custom controls */
.cours-checkbox-item:focus-visible,
.opt:focus-visible,
.match-card:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* Focus pour radio buttons custom */
input[type="radio"]:focus-visible + label,
input[type="checkbox"]:focus-visible + label {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}
```

---

### Phase 5 : Clavier Navigation (1h)

#### A. Focus trap modal
**src/main.ts** - Ajouter helper :
```typescript
function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  // Focus premier élément à l'ouverture
  firstFocusable?.focus();
}

// Appliquer au modal file-browser
function openFileBrowser() {
  const modal = document.getElementById('file-browser-modal');
  if (modal) {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    trapFocus(modal);
  }
}

function closeFileBrowser() {
  const modal = document.getElementById('file-browser-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    // Restaurer focus sur bouton qui a ouvert modal
    document.getElementById('btn-explorer')?.focus();
  }
}

// Fermer modal avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('[role="dialog"]:not([style*="display: none"])');
    if (modal) {
      closeFileBrowser();
    }
  }
});
```

#### B. Cours checkbox items - clavier
**src/main.ts** :
```typescript
document.querySelectorAll('.cours-checkbox-item').forEach(item => {
  const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
  
  // Enter/Space toggle
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      item.setAttribute('aria-checked', String(checkbox.checked));
    }
  });
  
  // Click toggle
  item.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      item.setAttribute('aria-checked', String(checkbox.checked));
    }
  });
});
```

#### C. DragMatch clavier support
**src/main.ts** :
```typescript
let selectedChipIndex = -1;
const chips = document.querySelectorAll('.drag-match-chip');

chips.forEach((chip, index) => {
  chip.setAttribute('tabindex', '0');
  chip.setAttribute('role', 'button');
  chip.setAttribute('aria-label', `Déplacer ${chip.textContent}`);
  
  chip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      if (selectedChipIndex === -1) {
        // Sélectionner chip
        selectedChipIndex = index;
        chip.classList.add('selected-for-keyboard');
        chip.setAttribute('aria-pressed', 'true');
      } else {
        // Swap avec chip sélectionné
        const selectedChip = chips[selectedChipIndex];
        swapChips(selectedChip as HTMLElement, chip as HTMLElement);
        selectedChip.classList.remove('selected-for-keyboard');
        selectedChip.setAttribute('aria-pressed', 'false');
        selectedChipIndex = -1;
      }
    }
    
    if (e.key === 'Escape' && selectedChipIndex !== -1) {
      // Annuler sélection
      chips[selectedChipIndex].classList.remove('selected-for-keyboard');
      chips[selectedChipIndex].setAttribute('aria-pressed', 'false');
      selectedChipIndex = -1;
    }
  });
});
```

**src/style.css** - Indicateur visuel chip sélectionné :
```css
.drag-match-chip.selected-for-keyboard {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(132, 204, 22, 0.2);
}
```

---

### Phase 6 : Responsive <375px (30 min)

**src/style.css** - Ajouter breakpoint :
```css
/* iPhone SE (375px) et plus petit */
@media (max-width: 375px) {
  :root {
    --space-5: 12px; /* Réduire padding */
    --space-6: 16px;
    --font-base: 13px; /* Texte plus petit */
    --font-md: 15px;
    --font-lg: 18px;
  }
  
  .wrap {
    padding: 0 8px 16px; /* Moins de padding */
  }
  
  .topbar {
    padding: 8px 0;
    gap: 8px;
  }
  
  h1 {
    font-size: 18px;
  }
  
  .card {
    padding: var(--space-3);
  }
  
  .btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-sm);
  }
  
  .match-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .drag-match-chip {
    padding: 8px;
    font-size: 12px;
  }
  
  .opt {
    padding: 10px;
    font-size: 13px;
  }
  
  /* Stack layout pour config */
  .head {
    flex-direction: column;
    gap: 8px;
  }
  
  /* Modal full-screen sur très petit écran */
  .fb-modal .fb-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}

/* Extra small (320px - anciens smartphones) */
@media (max-width: 320px) {
  :root {
    --font-base: 12px;
    --font-md: 14px;
  }
  
  .match-grid {
    grid-template-columns: 1fr; /* Une colonne */
  }
}
```

---

### Phase 7 : Micro-interactions (30 min)

**src/style.css** - Améliorer animations existantes :
```css
/* Hover transitions plus douces */
.btn, .opt, .cours-checkbox-item, .match-card, .theme-chip {
  transition: transform 0.2s ease, box-shadow 0.2s ease, 
              background 0.2s ease, border-color 0.2s ease;
}

/* Pulse sur validation correcte */
@keyframes pulse-success {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.05); }
  50% { transform: scale(1.08); }
  75% { transform: scale(1.05); }
}

.opt.good {
  animation: pulse-success 0.5s ease-out;
}

/* Shake plus prononcé sur erreur */
@keyframes shake-error {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}

.opt.bad {
  animation: shake-error 0.6s ease-out;
}

/* Loading state pour boutons */
.btn.loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tooltip hover */
[data-tooltip] {
  position: relative;
  cursor: help;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: 6px 10px;
  background: var(--dark-alt);
  color: var(--fg);
  font-size: var(--font-xs);
  white-space: nowrap;
  border-radius: var(--radius-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 100;
}

[data-tooltip]:hover::after,
[data-tooltip]:focus::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}
```

---

### Phase 8 : Loading States (15 min)

**src/main.ts** - Helper loading :
```typescript
function setLoadingState(button: HTMLButtonElement, loading: boolean) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
  }
}

// Exemple utilisation
document.getElementById('start-quiz-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('start-quiz-btn') as HTMLButtonElement;
  setLoadingState(btn, true);
  
  try {
    await startQuiz();
  } finally {
    setLoadingState(btn, false);
  }
});
```

---

## 🧪 Tests Accessibilité

### Outils automatiques :
```bash
# Installer axe-core
npm install --save-dev axe-core

# Tester avec Playwright
npm install --save-dev @axe-core/playwright
```

**tests/accessibility.test.ts** :
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('Page accueil accessible', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});

test('Quiz accessible', async ({ page }) => {
  await page.goto('http://localhost:5173/quiz.html');
  await injectAxe(page);
  await checkA11y(page);
});
```

### Tests manuels :
- [ ] Navigation complète au **Tab** (ordre logique)
- [ ] Fermeture modales avec **Escape**
- [ ] Lecteur écran (NVDA/JAWS/VoiceOver) - toutes infos vocalisées
- [ ] Zoom 200% - pas de scroll horizontal, texte lisible
- [ ] Contraste minimum 4.5:1 (outil : WebAIM Contrast Checker)
- [ ] Mobile 320px - tout utilisable
- [ ] Animations respectent `prefers-reduced-motion`

---

## 📊 Métriques Cibles Sprint 6

| Métrique | Avant | Après |
|----------|-------|-------|
| **WCAG violations** | 12+ | 0 ✅ |
| **Contraste minimum** | 4.5:1 | 7:1 (AAA) ✅ |
| **Labels ARIA** | 0% | 100% ✅ |
| **Clavier navigation** | 60% | 100% ✅ |
| **Focus visible** | 40% | 100% ✅ |
| **Responsive <375px** | ❌ | ✅ |
| **Loading states** | 0 | 5+ ✅ |
| **Micro-interactions** | Basique | Avancé ✅ |
| **Skip links** | CSS only | Fonctionnels ✅ |
| **Focus trap modals** | ❌ | ✅ |

---

## 🎯 Priorisation

### Must-Have (P0) :
1. ✅ Contrastes WCAG AA minimum
2. ✅ Labels ARIA sur tous contrôles
3. ✅ Focus visible partout
4. ✅ Clavier navigation basique
5. ✅ Skip links fonctionnels

### Should-Have (P1) :
6. ✅ Focus trap modals
7. ✅ DragMatch clavier
8. ✅ Responsive <375px
9. ✅ Loading states

### Nice-to-Have (P2) :
10. ⏳ Micro-interactions avancées
11. ⏳ Tooltips hover
12. ⏳ Tests automatiques axe-core

---

## 📝 Checklist Validation

### Code :
- [ ] Tous boutons ont `aria-label` ou texte visible
- [ ] Tous inputs ont `<label>` ou `aria-label`
- [ ] Modales ont `role="dialog"` + `aria-modal="true"`
- [ ] Progress bars ont `role="progressbar"` + `aria-value*`
- [ ] Feedbacks ont `role="alert"` + `aria-live`
- [ ] Skip links en début HTML
- [ ] Focus trap sur modales
- [ ] Tous éléments interactifs accessibles Tab
- [ ] Escape ferme modales

### CSS :
- [ ] `:focus-visible` sur tous interactifs
- [ ] Contraste texte ≥ 4.5:1 (≥ 7:1 pour AAA)
- [ ] Responsive breakpoint 375px
- [ ] Animations avec `prefers-reduced-motion`

### Tests :
- [ ] axe-core 0 violations
- [ ] Navigation Tab complète OK
- [ ] Lecteur écran annonce tout
- [ ] Zoom 200% utilisable
- [ ] Mobile 320px OK

---

## 🚀 Déploiement

1. Appliquer corrections par phases (8 phases)
2. Tester après chaque phase
3. Commit avec message : `feat(a11y): [Phase X] Description`
4. Test final axe-core
5. Documentation dans SPRINT6_DELIVERABLES.md

**Temps total estimé** : 4-5 heures

**Impact** : Score accessibilité 40 → 90/100 🎯
