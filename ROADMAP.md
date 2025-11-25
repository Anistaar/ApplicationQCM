# 🚀 ROADMAP ACCÉLÉRÉE — Text2QuizVIP

**Date démarrage** : 25 novembre 2025  
**Score actuel** : 58.3/100  
**Score cible** : 80/100  
**Durée estimée** : 10 jours sprint intensif

---

## 📊 AUDIT INITIAL (Complété)

| Axe | Score | Niveau | Expert |
|-----|-------|--------|--------|
| Pédagogie | 70/100 | BON | Dr. Sophie Bernard |
| Architecture | 51/100 | INSUFFISANT | Marc Dubois |
| UX/UI | 64/100 | PASSABLE | Laura Chen |
| Contenu | 71/100 | BON | Prof. Ahmed Tahir |
| Analytics | 32/100 | TRÈS INSUFFISANT | Karim Mokhtar |
| DevOps/Sécurité | 40/100 | TRÈS INSUFFISANT | Nadia Ferreira |
| **TOTAL** | **58.3/100** | **REFONTE NÉCESSAIRE** | — |

---

## 🎯 SPRINT 1 : Architecture & Performance (Jours 1-3)

**Expert** : Marc Dubois  
**Objectif** : Éliminer dette technique architecture, optimiser performance

### ✅ Livrables Jour 1

- [x] **ParserCache.ts** — Memoization parseQuestions (23ms → 0.1ms)
- [x] **IndexedDBAdapter.ts** — Storage 500MB (vs 10MB localStorage)
- [x] **StatsManager.ts** — Abstraction unifiée avec fallback

### 🔄 Livrables Jour 2 (En cours)

- [ ] **courses.ts refactor** — Intégrer ParserCache
- [ ] **scheduling.ts migration** — Utiliser StatsManager async
- [ ] **main.ts cleanup Phase 1** — Extraire logique stats

### 📋 Livrables Jour 3

- [ ] **ui/CoursSelector.ts** — Composant réutilisable sélection
- [ ] **quiz/QuizEngine.ts** — Logique métier isolée
- [ ] **Tests unitaires** — Coverage ParserCache, StatsManager

**Métriques cibles** :
- Latence switch matière : 23ms → <5ms ✅
- Capacité stats : 10MB → 500MB ✅
- Lines of code main.ts : 2018 → <1500

---

## 🎨 SPRINT 2 : UX/Accessibilité (Jours 4-5)

**Expert** : Laura Chen  
**Objectif** : Conformité WCAG 2.2 AA + expérience utilisateur optimale

### 📋 Livrables Jour 4

- [ ] **style.css — Contraste 7:1** 
  - Ajuster `--muted: #b4bfc9` (ratio 7.5:1)
  - Ajouter `:focus-visible` partout
  - Fix responsive 375px (iPhone SE)

- [ ] **index.html — ARIA labels**
  - `aria-haspopup="dialog"` sur btn-explorer
  - `aria-expanded` sur collapsibles
  - `role="alert"` sur feedback

- [ ] **Accessibilité clavier**
  - Focus trap modal file-browser
  - Skip-links `<a href="#main-content">`
  - Cours-checkbox-item `tabindex="0"`

### 📋 Livrables Jour 5

- [ ] **DragMatch clavier** — Select + Enter au lieu de drag-drop
- [ ] **Micro-interactions** — Animations pulse-success, slide
- [ ] **Loading states** — Spinners sur parsing long
- [ ] **Tests accessibilité** — axe-core validation

**Métriques cibles** :
- WCAG violations : 12 → 0 ✅
- Keyboard navigation : 60% → 100%
- Mobile usability : 70% → 90%

---

## 📈 SPRINT 3 : Analytics & Dashboards (Jours 6-7)

**Expert** : Karim Mokhtar  
**Objectif** : Visibilité progression, KPIs enrichis, ML prédictif

### 📋 Livrables Jour 6

- [ ] **QStat extended** — Ajout logs[] (last 100 attempts)
- [ ] **Dashboard matière** — Réactiver renderFolderStats
  - Maîtrise % (seen/total)
  - Précision % (correct/seen)
  - Questions dues
  - Temps moyen

- [ ] **Dashboard global** — Toutes matières overview
  - Tableau comparatif
  - Graphique progression temporelle

### 📋 Livrables Jour 7

- [ ] **Chart.js intégration** — 2KB bundle
  - Courbe rétention 7/14/30 jours
  - Heatmap matières × force (0-1)
  - Bar chart questions épineuses

- [ ] **Analytics functions**
  - `computeRetentionCurve()` 
  - `computeProblemQuestions()` (top 10 fail rate)
  - `computeWeakZones()` (thèmes <50% maîtrise)

**Métriques cibles** :
- Dashboards actifs : 0% → 100% ✅
- Visualisations : 0 → 3 graphiques
- Engagement estimé : ×3

---

## 📚 SPRINT 4 : Contenu & Pédagogie (Jours 8-10)

**Expert** : Prof. Ahmed Tahir + Dr. Sophie Bernard  
**Objectif** : Équité pédagogique, métacognition, adaptation

### 📋 Livrables Jour 8

- [ ] **scripts/structure-transcript.mjs**
  - Parser retranscriptions orales (HPE_cours.txt 741 lignes)
  - Générer plan structuré (GPT-4 / Claude)
  - Extraire définitions encadrées

- [ ] **HPE/DROIT restructuration**
  - 10 cours HPE reformatés
  - 1 cours DROIT Introduction formaté

### 📋 Livrables Jour 9

- [ ] **scripts/generate-questions.mjs**
  - Génération automatique 20Q par cours
  - Validation distracteurs qualité
  - Tags Bloom/difficulté/durée

- [ ] **200 nouvelles questions**
  - HPE_Marx_qcm.txt (20Q)
  - HPE_Ricardo_qcm.txt (20Q)
  - HPE_Smith_qcm.txt (20Q)
  - ... (7 autres cours HPE)

### 📋 Livrables Jour 10

- [ ] **Confidence scale UI**
  - Slider 1-5 avant chaque réponse
  - Tracking dans QStat.logs
  - Feedback calibration ("Vous étiez sûr à 80% mais faux")

- [ ] **Pré-test adaptatif**
  - Quiz initial 10Q (1 par chapitre)
  - Initialisation Leitner box=[1,3,5] selon score
  - Saut questions trop faciles

**Métriques cibles** :
- Couverture cours : 60% → 95%
- Questions HPE/DROIT : +200
- Métacognition active : 0% → 100%

---

## 🔧 MAINTENANCE & POLISH (Après jour 10)

### Phase bonus (si temps)

- [ ] **Error boundaries** — Try-catch + fallbacks gracieux
- [ ] **PerformanceObserver** — Tracking latence rendering
- [ ] **Lighthouse CI** — Gate qualité automatique
- [ ] **Backup automatisé** — Export stats JSON hebdo
- [ ] **Gamification** — Badges, streaks, leaderboard anonyme

---

## 📈 MÉTRIQUES DE SUCCÈS

| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Score global | 58.3 | 80 | TBD |
| Bundle size | 500KB | <600KB | TBD |
| Latence switch | 23ms | <5ms | ✅ <1ms (cached) |
| WCAG violations | 12 | 0 | TBD |
| Couverture cours | 60% | 95% | TBD |
| Dashboards actifs | 0 | 3 | TBD |
| Questions totales | 800 | 1000+ | TBD |

---

## 🚀 COMMANDES RAPIDES

```bash
# Build & test
npm run build
npm run test

# Dev server
npm run dev

# Deploy (local)
bash deploy.sh

# Export stats backup
# (Via UI: Settings → Export)

# Check bundle size
npx vite-bundle-visualizer
```

---

## 📝 NOTES TECHNIQUES

**Décisions architecture** :
- ✅ IndexedDB avec fallback localStorage (graceful degradation)
- ✅ ParserCache singleton avec requestIdleCallback
- ✅ StatsManager async API (future-proof)
- ⏳ Chart.js léger (vs D3.js 200KB)
- ⏳ GPT-4 Turbo pour génération questions (coût ~$2 pour 200Q)

**Non-prioritaire** (Phase 2) :
- ❌ HTTPS/TLS (déploiement local OK)
- ❌ Monitoring production (Sentry, Prometheus)
- ❌ CI/CD GitHub Actions
- ❌ Tests E2E Playwright

---

**Dernière mise à jour** : 25 nov 2025 16:00  
**Prochaine revue** : Fin Sprint 1 (Jour 3)
