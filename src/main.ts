// src/main.ts
// Entraînement & Examen avec rattrapage 100%,
// Leitner adaptatif (gravité de l'erreur), priorisation des due,
// bouton Valider piloté par le DOM, thèmes (5e colonne), déduplication, stats par thèmes.

import './style-analytics.css';
import { parseQuestions, isCorrect, correctText, countCorrect } from './parser';
import { shuffleInPlace } from './shuffle';
import type { Mode, Question, UserAnswer, DragPair } from './types';
import { toTitleCase, norm, keyForQuestion, dedupeQuestions } from './utils';
import { courses, getThemesForCourse } from './courses';
import { loadStats, saveStats, updateStatAfterAnswer, computeSeverity, isDue } from './scheduling';
import { parserCache } from './cache/ParserCache';
import { statsManager, type QStatExtended } from './stats/StatsManager';
import { ProgressionDashboard } from './stats/ProgressionDashboard';
import { eloSystem } from './stats/EloProgressionSystem';
import { AnalyticsDashboard } from './stats/AnalyticsDashboard';
import { analyticsFunctions } from './stats/AnalyticsFunctions';
import {
  demoSheets,
  type RevisionSheet,
  loadProgressForSheet,
  saveProgressForSheet,
  resetProgressForSheet,
  computeCompletion,
  isSlotFilledCorrectly,
} from './revision-sheets';

const $ = (sel: string, root: Document | HTMLElement = document) =>
  root.querySelector(sel) as HTMLElement | null;
const $$ = (sel: string, root: Document | HTMLElement = document) =>
  Array.from(root.querySelectorAll(sel)) as HTMLElement[];

/* course discovery & helpers moved to src/courses.ts and src/utils.ts */

/* =========================
   Éléments UI
   ========================= */
const els = {
  selectMatiere: $('#matiere') as HTMLSelectElement | null,
  selectCours: $('#cours') as HTMLSelectElement,
  multiCoursCheckboxes: $('#cours-multi-checkboxes') as HTMLDivElement,
  coursCheckboxList: $('#cours-checkbox-list') as HTMLDivElement,
  selectAllCours: $('#select-all-cours') as HTMLInputElement,
  multiCoursToggle: $('#multi-cours-toggle') as HTMLInputElement,
  selectThemes: $('#themes') as HTMLSelectElement,
  inputNombre: $('#nombre') as HTMLInputElement,
  radiosMode: $$('input[name="mode"]') as HTMLInputElement[],
  btnStart: $('#start') as HTMLButtonElement,
  root: $('#quiz-root') as HTMLDivElement,
  themeToggle: $('#theme-toggle') as HTMLInputElement,
  advancedToggle: $('#advanced-toggle') as HTMLInputElement,
  selectionArea: $('#selection-area') as HTMLDivElement | null,
  activeToolbar: $('#active-toolbar') as HTMLDivElement | null,
  activeTitle: $('#active-title') as HTMLSpanElement | null,
  activeQuit: $('#btn-exit-mode') as HTMLButtonElement | null,
};
const elsExtra = {
  btnProgression: $('#btn-progression') as HTMLButtonElement | null,
  btnAnalytics: $('#btn-analytics') as HTMLButtonElement | null,
  btnExplorer: $('#btn-explorer') as HTMLButtonElement | null,
  fileBrowser: $('#file-browser') as HTMLDivElement | null,
  fbFolders: $('#fb-folders') as HTMLDivElement | null,
  fbFiles: $('#fb-files') as HTMLDivElement | null,
  fbClose: $('#fb-close') as HTMLButtonElement | null,
  btnDownloadSelected: $('#btn-download-selected') as HTMLButtonElement | null,
  planCard: $('#plan-card') as HTMLDivElement | null,
  planList: $('#plan-list') as HTMLDivElement | null,
  planFilter: $('#plan-filter') as HTMLInputElement | null,
  folderStatsCard: $('#folder-stats-card') as HTMLDivElement | null,
  folderStats: $('#folder-stats') as HTMLDivElement | null,
  courseStatsCard: $('#course-stats-card') as HTMLDivElement | null,
  courseStats: $('#course-stats') as HTMLDivElement | null,
};

/* =========================
   State
   ========================= */
type State = {
  mode: Mode;
  file: string;
  files: string[]; // Pour la sélection multiple
  n: number;

  questions: Question[];
  userAnswers: UserAnswer[];
  correctMap: (boolean | null)[];

  index: number;
  corrige: boolean;
  lastCorrect: boolean;

  selectedThemes: string[];

  round: number;
  allPool: Question[];
  // timestamp when current question was shown (performance.now())
  questionStart?: number | null;
};

const state: State = {
  mode: 'entrainement',
  file: '',
  files: [], // Nouveau: pour gérer plusieurs fichiers
  n: 10,
  questions: [],
  userAnswers: [],
  correctMap: [],
  index: 0,
  corrige: false,
  lastCorrect: false,
  selectedThemes: [],
  round: 1,
  allPool: [],
  questionStart: null,
};

/* =========================2
   Thème sombre / clair
   ========================= */
initTheme();
function initTheme() {
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('t2q-theme');
  const isDark = saved ? saved === 'dark' : prefersDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  if (els.themeToggle) els.themeToggle.checked = isDark;
  els.themeToggle?.addEventListener('change', () => {
    const dark = !!els.themeToggle.checked;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('t2q-theme', dark ? 'dark' : 'light');
  });
}

/* =========================
   Déduplication
   ========================= */
// ...utils (norm/keyForQuestion/dedupeQuestions) moved to src/utils.ts

/* =========================
   Choix cours & thèmes
   ========================= */
populateMatiereAndCourseSelects();
function populateMatiereAndCourseSelects() {
  // Remplir la liste des matières (dossiers)
  const folders = Array.from(new Set(courses.map((c) => c.folder))).sort((a, b) => a.localeCompare(b));
  if (els.selectMatiere) {
    els.selectMatiere.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = '';
    optAll.textContent = '— Toutes les matières —';
    els.selectMatiere.appendChild(optAll);
    for (const f of folders) {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      els.selectMatiere.appendChild(opt);
    }
    // on change, remplir les cours
    els.selectMatiere.addEventListener('change', () => {
      const folder = els.selectMatiere!.value;
      populateCourseSelect(folder);
      renderPlanForFolder(folder);
      renderFolderStats(folder);
      renderCourseStats(state.file);
    });
  }

  // Au chargement: attendre la sélection d'une matière
  if (els.selectCours) {
    els.selectCours.innerHTML = '<option disabled selected>— Choisissez une matière —</option>' as any;
    els.selectCours.disabled = true;
  }
  renderPlanForFolder('');
  renderFolderStats('');
  
  // Statistiques globales au chargement
  renderGlobalStats().catch(err => console.error('[init] renderGlobalStats failed:', err));
}

// Simple/avancé: masque/affiche les options
initAdvancedToggle();
function initAdvancedToggle() {
  const advRows = Array.from(document.querySelectorAll('.row.advanced')) as HTMLElement[];
  const setVis = (show: boolean) => {
    advRows.forEach(r => r.style.display = show ? '' : 'none');
  };
  const saved = localStorage.getItem('t2q-advanced');
  const initial = saved ? saved === '1' : false;
  if (els.advancedToggle) {
    els.advancedToggle.checked = initial;
    setVis(initial);
    els.advancedToggle.addEventListener('change', () => {
      const on = !!els.advancedToggle!.checked;
      setVis(on);
      localStorage.setItem('t2q-advanced', on ? '1' : '0');
    });
  } else {
    setVis(false);
  }
}

// Logique de basculement entre sélection simple et multiple
els.multiCoursToggle?.addEventListener('change', () => {
  const isMulti = els.multiCoursToggle.checked;
  
  if (isMulti) {
    // Passer en mode multi
    els.selectCours.style.display = 'none';
    els.multiCoursCheckboxes.style.display = 'block';
    
    // Créer les checkboxes pour tous les cours
    createCoursCheckboxes();
  } else {
    // Passer en mode simple
    els.selectCours.style.display = 'block';
    els.multiCoursCheckboxes.style.display = 'none';
  }
  // Rafraîchir la visibilité des stats du cours
  renderCourseStats(state.file);
});

function createCoursCheckboxes() {
  if (!els.coursCheckboxList) return;
  
  els.coursCheckboxList.innerHTML = '';
  
  // Récupérer les cours filtrés selon la matière sélectionnée
  const folderFilter = els.selectMatiere?.value || '';
  const filtered = folderFilter ? courses.filter((c) => c.folder === folderFilter) : courses;
  
  // Grouper par dossier pour un affichage plus clair
  const groupedCourses = new Map<string, typeof courses>();
  for (const course of filtered) {
    const folder = course.folder;
    if (!groupedCourses.has(folder)) {
      groupedCourses.set(folder, []);
    }
    groupedCourses.get(folder)!.push(course);
  }
  
  // Créer les checkboxes groupées par dossier
  for (const [folder, courseList] of groupedCourses) {
    // Afficher le nom du dossier si on montre plusieurs dossiers
    if (groupedCourses.size > 1) {
      const folderHeader = document.createElement('div');
      folderHeader.style.fontWeight = '600';
      folderHeader.style.fontSize = '12px';
      folderHeader.style.color = 'var(--muted)';
      folderHeader.style.marginTop = '8px';
      folderHeader.style.marginBottom = '4px';
      folderHeader.textContent = folder;
      els.coursCheckboxList.appendChild(folderHeader);
    }
    
    for (const course of courseList) {
      const item = document.createElement('div');
      item.className = 'cours-checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = course.path;
      checkbox.id = `cours-${course.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = course.label;
      label.style.flex = '1';
      label.style.cursor = 'pointer';
      
      // Ajouter un tag pour le dossier si on affiche plusieurs dossiers
      if (groupedCourses.size > 1) {
        const folderTag = document.createElement('span');
        folderTag.className = 'folder-tag';
        folderTag.textContent = folder;
        item.appendChild(folderTag);
      }
      
      // Event listener pour mettre à jour les thèmes
      checkbox.addEventListener('change', () => {
        loadMultiCoursesForThemes();
      });
      
      item.appendChild(checkbox);
      item.appendChild(label);
      els.coursCheckboxList.appendChild(item);
    }
  }
}

// Gestionnaire pour "Tout sélectionner"
els.selectAllCours?.addEventListener('change', () => {
  const checkboxes = $$('#cours-checkbox-list input[type="checkbox"]') as HTMLInputElement[];
  const isChecked = els.selectAllCours.checked;
  
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
  });
  
  // Mettre à jour les thèmes
  loadMultiCoursesForThemes();
});

function syncCoursSelectors() {
  // Cette fonction n'est plus nécessaire avec les checkboxes
  // mais on la garde pour éviter les erreurs
}

function populateCourseSelect(folderFilter: string) {
  if (!els.selectCours) return;
  els.selectCours.innerHTML = '';
  const filtered = folderFilter ? courses.filter((c) => c.folder === folderFilter) : courses;
  // Activer le select seulement si une matière est choisie
  els.selectCours.disabled = !folderFilter;
  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = '— Aucun cours —';
    els.selectCours.appendChild(opt);
    return;
  }
  // Conserver la sélection précédente si elle appartient encore au filtrage
  const previous = state.file;
  let keepSelection = filtered.some(c => c.path === previous);
  for (const c of filtered) {
    const opt = document.createElement('option');
    // Use the full path as the value so it's unique across folders
    opt.value = c.path;
    opt.textContent = `${c.label}${folderFilter ? '' : ` (${c.folder})`}`;
    els.selectCours.appendChild(opt);
  }
  if (keepSelection) {
    els.selectCours.value = previous;
  } else {
    // sélection par défaut première entrée si l'ancien ne matche pas
    els.selectCours.value = filtered[0].path;
    state.file = filtered[0].path;
  }
  loadCourseForThemes(els.selectCours.value);
  state.file = els.selectCours.value;
  
  // Si on est en mode multi, recréer les checkboxes avec les nouveaux cours
  if (els.multiCoursToggle?.checked) {
    createCoursCheckboxes();
  }
  // Mettre à jour le plan
  renderPlanForFolder(folderFilter);
  // Mettre à jour les stats du cours initial
  renderCourseStats(state.file);
}

els.selectCours?.addEventListener('change', () => {
  state.file = els.selectCours.value;
  loadCourseForThemes(state.file);
  // Sélection dans le plan: met en surbrillance l'élément correspondant
  highlightPlanSelection(state.file);
  renderCourseStats(state.file);
});

function loadMultiCoursesForThemes() {
  // Récupérer les checkboxes cochées
  const checkedBoxes = $$('#cours-checkbox-list input[type="checkbox"]:checked') as HTMLInputElement[];
  const selectedFiles = checkedBoxes.map(cb => cb.value).filter(Boolean);
  
  if (selectedFiles.length === 0) {
    fillThemes([]);
    return;
  }
  
  const allThemes = new Set<string>();
  
  for (const filename of selectedFiles) {
    const course = courses.find((c) => c.path === filename || c.file === filename);
    if (course) {
      // Use parserCache instead of direct parseQuestions
      const unique = parserCache.getParsedQuestions(course.path, course.content);
      unique.forEach((q) => (q.tags ?? []).forEach((t) => allThemes.add(t)));
    }
  }
  
  fillThemes(Array.from(allThemes).sort((a, b) => a.localeCompare(b)));
}

function loadCourseForThemes(filename: string) {
  const course = courses.find((c) => c.path === filename || c.file === filename);
  if (!course) {
    fillThemes([]);
    return;
  }
  // Use parserCache instead of direct parseQuestions
  const unique = parserCache.getParsedQuestions(course.path, course.content);
  const set = new Set<string>();
  unique.forEach((q) => (q.tags ?? []).forEach((t) => set.add(t)));
  fillThemes(Array.from(set).sort((a, b) => a.localeCompare(b)));
}

// ---- Plan du cours ----
function renderPlanForFolder(folderFilter: string) {
  if (!elsExtra.planList) return;
  const listRoot = elsExtra.planList;
  listRoot.innerHTML = '';

  // Ne rien afficher tant qu'aucune matière n'est choisie
  if (!folderFilter) {
    listRoot.innerHTML = `<div class="subtitle">Sélectionnez une matière pour voir le plan.</div>`;
    return;
  }
  const filtered = courses.filter(c => c.folder === folderFilter);
  if (filtered.length === 0) {
    listRoot.innerHTML = `<div class="subtitle">Aucun chapitre pour cette matière.</div>`;
    return;
  }

  // Index par top-level chapitre (ou fallback "Divers")
  const groups = new Map<string, typeof filtered>();
  for (const c of filtered) {
    const key = c.chapterTop || 'Divers';
    const arr = groups.get(key) || [];
    arr.push(c);
    groups.set(key, arr);
  }

  // Filtre texte
  const query = (elsExtra.planFilter?.value || '').trim().toLowerCase();

  for (const [top, list] of Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    // En-tête
    const h = document.createElement('div');
    h.style.fontWeight = '700'; h.style.marginTop = '6px'; h.style.color = 'var(--muted)'; h.textContent = top;
    listRoot.appendChild(h);

    const grid = document.createElement('div');
    grid.style.display = 'grid'; grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
    grid.style.gap = '6px';

    for (const c of list) {
      const title = c.chapterFull || c.label;
      if (query && !title.toLowerCase().includes(query)) continue;
      // Count unique questions for this course
      const qCount = (() => {
        try { return parserCache.getParsedQuestions(c.path, c.content).length; } catch { return 0; }
      })();
      const item = document.createElement('div');
      item.className = 'course-card';
      item.dataset.path = c.path;
      item.innerHTML = `
        <div class="course-card-title">${escapeHtml(title)}</div>
        <div class="course-card-meta">${qCount} question${qCount>1?'s':''}</div>
      `;

      // Sélection simple: clic sur la carte sélectionne le cours
      item.addEventListener('click', () => {
        if (els.multiCoursToggle?.checked) {
          // Toggle la checkbox correspondante
          const cb = document.getElementById(`cours-${c.path.replace(/[^a-zA-Z0-9]/g, '_')}`) as HTMLInputElement | null;
          if (cb) { cb.checked = !cb.checked; }
          loadMultiCoursesForThemes();
        } else {
          // Sélection simple
          state.file = c.path;
          if (els.selectMatiere) els.selectMatiere.value = c.folder;
          populateCourseSelect(c.folder);
          els.selectCours.value = c.path;
          loadCourseForThemes(c.path);
          highlightPlanSelection(c.path);
          renderCourseStats(c.path);
        }
      });

      grid.appendChild(item);
    }
    listRoot.appendChild(grid);
  }

  highlightPlanSelection(state.file);
}

// ---- Historique par matière ----
type FolderStats = {
  folder: string;
  total: number;       // questions uniques dans la matière
  seen: number;        // questions déjà vues (au moins 1 fois)
  due: number;         // questions dues maintenant
  sumSeen: number;     // somme des "seen" pour calculer la précision
  sumCorrect: number;  // somme des "correct"
  avgTimeMs?: number;  // moyenne des temps moyens par question
};

function computeFolderStats(folder: string): FolderStats | null {
  if (!folder) return null;
  const stats = loadStats();
  const inFolder = courses.filter(c => c.folder === folder);
  if (inFolder.length === 0) return { folder, total: 0, seen: 0, due: 0, sumSeen: 0, sumCorrect: 0, avgTimeMs: undefined };

  // Collecter toutes les questions du dossier et dédupliquer
  let allQs: Question[] = [];
  for (const c of inFolder) {
    const qs = parserCache.getParsedQuestions(c.path, c.content);
    allQs.push(...qs);
  }
  allQs = dedupeQuestions(allQs);

  let total = allQs.length;
  let seen = 0;
  let due = 0;
  let sumSeen = 0;
  let sumCorrect = 0;
  let timeSum = 0;
  let timeCount = 0;

  for (const q of allQs) {
    const key = keyForQuestion(q);
    const st = stats[key];
    if (st) {
      const s = st.seen || 0;
      const c = Math.min(st.correct || 0, s);
      if (s > 0) seen += 1;
      sumSeen += s;
      sumCorrect += c;
      if (typeof st.avgTimeMs === 'number' && st.avgTimeMs > 0) {
        timeSum += st.avgTimeMs;
        timeCount += 1;
      }
    }
    if (isDue(q)) due += 1;
  }

  const avgTimeMs = timeCount > 0 ? Math.round(timeSum / timeCount) : undefined;
  return { folder, total, seen, due, sumSeen, sumCorrect, avgTimeMs };
}

// ---- Statistiques globales (tous cours confondus) ----
async function renderGlobalStats() {
  const card = $('#global-stats-card');
  const root = $('#global-stats');
  if (!card || !root) return;

  try {
    const totalTimeMs = await statsManager.getTotalTimeSpent();
    const totalTimeFormatted = statsManager.formatDuration(totalTimeMs);
    
    // Calculer stats globales
    const allStats = await statsManager.loadStats();
    const totalQuestions = Object.keys(allStats).length;
    let totalAttempts = 0;
    let totalCorrect = 0;
    
    Object.values(allStats).forEach((stat: QStatExtended) => {
      totalAttempts += stat.seen || 0;
      totalCorrect += stat.correct || 0;
    });
    
    const globalPrecision = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    const precisionClass = globalPrecision >= 75 ? 'ok' : globalPrecision >= 50 ? 'warn' : 'danger';
    
    root.innerHTML = `
      <div class="folder-stats-grid">
        <div class="stat">
          <span class="label">⏱️ Temps total</span>
          <span class="value ok">${totalTimeFormatted}</span>
          <small class="muted">toutes sessions</small>
        </div>
        <div class="stat">
          <span class="label">📚 Questions traitées</span>
          <span class="value">${totalQuestions}</span>
          <small class="muted">uniques</small>
        </div>
        <div class="stat">
          <span class="label">📊 Tentatives totales</span>
          <span class="value">${totalAttempts}</span>
          <small class="muted">réponses données</small>
        </div>
        <div class="stat">
          <span class="label">🎯 Précision globale</span>
          <span class="value ${precisionClass}">${globalPrecision.toFixed(0)}%</span>
          <small class="muted">${totalCorrect.toFixed(0)} correctes</small>
        </div>
      </div>
    `;
    
    // Mise à jour badge header
    const badge = $('#total-time-badge');
    const badgeValue = $('#total-time-value');
    if (badge && badgeValue && totalTimeMs > 0) {
      badgeValue.textContent = totalTimeFormatted;
      badge.style.display = 'inline-flex';
    }
    
    card.style.display = 'block';
  } catch (error) {
    console.error('[renderGlobalStats] Error:', error);
    card.style.display = 'none';
  }
}

function renderFolderStats(folder: string) {
  const card = elsExtra.folderStatsCard;
  const root = elsExtra.folderStats;
  if (!card || !root) return;
  
  if (!folder) {
    card.style.display = 'none';
    root.innerHTML = '';
    return;
  }
  
  const stats = computeFolderStats(folder);
  if (!stats) {
    card.style.display = 'none';
    return;
  }
  
  // Calculs KPIs
  const mastery = stats.total > 0 ? (stats.seen / stats.total) * 100 : 0;
  const precision = stats.sumSeen > 0 ? (stats.sumCorrect / stats.sumSeen) * 100 : 0;
  const avgTimeSec = stats.avgTimeMs ? (stats.avgTimeMs / 1000).toFixed(1) : 'N/A';
  
  // Classe couleur selon maîtrise
  const masteryClass = mastery >= 75 ? 'ok' : mastery >= 50 ? 'warn' : 'danger';
  const precisionClass = precision >= 75 ? 'ok' : precision >= 50 ? 'warn' : 'danger';
  const dueClass = stats.due > 10 ? 'danger' : stats.due > 0 ? 'warn' : 'ok';
  
  root.innerHTML = `
    <div class="folder-stats-grid">
      <div class="stat">
        <span class="label">Maîtrise globale</span>
        <span class="value ${masteryClass}">${mastery.toFixed(0)}%</span>
        <small class="muted">${stats.seen} / ${stats.total} vues</small>
      </div>
      <div class="stat">
        <span class="label">Précision</span>
        <span class="value ${precisionClass}">${precision.toFixed(0)}%</span>
        <small class="muted">${stats.sumCorrect.toFixed(0)} / ${stats.sumSeen} tentatives</small>
      </div>
      <div class="stat">
        <span class="label">À réviser</span>
        <span class="value ${dueClass}">${stats.due}</span>
        <small class="muted">questions dues</small>
      </div>
      <div class="stat">
        <span class="label">Temps moyen</span>
        <span class="value">${avgTimeSec}s</span>
        <small class="muted">par question</small>
      </div>
    </div>
  `;
  
  card.style.display = 'block';
}

// ---- Statistiques du cours sélectionné ----
function renderCourseStats(filePath: string) {
  const card = elsExtra.courseStatsCard;
  const root = elsExtra.courseStats;
  if (!card || !root) return;
  
  if (!filePath) {
    card.style.display = 'none';
    root.innerHTML = '';
    return;
  }
  
  const course = courses.find((c) => c.path === filePath);
  if (!course) {
    card.style.display = 'none';
    return;
  }
  
  const stats = computeCourseStats(course);
  if (!stats) {
    card.style.display = 'none';
    return;
  }
  
  // Calculs KPIs
  const mastery = stats.total > 0 ? (stats.seen / stats.total) * 100 : 0;
  const precision = stats.sumSeen > 0 ? (stats.sumCorrect / stats.sumSeen) * 100 : 0;
  const avgTimeSec = stats.avgTimeMs ? (stats.avgTimeMs / 1000).toFixed(1) : 'N/A';
  
  // Classe couleur
  const masteryClass = mastery >= 75 ? 'ok' : mastery >= 50 ? 'warn' : 'danger';
  const precisionClass = precision >= 75 ? 'ok' : precision >= 50 ? 'warn' : 'danger';
  const dueClass = stats.due > 10 ? 'danger' : stats.due > 0 ? 'warn' : 'ok';
  
  root.innerHTML = `
    <div class="folder-stats-grid">
      <div class="stat">
        <span class="label">Maîtrise cours</span>
        <span class="value ${masteryClass}">${mastery.toFixed(0)}%</span>
        <small class="muted">${stats.seen} / ${stats.total} questions</small>
      </div>
      <div class="stat">
        <span class="label">Précision</span>
        <span class="value ${precisionClass}">${precision.toFixed(0)}%</span>
        <small class="muted">${stats.sumCorrect.toFixed(0)} / ${stats.sumSeen} réponses</small>
      </div>
      <div class="stat">
        <span class="label">À réviser</span>
        <span class="value ${dueClass}">${stats.due}</span>
        <small class="muted">dues maintenant</small>
      </div>
      <div class="stat">
        <span class="label">Temps moyen</span>
        <span class="value">${avgTimeSec}s</span>
        <small class="muted">réponse</small>
      </div>
    </div>
  `;
  
  card.style.display = 'block';
}

// ---- Statistiques par cours ----
type CourseStats = {
  total: number;
  seen: number;
  due: number;
  sumSeen: number;
  sumCorrect: number;
  avgTimeMs?: number;
};
function computeCourseStats(course: { path: string; content: string }): CourseStats | null {
  if (!course) return null;
  const stats = loadStats();
  // Collecter et dédupliquer les questions du cours
  const qs = parserCache.getParsedQuestions(course.path, course.content);
  let total = qs.length;
  let seen = 0; let due = 0; let sumSeen = 0; let sumCorrect = 0; let timeSum = 0; let timeCount = 0;
  for (const q of qs) {
    const k = keyForQuestion(q);
    const st = stats[k];
    if (st) {
      const s = st.seen || 0; const c = Math.min(st.correct || 0, s);
      if (s > 0) seen += 1;
      sumSeen += s; sumCorrect += c;
      if (typeof st.avgTimeMs === 'number' && st.avgTimeMs > 0) { timeSum += st.avgTimeMs; timeCount += 1; }
    }
    if (isDue(q)) due += 1;
  }
  const avgTimeMs = timeCount > 0 ? Math.round(timeSum / timeCount) : undefined;
  return { total, seen, due, sumSeen, sumCorrect, avgTimeMs };
}

function highlightPlanSelection(path: string) {
  const items = $$('#plan-list [data-path]');
  items.forEach(it => {
    if ((it as HTMLElement).dataset.path === path) {
      (it as HTMLElement).style.outline = '2px solid var(--accent)';
    } else {
      (it as HTMLElement).style.outline = 'none';
    }
  });
}

elsExtra.planFilter?.addEventListener('input', () => renderPlanForFolder(els.selectMatiere?.value || ''));

// ---- File browser modal ----
let focusTrapActive = false;
let firstFocusableElement: HTMLElement | null = null;
let lastFocusableElement: HTMLElement | null = null;

/**
 * Afficher le dashboard de progression ELO
 */
async function showProgressionDashboard() {
  // Masquer zone de sélection si active
  if (els.selectionArea) {
    els.selectionArea.style.display = 'none';
  }

  // Créer container dashboard
  let dashboardContainer = $('#progression-dashboard-container') as HTMLDivElement | null;
  if (!dashboardContainer) {
    dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'progression-dashboard-container';
    dashboardContainer.style.marginTop = '20px';
    els.root.parentElement?.insertBefore(dashboardContainer, els.root);
  }

  // Rendre le dashboard
  const dashboard = new ProgressionDashboard();
  await dashboard.render(dashboardContainer, state.allPool || []);

  // Ajouter bouton retour
  const backBtn = document.createElement('button');
  backBtn.className = 'secondary';
  backBtn.textContent = '← Retour';
  backBtn.style.marginTop = '20px';
  backBtn.addEventListener('click', () => {
    dashboardContainer!.remove();
    if (els.selectionArea) {
      els.selectionArea.style.display = 'block';
    }
  });
  dashboardContainer.appendChild(backBtn);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Écouter événement de démarrage de quiz de placement
  window.addEventListener('startPlacementQuiz', ((e: CustomEvent) => handlePlacementQuizStart(e)) as unknown as EventListener);
}

/**
 * Afficher le dashboard Analytics complet
 */
async function showAnalyticsDashboard() {
  // Masquer zone de sélection si active
  if (els.selectionArea) {
    els.selectionArea.style.display = 'none';
  }

  // Créer container dashboard
  let dashboardContainer = $('#analytics-dashboard-container') as HTMLDivElement | null;
  if (!dashboardContainer) {
    dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'analytics-dashboard-container';
    dashboardContainer.style.marginTop = '20px';
    els.root.parentElement?.insertBefore(dashboardContainer, els.root);
  }

  // Collecter toutes les questions disponibles
  const allQuestions: Question[] = [];
  for (const course of courses) {
    const questions = parserCache.getParsedQuestions(course.path, course.content);
    allQuestions.push(...questions);
  }
  const uniqueQuestions = dedupeQuestions(allQuestions);

  // Rendre le dashboard analytics
  const dashboard = new AnalyticsDashboard({
    container: dashboardContainer,
    questions: uniqueQuestions,
  });
  await dashboard.render();

  // Ajouter bouton retour
  const backBtn = document.createElement('button');
  backBtn.className = 'secondary';
  backBtn.textContent = '← Retour à l\'accueil';
  backBtn.style.marginTop = '20px';
  backBtn.addEventListener('click', () => {
    dashboardContainer!.remove();
    if (els.selectionArea) {
      els.selectionArea.style.display = 'block';
    }
  });
  dashboardContainer.appendChild(backBtn);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Gérer le démarrage d'un quiz de placement
 */
async function handlePlacementQuizStart(e: CustomEvent) {
  const { session } = e.detail;
  if (!session || !session.questions || session.questions.length === 0) {
    alert('Erreur: impossible de démarrer le quiz de placement.');
    return;
  }

  // Importer PlacementQuiz dynamiquement
  const { placementQuiz } = await import('./stats/PlacementQuiz');

  // Masquer le dashboard
  const dashboardContainer = $('#progression-dashboard-container') as HTMLDivElement | null;
  if (dashboardContainer) {
    dashboardContainer.style.display = 'none';
  }

  // Créer interface de quiz
  const quizContainer = document.createElement('div');
  quizContainer.id = 'placement-quiz-container';
  quizContainer.className = 'placement-quiz-active';
  els.root.innerHTML = '';
  els.root.appendChild(quizContainer);

  let currentQuestionIndex = 0;

  const renderPlacementQuestion = async () => {
    if (currentQuestionIndex >= session.questions.length) {
      // Terminer le quiz
      const result = await placementQuiz.finalizePlacement(session);
      const { eloSystem } = await import('./stats/EloProgressionSystem');
      const rank = eloSystem.getRank(result.estimatedElo);
      const accuracy = (result.correctAnswers / result.questionsAnswered) * 100;
      
      quizContainer.innerHTML = `
        <div class="card">
          <h2>🎯 Quiz de placement terminé !</h2>
          <div style="text-align: center; margin: 30px 0;">
            <div class="rank-badge" style="display: inline-block;">
              <div class="rank-icon">${rank.icon}</div>
              <div class="rank-name">${rank.name}</div>
            </div>
          </div>
          <p><strong>ELO calibré :</strong> ${Math.round(result.estimatedElo)}</p>
          <p><strong>Thème :</strong> ${result.theme}</p>
          <p><strong>Précision :</strong> ${Math.round(accuracy)}%</p>
          <p><strong>Confiance :</strong> ${Math.round(result.confidence * 100)}%</p>
          <button id="btn-back-to-dashboard" class="primary">Retour au dashboard</button>
        </div>
      `;

      const backBtn = $('#btn-back-to-dashboard') as HTMLButtonElement | null;
      backBtn?.addEventListener('click', () => {
        quizContainer.remove();
        if (dashboardContainer) {
          dashboardContainer.style.display = 'block';
        }
        // Rafraîchir le dashboard pour montrer le nouvel ELO
        showProgressionDashboard();
      });

      return;
    }

    const question = session.questions[currentQuestionIndex];
    const progress = `${currentQuestionIndex + 1} / ${session.questions.length}`;

    quizContainer.innerHTML = `
      <div class="card">
        <div class="placement-progress">
          <span class="muted">Quiz de placement - ${session.theme}</span>
          <span class="badge">${progress}</span>
        </div>
        <h3>${escapeHtml(question.question)}</h3>
        <div id="placement-answers"></div>
        ${question.explication ? `<div class="block muted" style="margin-top: 20px;"><small>${escapeHtml(question.explication)}</small></div>` : ''}
      </div>
    `;

    const answersDiv = $('#placement-answers') as HTMLDivElement | null;
    if (!answersDiv) return;

    // Rendre les réponses selon le type de question
    if (question.type === 'QCM') {
      question.reponses.forEach((rep: string, idx: number) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option';
        btn.textContent = rep;
        btn.addEventListener('click', () => handlePlacementAnswer(question, [idx]));
        answersDiv.appendChild(btn);
      });
    } else if (question.type === 'VF') {
      const btnVrai = document.createElement('button');
      btnVrai.className = 'answer-option';
      btnVrai.textContent = 'Vrai';
      btnVrai.addEventListener('click', () => handlePlacementAnswer(question, 'V'));
      
      const btnFaux = document.createElement('button');
      btnFaux.className = 'answer-option';
      btnFaux.textContent = 'Faux';
      btnFaux.addEventListener('click', () => handlePlacementAnswer(question, 'F'));
      
      answersDiv.appendChild(btnVrai);
      answersDiv.appendChild(btnFaux);
    } else if (question.type === 'QR') {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Votre réponse...';
      
      const btnSubmit = document.createElement('button');
      btnSubmit.className = 'primary';
      btnSubmit.textContent = 'Valider';
      btnSubmit.addEventListener('click', () => {
        handlePlacementAnswer(question, input.value.trim());
      });
      
      answersDiv.appendChild(input);
      answersDiv.appendChild(btnSubmit);
    }
  };

  const handlePlacementAnswer = async (question: Question, userAnswer: any) => {
    // Vérifier si la réponse est correcte
    let correct = false;
    
    if (question.type === 'QCM') {
      correct = isCorrect(question, { values: userAnswer });
    } else if (question.type === 'VF') {
      correct = isCorrect(question, { value: userAnswer });
    } else if (question.type === 'QR') {
      correct = isCorrect(question, { value: userAnswer });
    }

    // Enregistrer la réponse
    placementQuiz.recordAnswer(session, correct);
    
    // Passer à la question suivante
    currentQuestionIndex++;
    await renderPlacementQuestion();
  };

  // Démarrer le quiz
  await renderPlacementQuestion();
}

function openFileBrowser() {
  if (!elsExtra.fileBrowser || !elsExtra.fbFiles || !elsExtra.fbFolders) return;
  elsExtra.fbFiles.innerHTML = '';
  elsExtra.fbFolders.innerHTML = '';
  // toolbar with category filter
  const toolbar = document.createElement('div');
  toolbar.className = 'fb-toolbar';
  const sel = document.createElement('select');
  sel.innerHTML = `<option value="">Tous les thèmes</option><option value="classique">Classique</option><option value="marginaliste">Marginaliste</option><option value="autre">Autre</option>`;
  toolbar.appendChild(sel);
  elsExtra.fbFiles.appendChild(toolbar);
  // group courses by folder
  const map = new Map<string, typeof courses>();
  for (const c of courses) {
    const arr = map.get(c.folder) || [];
    arr.push(c);
    map.set(c.folder, arr);
  }
  // render folders (left)
  for (const [folder, list] of map) {
    const f = document.createElement('div');
    f.className = 'fb-folder';
    f.style.padding = '6px';
    f.style.cursor = 'pointer';
    f.textContent = folder;
  f.addEventListener('click', () => {
      // highlight selection
      Array.from(elsExtra.fbFolders!.children).forEach(ch => ch.classList.remove('active'));
      f.classList.add('active');
      // render files as draggable grid
      renderFilesGridForFolder(folder, list);
    });
    elsExtra.fbFolders.appendChild(f);
  }
  elsExtra.fileBrowser.style.display = 'block';
  
  // Focus trap setup
  setupFocusTrap();
  
  // Update aria-expanded
  if (elsExtra.btnExplorer) {
    elsExtra.btnExplorer.setAttribute('aria-expanded', 'true');
  }
}

function closeFileBrowser() { 
  if (elsExtra.fileBrowser) {
    elsExtra.fileBrowser.style.display = 'none';
    focusTrapActive = false;
    
    // Update aria-expanded
    if (elsExtra.btnExplorer) {
      elsExtra.btnExplorer.setAttribute('aria-expanded', 'false');
      elsExtra.btnExplorer.focus(); // Return focus to trigger
    }
  }
}

function setupFocusTrap() {
  if (!elsExtra.fileBrowser) return;
  
  // Get all focusable elements within modal
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(elsExtra.fileBrowser.querySelectorAll(focusableSelectors)) as HTMLElement[];
  
  if (focusableElements.length === 0) return;
  
  firstFocusableElement = focusableElements[0];
  lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  // Focus first element
  firstFocusableElement?.focus();
  
  // Trap focus
  focusTrapActive = true;
  
  // Keydown handler for trap
  const trapHandler = (e: KeyboardEvent) => {
    if (!focusTrapActive) {
      document.removeEventListener('keydown', trapHandler);
      return;
    }
    
    if (e.key === 'Escape') {
      closeFileBrowser();
      return;
    }
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    }
  };
  
  document.addEventListener('keydown', trapHandler);
}

elsExtra.btnProgression?.addEventListener('click', showProgressionDashboard);
elsExtra.btnAnalytics?.addEventListener('click', showAnalyticsDashboard);
elsExtra.btnExplorer?.addEventListener('click', openFileBrowser);
elsExtra.fbClose?.addEventListener('click', closeFileBrowser);
// Télécharger le cours sélectionné dans le select
elsExtra.btnDownloadSelected?.addEventListener('click', () => {
  const selected = els.selectCours?.value || state.file;
  if (!selected) return;
  downloadCourse(selected);
});

// Layout persistence helpers
function layoutKeyFor(folder: string) { return `t2q_layout_${folder.replace(/[^a-z0-9]/gi, '_')}`; }
function saveLayout(folder: string, layout: string[][]) { localStorage.setItem(layoutKeyFor(folder), JSON.stringify(layout)); }
function loadLayout(folder: string): string[][] | null {
  try { return JSON.parse(localStorage.getItem(layoutKeyFor(folder)) || 'null'); } catch { return null; }
}

// Render files as draggable grid with rows (layout = array of rows, each row array of file paths)
function renderFilesGridForFolder(folder: string, list: typeof courses) {
  if (!elsExtra.fbFiles) return;
  elsExtra.fbFiles.innerHTML = '';
  const existingLayout = loadLayout(folder);
  let layout: string[][];
  if (existingLayout) {
    layout = existingLayout;
  } else {
    // default: single row with all files
    layout = [list.map(c => c.path)];
  }

  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.flexDirection = 'column';
  grid.style.gap = '8px';

  // helper to create a row container
  function makeRow(rowIdx: number, rowFiles: string[]) {
    const row = document.createElement('div');
    row.className = 'fb-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'stretch';
    row.style.minHeight = '48px';
    row.style.border = '1px dashed var(--brd)';
    row.style.padding = '6px';
    row.dataset.row = String(rowIdx);

    // adjust card width to fill row based on count
    const count = Math.max(1, rowFiles.length);
    const cardWidth = `calc(${Math.floor(100 / count)}% - ${8 * (count - 1) / count}px)`;

    for (const p of rowFiles) {
      const c = list.find(x => x.path === p);
      if (!c) continue;
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.draggable = true;
      card.style.flex = `0 0 ${cardWidth}`;
      card.style.border = '1px solid var(--brd)';
      card.style.padding = '8px';
      card.style.borderRadius = '6px';
      card.style.background = 'transparent';
      card.dataset.path = c.path;
      const qCount = (() => { try { return parserCache.getParsedQuestions(c.path, c.content).length; } catch { return 0; } })();
      card.innerHTML = `
        <div style="font-weight:600; margin-bottom:6px">${escapeHtml(c.label)}</div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:6px">${qCount} question${qCount>1?'s':''}</div>
        <div style="display:flex; gap:6px">
          <button class="secondary fb-view">Voir</button>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        (e.dataTransfer as any).setData('text/plain', c.path);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); });

      // actions
  const btnView = card.querySelector('.fb-view') as HTMLButtonElement | null;
  btnView?.addEventListener('click', (ev) => { ev.stopPropagation(); openCoursePreview(c.path); });
      // click on card background: start directly
      card.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return; // ignore button clicks
        state.file = c.path;
        if (els.selectMatiere) els.selectMatiere.value = c.folder;
        populateCourseSelect(c.folder);
        els.selectCours.value = c.path;
        await start();
        closeFileBrowser();
      });

      row.appendChild(card);
    }

    // allow drop on row
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => { row.classList.remove('drag-over'); });
    row.addEventListener('drop', (e) => {
      e.preventDefault(); row.classList.remove('drag-over');
      const path = (e.dataTransfer as any).getData('text/plain');
      if (!path) return;
      // remove from old row
      for (const r of layout) { const idx = r.indexOf(path); if (idx !== -1) { r.splice(idx, 1); break; } }
      // insert into this row at end
      layout[rowIdx].push(path);
      // cleanup empty rows
      layout = layout.filter(r => r.length > 0);
      saveLayout(folder, layout);
      // re-render
      renderFilesGridForFolder(folder, list);
    });

    return row;
  }

  // build rows
  layout.forEach((rowFiles, i) => grid.appendChild(makeRow(i, rowFiles)));

  // control to add a new empty row
  const addRowBtn = document.createElement('button');
  addRowBtn.className = 'secondary';
  addRowBtn.textContent = 'Ajouter une ligne';
  addRowBtn.addEventListener('click', () => {
    layout.push([]);
    saveLayout(folder, layout);
    renderFilesGridForFolder(folder, list);
  });

  elsExtra.fbFiles.appendChild(grid);
  elsExtra.fbFiles.appendChild(addRowBtn);
}
// Ouvrir un aperçu lecture seule du cours dans un nouvel onglet
function openCoursePreview(path: string) {
  const course = courses.find(c => c.path === path || c.file === path);
  if (!course) return;
  const w = window.open('', '_blank');
  if (!w) return;
  const title = `${course.label} — ${course.folder}`;
  const escaped = escapeHtml(course.content).replace(/\n/g, '<br/>');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
    <style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.4;padding:16px}
    .bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:8px 0;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
    .btn{padding:6px 10px;border:1px solid #222;background:#222;color:#fff;border-radius:8px;cursor:pointer}
    pre{white-space:pre-wrap}</style></head><body>
    <div class="bar"><strong>${title}</strong><div><button class="btn" onclick="window.print()">Imprimer / PDF</button></div></div>
    <pre>${escaped}</pre>
  </body></html>`);
  w.document.close();
}
// Télécharger le cours (.txt) côté client
function downloadCourse(path: string) {
  const course = courses.find(c => c.path === path || c.file === path);
  if (!course) return;
  const blob = new Blob([course.content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = course.file || 'cours.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
// (Fonction "Ouvrir en page" supprimée)
// État des tags sélectionnés et de la recherche
let allAvailableTags: Array<{ tag: string; count: number }> = [];
let selectedTags = new Set<string>();
let tagSearchQuery = '';

function fillThemes(topics: string[]) {
  if (!els.selectThemes) return;
  
  // Mettre à jour le select caché (pour compatibilité)
  els.selectThemes.innerHTML = '';
  if (topics.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = '— Aucun thème détecté —';
    els.selectThemes.appendChild(opt);
    // Effacer l'interface moderne aussi
    renderTagsChips([]);
    updateMatchModeAvailability();
    return;
  }
  
  // Compter les questions par tag
  const tagCounts = new Map<string, number>();
  const currentFile = state.file || els.selectCours.value;
  const course = courses.find((c) => c.path === currentFile || c.file === currentFile);
  
  if (course) {
    const unique = parserCache.getParsedQuestions(course.path, course.content);
    unique.forEach(q => {
      (q.tags ?? []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
  }
  
  // Créer la liste des tags avec leur compteur
  allAvailableTags = topics.map(tag => ({
    tag,
    count: tagCounts.get(tag) || 0
  }));
  
  // Remplir le select caché (compatibilité)
  for (const t of topics) {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    els.selectThemes.appendChild(opt);
  }
  
  // Rendre l'interface moderne
  renderTagsChips(allAvailableTags);
  updateMatchModeAvailability();
}

function renderTagsChips(tags: Array<{ tag: string; count: number }>) {
  const container = document.getElementById('themes-chips');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Filtrer par recherche
  const filtered = tags.filter(t => 
    tagSearchQuery === '' || t.tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );
  
  if (filtered.length === 0) {
    container.innerHTML = '<div style="color:var(--muted); font-size:13px; padding:8px">Aucun thème trouvé</div>';
    updateTagsSummary();
    return;
  }
  
  // Créer les chips
  filtered.forEach(({ tag, count }) => {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    if (selectedTags.has(tag)) {
      chip.classList.add('selected');
    }
    chip.innerHTML = `
      <span>${escapeHtml(tag)}</span>
      <span class="tag-count">(${count})</span>
    `;
    chip.addEventListener('click', () => {
      toggleTag(tag);
    });
    container.appendChild(chip);
  });
  
  updateTagsSummary();
}

function toggleTag(tag: string) {
  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
  } else {
    selectedTags.add(tag);
  }
  
  // Synchroniser avec le select caché
  const opts = Array.from(els.selectThemes?.options ?? []);
  opts.forEach(opt => {
    opt.selected = selectedTags.has(opt.value);
  });
  
  // Re-render
  renderTagsChips(allAvailableTags);
}

function updateTagsSummary() {
  const summary = document.getElementById('tags-summary');
  if (!summary) return;
  
  const totalTags = allAvailableTags.length;
  const selectedCount = selectedTags.size;
  const totalQuestions = allAvailableTags.reduce((sum, t) => selectedTags.has(t.tag) ? sum + t.count : sum, 0);
  
  if (selectedCount === 0) {
    summary.textContent = `${totalTags} thème(s) disponible(s) — Aucune sélection`;
  } else {
    summary.textContent = `${selectedCount} thème(s) sélectionné(s) — ~${totalQuestions} question(s)`;
  }
}

function getSelectedThemes(): string[] {
  return Array.from(selectedTags);
}

// Gestionnaires d'événements pour l'interface de tags
const themesSearch = document.getElementById('themes-search') as HTMLInputElement | null;
const btnSelectAllTags = document.getElementById('btn-select-all-tags') as HTMLButtonElement | null;
const btnClearTags = document.getElementById('btn-clear-tags') as HTMLButtonElement | null;

themesSearch?.addEventListener('input', (e) => {
  tagSearchQuery = (e.target as HTMLInputElement).value;
  renderTagsChips(allAvailableTags);
});

btnSelectAllTags?.addEventListener('click', () => {
  // Sélectionner tous les tags visibles (filtrés par recherche)
  const filtered = allAvailableTags.filter(t => 
    tagSearchQuery === '' || t.tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );
  filtered.forEach(({ tag }) => selectedTags.add(tag));
  
  // Synchroniser avec le select caché
  const opts = Array.from(els.selectThemes?.options ?? []);
  opts.forEach(opt => {
    opt.selected = selectedTags.has(opt.value);
  });
  
  renderTagsChips(allAvailableTags);
});

btnClearTags?.addEventListener('click', () => {
  selectedTags.clear();
  
  // Synchroniser avec le select caché
  const opts = Array.from(els.selectThemes?.options ?? []);
  opts.forEach(opt => {
    opt.selected = false;
  });
  
  renderTagsChips(allAvailableTags);
});

function getSelectedTypes(): string[] {
  const boxes = Array.from(document.querySelectorAll('.qtype')) as HTMLInputElement[];
  return boxes.filter(b => b.checked).map(b => b.value).filter(Boolean);
}

/* =========================
   Lancement série
   ========================= */
function readMode(): Mode {
  const r = els.radiosMode.find((r) => (r as HTMLInputElement).checked) as HTMLInputElement;
  return (r?.value as Mode) ?? 'entrainement';
}
els.btnStart?.addEventListener('click', start);

async function start() {
  state.mode = readMode();

  if (state.mode === 'fiche') {
    enterActiveMode();
    return renderRevisionSheetsHome();
  }

  state.n = Math.max(1, parseInt(els.inputNombre.value || '10', 10));
  state.selectedThemes = getSelectedThemes();

  const normalizePath = (s: string) => s.replace(/\\/g, '/');
  
  // Déterminer les fichiers à utiliser (mode simple ou multiple)
  let selectedFiles: string[] = [];
  
  if (els.multiCoursToggle.checked) {
    // Mode multiple : récupérer les checkboxes cochées
    const checkedBoxes = $$('#cours-checkbox-list input[type="checkbox"]:checked') as HTMLInputElement[];
    selectedFiles = checkedBoxes.map(cb => cb.value).filter(Boolean);
    
    if (selectedFiles.length === 0) {
      return renderError('Veuillez sélectionner au moins un cours en mode multi-fichiers.');
    }
  } else {
    // Mode simple : utiliser le fichier sélectionné
    selectedFiles = [state.file || els.selectCours.value];
  }

  // Collecter toutes les questions de tous les fichiers sélectionnés
  let allQuestions: Question[] = [];
  let courseLabels: string[] = [];
  
  for (const filePath of selectedFiles) {
    const want = normalizePath(filePath);
    let course = courses.find((c) => normalizePath(c.path) === want || normalizePath(c.file) === want);
    if (!course) {
      // try fuzzy match: endsWith
      course = courses.find((c) => normalizePath(c.path).endsWith(want) || want.endsWith(normalizePath(c.file)));
    }
    if (!course) {
      console.warn('Available course paths:', courses.map(c => c.path));
      return renderError(`Cours introuvable : ${filePath}`);
    }
    
    courseLabels.push(course.label);
    
    // Parse et ajoute les questions de ce cours
    const questionsFromCourse = parserCache.getParsedQuestions(course.path, course.content);
    // Ajouter une propriété pour tracer l'origine du cours
    questionsFromCourse.forEach(q => {
      (q as any).sourceCourse = course!.label;
    });
    allQuestions.push(...questionsFromCourse);
  }

  // Déduplication globale
  let pool = dedupeQuestions(allQuestions);
  
  // Filtrer par thèmes sélectionnés
  if (state.selectedThemes.length > 0) {
    pool = pool.filter((q) => (q.tags ?? []).some((t) => state.selectedThemes.includes(t)));
    pool = dedupeQuestions(pool);
  }
  
  // Filtrer par types de questions sélectionnés
  const selectedTypes = getSelectedTypes();
  if (selectedTypes.length > 0 && selectedTypes.length < 4) {
    pool = pool.filter((q) => selectedTypes.includes(q.type));
  }
  
  if (pool.length === 0) return renderError('Aucune question ne correspond aux critères sélectionnés.');

  // Mettre à jour l'état avec les informations multi-cours
  state.files = selectedFiles;
  state.file = selectedFiles.length === 1 ? selectedFiles[0] : courseLabels.join(' + ');

  // Priorité aux cartes "dûes" (Leitner)
  const due = pool.filter(isDue);
  const fresh = pool.filter((q) => !isDue(q));
  shuffleInPlace(due);
  shuffleInPlace(fresh);

  const chosen: Question[] = [];
  for (const arr of [due, fresh]) {
    for (const q of arr) {
      if (chosen.length < state.n) chosen.push(q);
      else break;
    }
    if (chosen.length >= state.n) break;
  }

  state.allPool = pool.slice();
  state.questions = chosen;

  // Randomiser options & normaliser
  for (const q of state.questions) {
    normalizeAnswersInPlace(q);
    if ((q.type === 'QCM' || q.type === 'QR') && q.answers) shuffleInPlace(q.answers);
  }

  // Modes spécifiques: ne cacher l'UI qu'après avoir validé qu'on peut lancer
  if (state.mode === 'flashcards') {
    if (state.questions.length === 0) return renderError('Pas de questions pour générer des flashcards.');
    enterActiveMode();
    return renderFlashcards(state.questions.slice());
  }
  if (state.mode === 'match') {
    const pairs: DragPair[] = [];
    for (const q of pool) {
      if (q.type === 'DragMatch') {
        for (const p of (q.pairs ?? [])) pairs.push({ item: p.item, match: p.match });
      }
    }
    if (pairs.length === 0) {
      return renderError('Aucun exercice DragMatch trouvé. Sélectionne un cours contenant des paires pour le mode Match.');
    }
    shuffleInPlace(pairs);
    const count = Math.min(state.n, Math.max(4, Math.min(12, pairs.length)));
    enterActiveMode();
    return renderMatchMode(pairs.slice(0, count));
  }

  // Modes classiques (entrainement / examen)
  enterActiveMode();
  state.round = 1;
  resetRoundState(state.questions.length);
  render();
}

function resetRoundState(len: number) {
  state.index = 0;
  state.corrige = false;
  state.lastCorrect = false;
  state.userAnswers = new Array(len).fill(null) as any;
  state.correctMap = new Array(len).fill(null);
}

/* =========================
   Export questions ratées
   ========================= */
function questionToText2Quiz(q: Question): string {
  const tags = (q.tags ?? []).join(', ');
  const expl = q.explication || '';
  
  if (q.type === 'VF') {
    return `VF || ${q.question} || ${q.vf} || ${expl} || ${tags}`;
  }
  
  if (q.type === 'QR' || q.type === 'QCM') {
    const answers = (q.answers ?? [])
      .map(a => a.correct ? `V:${a.text}` : a.text)
      .join('|');
    return `${q.type} || ${q.question} || ${answers} || ${expl} || ${tags}`;
  }
  
  if (q.type === 'DragMatch') {
    const pairs = (q.pairs ?? [])
      .map(p => `${p.item}:${p.match}`)
      .join(', ');
    return `DRAGMATCH || ${q.question} || ${pairs} || ${expl} || ${tags}`;
  }
  
  if (q.type === 'OpenQ') {
    const keywords = (q.expectedKeywords ?? []).join(', ');
    const ref = q.referenceCourse || '';
    return `OPENQ || ${q.question} || ${keywords} || ${ref} || ${expl} || ${tags}`;
  }
  
  if (q.type === 'FormulaBuilder' && q.formulaData) {
    const tokens = q.formulaData.availableTokens.join('|');
    return `FORMULABUILDER || ${q.formulaData.variable} || ${tokens} || ${q.formulaData.correctFormula} || ${expl} || ${tags}`;
  }
  
  return `# Question non supportée: ${q.type}`;
}

function exportWrongAnswers(questions: Question[], correctMap: (boolean | null)[]): void {
  const wrongQuestions = questions.filter((q, i) => correctMap[i] === false);
  
  if (wrongQuestions.length === 0) {
    alert('Aucune question incorrecte à exporter ! 🎉');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `questions_ratees_${state.file.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.txt`;
  
  const header = `# Questions ratées - ${state.file}\n# Date: ${timestamp}\n# Mode: ${state.mode}\n# Total erreurs: ${wrongQuestions.length}\n\n`;
  const content = wrongQuestions.map(q => questionToText2Quiz(q)).join('\n');
  
  const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  
  // Feedback visuel
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--ok-bg); color:var(--ok-fg); padding:12px 20px; border-radius:8px; border:1px solid var(--ok-brd); z-index:999; box-shadow:0 4px 12px rgba(0,0,0,0.3)';
  toast.textContent = `✅ ${wrongQuestions.length} question(s) exportée(s) !`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* =========================
   Rendu UI
   ========================= */
function renderError(msg: string) {
  // En cas d'erreur ne pas rester en mode actif vide
  if (document.documentElement.classList.contains('app-mode-active')) {
    exitActiveMode();
  }
  els.root.innerHTML = `<div class="card"><strong>Erreur :</strong> ${escapeHtml(msg)}</div>`;
  mountFloatingNext(false);
}

function progressBar(): string {
  const total = state.questions.length || 1;
  const cur = Math.min(state.index, total);
  const percent = Math.floor((cur / total) * 100);
  return `<div class="progress"><div class="progress__bar" style="width:${percent}%"></div></div>`;
}

function render() {
  const fin = state.index >= state.questions.length;

  const head = `
    <div class="head">
      <div><span class="badge">${escapeHtml(state.file)}</span></div>
      <div>Mode : <strong>${state.mode === 'entrainement' ? 'Entraînement' : 'Examen'}</strong></div>
      <div>Tour : <strong>${state.round}</strong></div>
      <div>Progression : <strong>${Math.min(state.index + 1, state.questions.length)} / ${state.questions.length}</strong></div>
    </div>
    ${progressBar()}
  `;

  if (fin) {
    mountFloatingNext(false);
    return handleEndOfRound(head);
  }

  const q = state.questions[state.index];
  normalizeAnswersInPlace(q);

  // démarrer le chrono pour la question affichée (si écran question)
  if (state.index < state.questions.length && !state.corrige) {
    try { state.questionStart = performance.now(); } catch { state.questionStart = Date.now(); }
  } else {
    state.questionStart = null;
  }

  if (q.type === 'QR') renderQR(head, q);
  else if (q.type === 'QCM') (window as any).renderQCM ? (window as any).renderQCM(head, q) : renderQCM(head, q);
  else if (q.type === 'VF') renderVF(head, q);
  else if (q.type === 'DragMatch') renderDragMatch(head, q);
  else if (q.type === 'OpenQ') renderOpenQ(head, q);
  else if (q.type === 'FormulaBuilder') renderFormulaBuilder(head, q);
}

function helperText(q: Question): string {
  let text = '';
  if (q.type === 'VF') text = 'Choisis Vrai ou Faux.';
  else if (q.type === 'DragMatch') text = 'Glisse les réponses dans les bonnes cases.';
  else if (q.type === 'QR') text = 'Sélectionne la bonne réponse.';
  else if (q.type === 'OpenQ') text = 'Rédige ta réponse (minimum 10 caractères).';
  else if (q.type === 'FormulaBuilder') text = 'Glisse les éléments pour reconstruire la formule.';
  else if (q.type === 'QCM') {
    const nb = countCorrect(q);
    text = nb > 1 ? 'Plusieurs réponses possibles — coche toutes les bonnes.' : 'Une ou plusieurs réponses possibles.';
  }
  
  // Ajouter la source si en mode multi-cours
  if (els.multiCoursToggle.checked && (q as any).sourceCourse) {
    text += ` <span style="color: var(--muted); font-style: italic;">[${(q as any).sourceCourse}]</span>`;
  }
  
  return text;
}

/* ---------- écrans questions ---------- */
function renderQR(head: string, q: Question) {
  const opts = (q.answers ?? [])
    .map((a) => {
      let cls = 'opt';
      if (state.corrige) {
        const chosen = (state.userAnswers[state.index] as any)?.value === a.text;
        if (a.correct) cls += ' good';
        if (!a.correct && chosen) cls += ' bad';
      }
      return `
      <label class="${cls}">
        <input type="radio" name="qr" value="${escapeAttr(a.text)}" ${state.corrige ? 'disabled' : ''}/>
        <span class="label">${escapeHtml(a.text)}</span>
        ${state.corrige ? markIcon(a.correct, (state.userAnswers[state.index] as any)?.value === a.text) : ''}
      </label>`;
    })
    .join('');

  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1}</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">${helperText(q)}</small></div>
      <div class="options">${opts}</div>
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
  `;

  $$('input[name="qr"]').forEach((el) => el.addEventListener('change', updateButtonsFromDOM));
  bindValidateAndNext(q);
  updateButtonsFromDOM();
  document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQCM(head: string, q: Question) {
  const existing = state.userAnswers[state.index]?.kind === 'QCM' ? (state.userAnswers[state.index] as any).values : [];
  const opts = (q.answers ?? [])
    .map((a) => {
      const checked = existing?.includes(a.text) ? 'checked' : '';
      let cls = 'opt';
      if (state.corrige) {
        if (a.correct) cls += ' good';
        if (!a.correct && existing?.includes(a.text)) cls += ' bad';
      }
      return `
      <label class="${cls}">
        <input type="checkbox" value="${escapeAttr(a.text)}" ${state.corrige ? 'disabled' : ''} ${checked}/>
        <span class="label">${escapeHtml(a.text)}</span>
        ${state.corrige ? markIcon(a.correct, existing?.includes(a.text)) : ''}
      </label>`;
    })
    .join('');

  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1}</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">${helperText(q)}</small></div>
      <div class="options">${opts}</div>
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
  `;

  $$('.options input[type="checkbox"]').forEach((el: any) =>
    el.addEventListener('change', updateButtonsFromDOM)
  );

  bindValidateAndNext(q);
  updateButtonsFromDOM();
  document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderVF(head: string, q: Question) {
  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1}</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">${helperText(q)}</small></div>
      <div class="options options--inline">
        <label class="opt">
          <input type="radio" name="vf" value="V" ${state.corrige ? 'disabled' : ''}/>
          <span>Vrai</span>
          ${state.corrige ? markIcon(q.vf === 'V', (state.userAnswers[state.index] as any)?.value === 'V') : ''}
        </label>
        <label class="opt">
          <input type="radio" name="vf" value="F" ${state.corrige ? 'disabled' : ''}/>
          <span>Faux</span>
          ${state.corrige ? markIcon(q.vf === 'F', (state.userAnswers[state.index] as any)?.value === 'F') : ''}
        </label>
      </div>
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
  `;

  $$('input[name="vf"]').forEach((el) => el.addEventListener('change', updateButtonsFromDOM));
  bindValidateAndNext(q);
  updateButtonsFromDOM();
  document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDragMatch(head: string, q: Question) {
  if (q.type !== 'DragMatch') return;
  
  const userAnswer = state.userAnswers[state.index] as any;
  const userMatches: Record<string, string> = userAnswer?.matches ?? {};
  
  // Shuffle matches for dragging
  const matchValues = (q.pairs ?? []).map(p => p.match);
  if (!state.corrige) shuffleInPlace(matchValues);
  
  const itemsHtml = (q.pairs ?? []).map((pair, idx) => {
    const matchedValue = userMatches[pair.item] || '';
    const isCorrect = state.corrige && matchedValue === pair.match;
    const isIncorrect = state.corrige && matchedValue && matchedValue !== pair.match;
    
    return `
      <div class="drag-item-row ${state.corrige ? (isCorrect ? 'correct' : isIncorrect ? 'incorrect' : '') : ''}" data-item="${escapeHtml(pair.item)}">
        <div class="drag-item-label">${escapeHtml(pair.item)}</div>
        <div class="drag-drop-zone" data-item="${escapeHtml(pair.item)}">
          ${matchedValue ? `<div class="drag-match-chip" data-match="${escapeHtml(matchedValue)}">${escapeHtml(matchedValue)}</div>` : '<span class="placeholder">Glisser ici</span>'}
        </div>
        ${state.corrige && pair.match !== matchedValue ? `<div class="correct-answer">→ ${escapeHtml(pair.match)}</div>` : ''}
      </div>
    `;
  }).join('');
  
  const availableMatchesHtml = matchValues.map(match => {
    const isUsed = Object.values(userMatches).includes(match);
    return `<div class="drag-match-chip ${isUsed && !state.corrige ? 'used' : ''}" draggable="${!state.corrige}" data-match="${escapeHtml(match)}">${escapeHtml(match)}</div>`;
  }).join('');
  
  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1}</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">Glisse les réponses dans les bonnes cases.</small></div>
      
      <div class="drag-container">
        <div class="drag-items">
          ${itemsHtml}
        </div>
        
        ${!state.corrige ? `
          <div class="drag-matches-pool">
            <div class="pool-label">Réponses disponibles:</div>
            <div class="drag-matches">
              ${availableMatchesHtml}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
  `;
  
  if (!state.corrige) {
    setupDragAndDrop(q);
    setupKeyboardDragMatch(q);
  }
  bindValidateAndNext(q);
  updateButtonsFromDOM();
  document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- OpenQ (Question Ouverte) ---------- */
function renderOpenQ(head: string, q: Question) {
  if (q.type !== 'OpenQ') return;
  
  const userAnswer = state.userAnswers[state.index] as any;
  const userText = userAnswer?.text ?? '';
  const isCorrect = userAnswer?.isCorrect ?? false;
  
  const feedbackHtml = state.corrige ? `
    <div class="openq-feedback ${isCorrect ? 'openq-feedback-correct' : 'openq-feedback-incorrect'}">
      <div class="feedback-header">
        ${isCorrect ? '✅ <strong>Correct !</strong>' : '❌ <strong>Incomplet</strong>'}
      </div>
      ${!isCorrect && q.expectedKeywords ? `
        <div class="missing-keywords">
          🔑 Mots-clés attendus : <strong>${q.expectedKeywords.join(', ')}</strong>
        </div>
      ` : ''}
      ${q.referenceCourse ? `
        <details class="reference-course" open>
          <summary>📖 Référence cours</summary>
          <p>${escapeHtml(q.referenceCourse)}</p>
        </details>
      ` : ''}
      ${q.explication ? `
        <div class="explanation">
          💡 <em>${escapeHtml(q.explication)}</em>
        </div>
      ` : ''}
    </div>
  ` : '';
  
  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1}</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">Rédige ta réponse (minimum 10 caractères).</small></div>
      
      <div class="openq-container">
        <textarea 
          id="openq-textarea" 
          rows="8" 
          placeholder="Développez votre réponse ici..."
          aria-describedby="char-count"
          ${state.corrige ? 'disabled' : ''}
        >${escapeHtml(userText)}</textarea>
        <div id="char-count" class="char-counter">${userText.length} caractères</div>
      </div>
      
      ${feedbackHtml}
      
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
  `;
  
  // Setup textarea counter
  const textarea = document.getElementById('openq-textarea') as HTMLTextAreaElement | null;
  if (textarea && !state.corrige) {
    textarea.addEventListener('input', () => {
      const counter = document.getElementById('char-count');
      if (counter) {
        counter.textContent = `${textarea.value.length} caractères`;
      }
      updateButtonsFromDOM();
    });
  }
  
  bindValidateAndNext(q);
  updateButtonsFromDOM();
  document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateOpenAnswer(userText: string, expectedKeywords: string[]): boolean {
  if (!expectedKeywords || expectedKeywords.length === 0) return true;
  
  // Tokenize user text
  const userTokens = userText
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);
  
  // Check all keywords present (exact or fuzzy)
  return expectedKeywords.every(keyword => {
    const kwLower = keyword.toLowerCase().trim();
    return userTokens.some(token => {
      if (token === kwLower) return true;
      if (token.includes(kwLower) || kwLower.includes(token)) return true;
      return levenshteinDistance(token, kwLower) <= 2;
    });
  });
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = 800; // Hz (note élevée = succès)
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Silent fail if Web Audio API not supported
  }
}

/* ---------- FormulaBuilder (Réécriture de formule) ---------- */
function renderFormulaBuilder(head: string, q: Question) {
  if (q.type !== 'FormulaBuilder' || !q.formulaData) return;

  const { variable, correctFormula } = q.formulaData;
  const currentAnswer = state.userAnswers[state.index];
  const userFormula = currentAnswer?.kind === 'FormulaBuilder' ? currentAnswer.formula : '';
  const isCorrect = currentAnswer?.kind === 'FormulaBuilder' ? currentAnswer.isCorrect : false;

  const feedback = state.corrige ? `
    <div class="formula-feedback ${isCorrect ? 'correct' : 'incorrect'}">
      ${isCorrect 
        ? '<span style="color: #4caf50;">✓ Formule correcte !</span>' 
        : `<span style="color: #f44336;">✗ Formule incorrecte</span>
           <div style="margin-top: 0.5rem;">
             <strong>Formule attendue :</strong> ${variable.replace('?', correctFormula)}
           </div>`
      }
    </div>
  ` : '';

  els.root.innerHTML = `
    ${head}
    <div class="card--q" id="qcard">
      <div class="qtitle">Question ${state.index + 1} — Formule à reconstruire</div>
      <div class="block">${escapeHtml(q.question)}</div>
      <div class="hint"><small class="muted">Écris la formule complète (les espaces sont ignorés)</small></div>
      ${feedback}
      
      <div class="formula-builder-container">
        <div class="formula-prompt">
          <label class="formula-label">${escapeHtml(variable)}</label>
        </div>
        <input 
          type="text" 
          id="formula-input" 
          class="formula-input"
          placeholder="Écris la formule ici..."
          value="${escapeAttr(userFormula)}"
          ${state.corrige ? 'disabled' : ''}
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      
      <div class="block actions">${renderActionButtons(q)}</div>
    </div>
    ${state.corrige && q.explication ? `<div class="card--expl">${escapeHtml(q.explication)}</div>` : ''}
  `;

  if (!state.corrige) {
    setupFormulaBuilder(q);
  }

  bindValidateAndNext(q);
}

function setupFormulaBuilder(q: Question) {
  if (q.type !== 'FormulaBuilder' || !q.formulaData) return;

  const input = document.getElementById('formula-input') as HTMLInputElement;
  if (!input) return;

  const correctFormula = q.formulaData.correctFormula;

  function updateAnswer() {
    const userFormula = input.value;
    const normalizedUser = userFormula.replace(/\s+/g, '').toLowerCase();
    const normalizedCorrect = correctFormula.replace(/\s+/g, '').toLowerCase();
    
    state.userAnswers[state.index] = {
      kind: 'FormulaBuilder',
      formula: userFormula,
      isCorrect: normalizedUser === normalizedCorrect
    };
  }

  input.addEventListener('input', updateAnswer);
  input.addEventListener('blur', updateAnswer);
  input.focus();
}

function setupKeyboardDragMatch(q: Question) {
  if (q.type !== 'DragMatch') return;

  let selectedChip: HTMLElement | null = null;
  let selectedZone: HTMLElement | null = null;

  // Make chips focusable and keyboard accessible
  $$('.drag-match-chip[draggable="true"]').forEach(chip => {
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-label', `Glisser ${chip.textContent}`);

    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedChip === chip) {
          // Deselect
          chip.classList.remove('kb-selected');
          selectedChip = null;
          chip.setAttribute('aria-pressed', 'false');
        } else {
          // Deselect previous
          selectedChip?.classList.remove('kb-selected');
          selectedChip?.setAttribute('aria-pressed', 'false');
          // Select this
          chip.classList.add('kb-selected');
          selectedChip = chip as HTMLElement;
          chip.setAttribute('aria-pressed', 'true');
          chip.focus();
        }
      } else if (e.key === 'Escape' && selectedChip === chip) {
        chip.classList.remove('kb-selected');
        selectedChip = null;
        chip.setAttribute('aria-pressed', 'false');
      }
    });
  });

  // Make drop zones keyboard accessible
  $$('.drag-drop-zone').forEach(zone => {
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    const itemName = zone.getAttribute('data-item');
    zone.setAttribute('aria-label', `Zone de dépôt pour ${itemName}`);

    zone.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && selectedChip) {
        e.preventDefault();
        // Simulate drop behavior
        const matchValue = selectedChip.getAttribute('data-match');
        
        if (matchValue && itemName) {
          // Update state
          const userAnswer = state.userAnswers[state.index] as any;
          if (!userAnswer) {
            state.userAnswers[state.index] = { kind: 'DragMatch', matches: {} };
          }
          const matches = (state.userAnswers[state.index] as any).matches || {};
          
          // Remove from other items
          for (const key in matches) {
            if (matches[key] === matchValue) {
              delete matches[key];
            }
          }
          
          // Add to this item
          matches[itemName] = matchValue;
          (state.userAnswers[state.index] as any).matches = matches;
          
          // Update visually
          zone.innerHTML = `<div class="drag-match-chip" draggable="true" data-match="${escapeHtml(matchValue)}">${escapeHtml(matchValue)}</div>`;
          
          // Re-setup drag/keyboard for new chip
          const newChip = zone.querySelector('.drag-match-chip') as HTMLElement;
          if (newChip) {
            newChip.setAttribute('tabindex', '0');
            newChip.setAttribute('role', 'button');
            newChip.setAttribute('aria-label', `Retirer ${matchValue}`);
            
            newChip.addEventListener('dragstart', (e) => {
              newChip.classList.add('dragging');
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', matchValue);
              }
              const userAnswer = state.userAnswers[state.index] as any;
              if (userAnswer?.matches && itemName) {
                delete userAnswer.matches[itemName];
              }
            });
            
            newChip.addEventListener('dragend', () => {
              newChip.classList.remove('dragging');
            });
            
            // Keyboard remove from zone
            newChip.addEventListener('keydown', (e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                const userAnswer = state.userAnswers[state.index] as any;
                if (userAnswer?.matches && itemName) {
                  delete userAnswer.matches[itemName];
                }
                zone.innerHTML = '<span class="placeholder">Glisser ici</span>';
                // Show chip back in pool
                const poolChips = $$('.drag-matches .drag-match-chip');
                poolChips.forEach(chip => {
                  if (chip.getAttribute('data-match') === matchValue) {
                    chip.classList.remove('used');
                  }
                });
                updateButtonsFromDOM();
                zone.focus();
              }
            });
          }
          
          // Hide used chip from pool
          const poolChips = $$('.drag-matches .drag-match-chip');
          poolChips.forEach(chip => {
            if (chip.getAttribute('data-match') === matchValue) {
              chip.classList.add('used');
            }
          });
          
          // Deselect
          selectedChip.classList.remove('kb-selected');
          selectedChip.setAttribute('aria-pressed', 'false');
          selectedChip = null;
          
          updateButtonsFromDOM();
          zone.focus();
        }
      }
    });
  });
}

function setupDragAndDrop(q: Question) {
  if (q.type !== 'DragMatch') return;
  
  let draggedElement: HTMLElement | null = null;
  
  // Handle drag start from chips
  $$('.drag-match-chip[draggable="true"]').forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      draggedElement = chip as HTMLElement;
      chip.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.getAttribute('data-match') || '');
      }
    });
    
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });
  });
  
  // Handle drop zones
  $$('.drag-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      const matchValue = e.dataTransfer?.getData('text/plain');
      const itemName = zone.getAttribute('data-item');
      
      if (matchValue && itemName) {
        // Remove from old location if exists
        const userAnswer = state.userAnswers[state.index] as any;
        if (!userAnswer) {
          state.userAnswers[state.index] = { kind: 'DragMatch', matches: {} };
        }
        const matches = (state.userAnswers[state.index] as any).matches || {};
        
        // Find and remove this match from other items
        for (const key in matches) {
          if (matches[key] === matchValue) {
            delete matches[key];
          }
        }
        
        // Add to this item
        matches[itemName] = matchValue;
        (state.userAnswers[state.index] as any).matches = matches;
        
        // Update the drop zone visually
        zone.innerHTML = `<div class="drag-match-chip" draggable="true" data-match="${escapeHtml(matchValue)}">${escapeHtml(matchValue)}</div>`;
        
        // Re-setup drag for the new chip
        const newChip = zone.querySelector('.drag-match-chip') as HTMLElement;
        if (newChip) {
          newChip.addEventListener('dragstart', (e) => {
            newChip.classList.add('dragging');
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', newChip.getAttribute('data-match') || '');
            }
            // Remove from matches when dragging out
            const userAnswer = state.userAnswers[state.index] as any;
            if (userAnswer?.matches && itemName) {
              delete userAnswer.matches[itemName];
            }
          });
          
          newChip.addEventListener('dragend', () => {
            newChip.classList.remove('dragging');
          });
        }
        
        // Hide used chip from pool
        const poolChips = $$('.drag-matches .drag-match-chip');
        poolChips.forEach(chip => {
          if (chip.getAttribute('data-match') === matchValue) {
            chip.classList.add('used');
          }
        });
        
        updateButtonsFromDOM();
      }
    });
  });
  
  // Allow removing from drop zones by dragging back to pool
  $$('.drag-drop-zone .drag-match-chip').forEach(chip => {
    chip.setAttribute('draggable', 'true');
    chip.addEventListener('dragstart', (e) => {
      draggedElement = chip as HTMLElement;
      chip.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.getAttribute('data-match') || '');
      }
      
      // Remove from matches when dragging out
      const zone = chip.closest('.drag-drop-zone') as HTMLElement;
      const itemName = zone?.getAttribute('data-item');
      const matchValue = chip.getAttribute('data-match');
      
      if (itemName && matchValue) {
        const userAnswer = state.userAnswers[state.index] as any;
        if (userAnswer?.matches) {
          delete userAnswer.matches[itemName];
        }
      }
    });
    
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });
  });
}

/* ---------- Mode Flashcards ---------- */
function renderFlashcards(list: Question[]) {
  // simple front/back flow using correctText for the answer
  let idx = 0;
  let showAnswer = false;
  let correctCount = 0;
  const startTs = performance.now ? performance.now() : Date.now();

  function head() {
    return `
      <div class="head">
        <div><span class="badge">Flashcards</span></div>
        <div>Progression : <strong>${Math.min(idx + 1, list.length)} / ${list.length}</strong></div>
      </div>
      ${progressBarFlash(idx, list.length)}
    `;
  }

  function progressBarFlash(i: number, total: number): string {
    const percent = Math.floor((i / Math.max(1, total)) * 100);
    return `<div class="progress"><div class="progress__bar" style="width:${percent}%"></div></div>`;
  }

  function renderEnd() {
    const elapsedMs = Math.round((performance.now ? performance.now() : Date.now()) - startTs);
    els.root.innerHTML = `
      ${head()}
      <div class="card">
        <h2>Session terminée</h2>
        <p>Connues: <strong>${correctCount}</strong> / ${list.length}</p>
        <p>Temps: <strong>${Math.round(elapsedMs / 1000)}s</strong></p>
        <button id="btn-return" class="primary">Revenir</button>
      </div>
    `;
    $('#btn-return')?.addEventListener('click', exitActiveMode);
  }

  function renderOne() {
    if (idx >= list.length) return renderEnd();
    const q = list[idx];
    const front = `<div class="flash-q">${escapeHtml(q.question)}</div>`;
    const back = `<div class="flash-a">${escapeHtml(correctText(q))}</div>` + (q.explication ? `<div class="block"><small class="muted">${escapeHtml(q.explication)}</small></div>` : '');

    els.root.innerHTML = `
      ${head()}
      <div class="flash-wrap card--q" id="qcard">
        <div class="flashcard">${showAnswer ? back : front}</div>
        <div class="flash-toolbar">
          <button class="secondary" id="btn-prev" ${idx === 0 ? 'disabled' : ''}>Précédent</button>
          <div class="badge">${helperText(q)}</div>
          <button class="secondary" id="btn-next" ${idx >= list.length - 1 ? 'disabled' : ''}>Suivant</button>
        </div>
        <div class="flash-actions">
          ${!showAnswer ? `<button class="primary" id="btn-flip">Voir la réponse</button>` : `
            <button class="secondary" id="btn-again">À revoir</button>
            <button class="primary" id="btn-good">Je sais</button>
          `}
        </div>
      </div>
    `;

    document.getElementById('btn-flip')?.addEventListener('click', () => { showAnswer = true; renderOne(); });
    document.getElementById('btn-prev')?.addEventListener('click', () => { if (idx > 0) { idx -= 1; showAnswer = false; renderOne(); } });
    document.getElementById('btn-next')?.addEventListener('click', () => { if (idx < list.length - 1) { idx += 1; showAnswer = false; renderOne(); } });
    document.getElementById('btn-again')?.addEventListener('click', () => {
      // schedule as incorrect and push to end
      updateStatAfterAnswer(q, false, 1);
      list.push(q); // repeat later
      idx += 1; showAnswer = false; renderOne();
    });
    document.getElementById('btn-good')?.addEventListener('click', () => {
      updateStatAfterAnswer(q, true, 0);
      correctCount += 1;
      idx += 1; showAnswer = false; renderOne();
    });

    document.getElementById('qcard')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderOne();
}

/* ---------- Mode Match (style Quizlet) ---------- */
function renderMatchMode(pairs: DragPair[]) {
  // Build card set: each pair becomes two cards linked by key
  type Card = { id: string; key: number; text: string };
  let cards: Card[] = [];
  pairs.forEach((p, i) => {
    cards.push({ id: `i_${i}`, key: i, text: p.item });
    cards.push({ id: `m_${i}`, key: i, text: p.match });
  });
  shuffleInPlace(cards);

  let selected: Card[] = [];
  let matchedIds = new Set<string>();
  const startTs = performance.now ? performance.now() : Date.now();

  function headHtml(remain: number) {
    return `
      <div class="match-toolbar">
        <div><span class="badge">Match — ${pairs.length} paires</span></div>
        <div>Restant: <strong>${remain}</strong></div>
        <div><button id="btn-quit" class="secondary">Quitter</button></div>
      </div>
    `;
  }

  function renderEnd() {
    const elapsedMs = Math.round((performance.now ? performance.now() : Date.now()) - startTs);
    els.root.innerHTML = `
      ${headHtml(0)}
      <div class="card">
        <h2>Terminé ⚡</h2>
        <p>Temps: <strong>${Math.round(elapsedMs / 1000)}s</strong></p>
        <button id="btn-restart" class="primary">Rejouer</button>
      </div>
    `;
    document.getElementById('btn-restart')?.addEventListener('click', () => renderMatchMode(pairs));
  document.getElementById('btn-quit')?.addEventListener('click', exitActiveMode);
  }

  function renderGrid() {
    const remain = pairs.length - (matchedIds.size / 2);
    if (remain <= 0) return renderEnd();

    els.root.innerHTML = `
      ${headHtml(remain)}
      <div class="match-grid">
        ${cards.map(c => `
          <div class="match-card ${selected.find(s => s.id === c.id) ? 'selected' : ''} ${matchedIds.has(c.id) ? 'matched' : ''}" data-id="${c.id}">${escapeHtml(c.text)}</div>
        `).join('')}
      </div>
    `;

  document.getElementById('btn-quit')?.addEventListener('click', exitActiveMode);
    $$('.match-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id')!;
        const card = cards.find(x => x.id === id)!;
        if (matchedIds.has(id)) return;
        // toggle select
        if (selected.find(s => s.id === id)) {
          selected = selected.filter(s => s.id !== id);
          el.classList.remove('selected');
          return;
        }
        if (selected.length < 2) {
          selected.push(card);
          el.classList.add('selected');
        }
        if (selected.length === 2) {
          const [a, b] = selected;
          if (a.key === b.key && a.id !== b.id) {
            // match
            matchedIds.add(a.id); matchedIds.add(b.id);
            setTimeout(() => { renderGrid(); }, 150);
          } else {
            // mismatch
            setTimeout(() => {
              // shake feedback could be added
              selected = [];
              renderGrid();
            }, 350);
          }
        }
      });
    });
  }

  renderGrid();
}

/* ---------- boutons / feedback ---------- */
function renderActionButtons(q: Question): string {
  if (state.mode === 'entrainement') {
    return !state.corrige
      ? `<button class="primary" id="btn-valider" disabled>Valider</button>`
      : feedbackBlock(q, state.lastCorrect, q.type === 'QCM');
  }
  return `<button class="primary" id="btn-valider" disabled>Valider</button>`;
}

function bindValidateAndNext(q: Question) {
  const btn = $('#btn-valider') as HTMLButtonElement | null;
  btn?.addEventListener('click', () => {
    const { ok, ua } = getDOMAnswer(q);
    if (!ok || !ua) return;
    
    // OpenQ : Valider et stocker résultat
    if (q.type === 'OpenQ' && ua.kind === 'OpenQ') {
      const isCorrect = validateOpenAnswer(ua.text, q.expectedKeywords ?? []);
      (ua as any).isCorrect = isCorrect;
      
      // Play success sound only if correct
      if (isCorrect) {
        playSuccessSound();
      }
    }
    
    // mesurer le temps passé sur la question (ms)
    const start = state.questionStart ?? (performance.now ? performance.now() : Date.now());
    const elapsedMs = Math.max(0, Math.round((performance.now ? performance.now() : Date.now()) - start));
    // stocker la réponse
    (ua as any).timeMs = elapsedMs;
    state.userAnswers[state.index] = ua;

    const correct = computeIsCorrect(q, ua);
    const sev = computeSeverity(q, ua); // 0..1

    if (state.mode === 'entrainement') {
      state.lastCorrect = correct;
      state.correctMap[state.index] = correct;
      updateStatAfterAnswer(q, correct, sev, (ua as any).timeMs); // Leitner adaptatif + time
      // Rafraîchir les stats de la matière sélectionnée en arrière-plan
      const folder = els.selectMatiere?.value || '';
      if (folder) renderFolderStats(folder);
      // Rafraîchir les stats du cours sélectionné (si en mode simple)
      renderCourseStats(state.file);
      state.corrige = true;
      render();
      mountFloatingNext(true);
    } else {
      state.corrige = false;
      // in examen mode, still record stats with time if present
      updateStatAfterAnswer(q, correct, sev, (ua as any).timeMs);
      const folder = els.selectMatiere?.value || '';
      if (folder) renderFolderStats(folder);
      renderCourseStats(state.file);
      suivant();
    }
  });

  mountFloatingNext(state.mode === 'entrainement' && state.corrige);
}

// Raccourcis clavier
let keyHandlerInstalled = false;
if (!keyHandlerInstalled) {
  document.addEventListener('keydown', (e) => {
    const btnVal = document.getElementById('btn-valider') as HTMLButtonElement | null;
    const fab = document.getElementById('fab-next') as HTMLButtonElement | null;
    if (e.key === 'Enter' && btnVal && !btnVal.disabled) {
      btnVal.click(); e.preventDefault();
    } else if ((e.key.toLowerCase() === 'n' || e.key === ' ') && fab && !fab.disabled && fab.style.display !== 'none') {
      fab.click(); e.preventDefault();
    } else if (e.key === 'Escape' && document.documentElement.classList.contains('app-mode-active')) {
      // ESC pour quitter la session
      exitActiveMode(); e.preventDefault();
    }
  });
  keyHandlerInstalled = true;
}

function markIcon(isGood: boolean, wasChosen: boolean): string {
  if (isGood) return `<span class="mark mark--good" title="Bonne réponse">✓</span>`;
  if (wasChosen) return `<span class="mark mark--bad" title="Mauvais choix">✗</span>`;
  return '';
}

function feedbackBlock(q: Question, ok: boolean, multi = false): string {
  const title = ok ? 'Correct !' : 'Incorrect.';
  const good = `${multi ? 'Bonne(s) réponse(s)' : 'Bonne réponse'} : ${escapeHtml(correctText(q))}`;
  const hasExp = !!q.explication && q.explication.trim().length > 0;
  const nextBtn = `<button class="secondary" id="btn-suivant">Suivant</button>`;

  setTimeout(() => { $('#btn-suivant')?.addEventListener('click', suivant); }, 0);

  if (!hasExp) {
    return `
      <div class="feedback ${ok ? 'ok' : 'ko'}">
        <strong>${title}</strong>
        <div class="block"><strong>${good}</strong></div>
        ${nextBtn}
      </div>
    `;
  }
  return `
    <details class="feedback ${ok ? 'ok' : 'ko'}" open>
      <summary>${title} — <strong>${good}</strong></summary>
      <div class="block"><small class="muted">${escapeHtml(q.explication!)}</small></div>
      ${nextBtn}
    </details>
  `;
}

function mountFloatingNext(enabled: boolean) {
  let btn = document.getElementById('fab-next') as HTMLButtonElement | null;
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'fab-next';
    btn.className = 'fab-next';
    btn.textContent = 'Suivant';
    document.body.appendChild(btn);
    btn.addEventListener('click', suivant);
  }
  btn.disabled = !enabled;
  btn.style.display = enabled ? 'inline-flex' : 'none';
}

function suivant() {
  if (state.mode === 'entrainement' && !state.corrige) return;
  state.corrige = false;
  state.lastCorrect = false;
  state.index += 1;
  render();
}

/* =========================
   Fin de tour & rattrapage
   ========================= */
function handleEndOfRound(head: string) {
  const wrong: Question[] = [];

  if (state.mode === 'entrainement') {
    state.questions.forEach((q, i) => {
      if (state.correctMap[i] === false) wrong.push(q);
    });
  } else {
    state.questions.forEach((q, i) => {
      const ua = state.userAnswers[i];
      let correct = false, sev = 1;
      if (ua) {
        if (q.type === 'QR') correct = isCorrect(q, { value: ua.kind === 'QR' ? ua.value : null });
        else if (q.type === 'QCM') correct = isCorrect(q, { values: ua.kind === 'QCM' ? ua.values : [] });
        else if (q.type === 'VF') correct = isCorrect(q, { value: ua.kind === 'VF' ? ua.value : null });
        sev = computeSeverity(q, ua);
      }
      if (!correct) wrong.push(q);
      updateStatAfterAnswer(q, correct, sev);
    });
  }

  if (wrong.length > 0) {
    shuffleInPlace(wrong);
    for (const q of wrong) {
      normalizeAnswersInPlace(q);
      if ((q.type === 'QCM' || q.type === 'QR') && q.answers) shuffleInPlace(q.answers);
    }
    state.questions = wrong;
    state.round += 1;
    resetRoundState(wrong.length);

    els.root.innerHTML = `
      ${head}
      <div class="card">
        <h2>Rattrapage</h2>
        <p>Tu dois corriger ${wrong.length} question(s) avant de poursuivre.</p>
        <button class="primary" id="btn-continue">Reprendre</button>
      </div>
    `;
    $('#btn-continue')?.addEventListener('click', render);
    return;
  }

  return renderResultats(head);
}

/* =========================
   Résultats finaux + Stats par thèmes
   ========================= */
type ThemeStat = { theme: string; total: number; correct: number; accuracy: number; wrongIdx: number[] };

function themeKeyList(q: Question): string[] {
  const t = (q.tags ?? []).map(s => s.trim()).filter(Boolean);
  return (t.length > 0 ? t : ['(Sans thème)']);
}

function buildThemeStats(questions: Question[], userAnswers: UserAnswer[]): ThemeStat[] {
  const map = new Map<string, ThemeStat>();
  questions.forEach((q, i) => {
    const ua = userAnswers[i];
    let ok = false;
    if (ua) {
      if (q.type === 'QR') ok = isCorrect(q, { value: ua.kind === 'QR' ? ua.value : null });
      else if (q.type === 'QCM') ok = isCorrect(q, { values: ua.kind === 'QCM' ? ua.values : [] });
      else if (q.type === 'VF') ok = isCorrect(q, { value: ua.kind === 'VF' ? ua.value : null });
    }
    for (const th of themeKeyList(q)) {
      const cur = map.get(th) || { theme: th, total: 0, correct: 0, accuracy: 0, wrongIdx: [] };
      cur.total += 1;
      if (ok) cur.correct += 1; else cur.wrongIdx.push(i);
      map.set(th, cur);
    }
  });
  const arr = Array.from(map.values()).map(s => ({ ...s, accuracy: s.total ? s.correct / s.total : 0 }));
  arr.sort((a, b) => a.accuracy - b.accuracy); // prioriser les lacunes
  return arr;
}

function renderThemeStatsCard(stats: ThemeStat[]): string {
  if (stats.length === 0) return '';
  const rows = stats.map(s => `
    <tr>
      <td>${escapeHtml(s.theme)}</td>
      <td style="text-align:center">${s.correct} / ${s.total}</td>
      <td style="text-align:right">${Math.round(s.accuracy * 100)}%</td>
    </tr>
  `).join('');
  return `
    <div class="card">
      <h3>À approfondir par thèmes</h3>
      <p class="subtitle">Classement du plus faible taux de réussite au plus élevé.</p>
      <div style="overflow:auto">
        <table style="width:100%; border-collapse:collapse; font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom:1px solid var(--brd); padding-bottom:6px">Thème</th>
              <th style="text-align:center; border-bottom:1px solid var(--brd)">Score</th>
              <th style="text-align:right; border-bottom:1px solid var(--brd)">Réussite</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <small class="muted">Astuce : relance une série en sélectionnant le(s) thème(s) du haut pour cibler les lacunes.</small>
    </div>
  `;
}

function renderResultats(head: string) {
  let score = 0;
  const wrongQuestions: Question[] = [];
  const items = state.questions
    .map((q, i) => {
      const ua = state.userAnswers[i];
      const ok =
        ua &&
        (q.type === 'QR'
          ? isCorrect(q, { value: ua.kind === 'QR' ? ua.value : null })
          : q.type === 'QCM'
          ? isCorrect(q, { values: ua.kind === 'QCM' ? ua.values : [] })
          : q.type === 'VF'
          ? isCorrect(q, { value: ua.kind === 'VF' ? ua.value : null })
          : false);
      if (ok) score++;
      else wrongQuestions.push(q);

      const userText = (() => {
        if (!ua) return '(aucune réponse)';
        if (q.type === 'VF')
          return ua.kind === 'VF' ? (ua.value === 'V' ? 'Vrai' : 'Faux') : '(aucune réponse)';
        if (q.type === 'QR')
          return ua.kind === 'QR' ? (ua.value ?? '(aucune réponse)') : '(aucune réponse)';
        if (q.type === 'QCM')
          return ua.kind === 'QCM' ? ((ua.values ?? []).join(' | ') || '(aucune réponse)') : '(aucune réponse)';
        return '(aucune réponse)';
      })();

      return `
        <li class="${ok ? 'ok' : 'ko'}">
          <div class="qtitle">${i + 1}. ${escapeHtml(q.question)}</div>
          <div><strong>Ta réponse :</strong> ${escapeHtml(userText)}</div>
          <div><strong>Bonne réponse :</strong> ${escapeHtml(correctText(q))}</div>
          ${q.explication ? `<div class="block"><small class="muted">${escapeHtml(q.explication)}</small></div>` : ''}
        </li>
      `;
    })
    .join('');

  const themeStats = buildThemeStats(state.questions, state.userAnswers);
  const themeCard = renderThemeStatsCard(themeStats);

  els.root.innerHTML = `
    ${head}
    <div class="card">
      <h2>Série validée 🎉</h2>
      <p>Score du dernier tour : <strong>${score} / ${state.questions.length}</strong></p>
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap">
        <button id="btn-return" class="primary">Revenir</button>
        ${wrongQuestions.length > 0 && state.mode === 'examen' ? '<button id="btn-export-wrong" class="secondary" title="Exporter les questions ratées au format text2quiz">📥 Exporter les erreurs</button>' : ''}
      </div>
    </div>
    ${themeCard}
    <ol class="list">${items}</ol>
  `;

  mountFloatingNext(false);
  $('#btn-return')?.addEventListener('click', exitActiveMode);
  if (wrongQuestions.length > 0 && state.mode === 'examen') {
    $('#btn-export-wrong')?.addEventListener('click', () => {
      // Créer une correctMap simplifiée à partir des wrongQuestions
      const wrongIndices = new Set(wrongQuestions.map((wq) => state.questions.indexOf(wq)));
      const correctMap = state.questions.map((_, i) => !wrongIndices.has(i));
      exportWrongAnswers(state.questions, correctMap);
    });
  }
}

/* =========================
   Helpers validation DOM
   ========================= */
function getDOMAnswer(q: Question): { ok: boolean; ua: UserAnswer | null } {
  if (q.type === 'VF') {
    const v = (document.querySelector('input[name="vf"]:checked') as HTMLInputElement | null)?.value as 'V'|'F'|undefined;
    return v ? { ok: true, ua: { kind: 'VF', value: v } } : { ok: false, ua: null };
  }
  if (q.type === 'QR') {
    const v = (document.querySelector('input[name="qr"]:checked') as HTMLInputElement | null)?.value ?? null;
    return v ? { ok: true, ua: { kind: 'QR', value: v } } : { ok: false, ua: null };
  }
  if (q.type === 'QCM') {
    const boxes = Array.from(document.querySelectorAll('.options input[type="checkbox"]')) as HTMLInputElement[];
    const values = boxes.filter(b => b.checked).map(b => b.value);
    return values.length > 0 ? { ok: true, ua: { kind: 'QCM', values } } : { ok: false, ua: null };
  }
  if (q.type === 'DragMatch') {
    const userAnswer = state.userAnswers[state.index] as any;
    const matches = userAnswer?.matches ?? {};
    const pairs = q.pairs ?? [];
    const hasAny = Object.keys(matches).length > 0;
    // Autoriser la validation dès qu'au moins une association est faite (meilleure UX)
    return hasAny ? { ok: true, ua: { kind: 'DragMatch', matches } } : { ok: false, ua: null };
  }
  if (q.type === 'OpenQ') {
    const textarea = document.getElementById('openq-textarea') as HTMLTextAreaElement | null;
    const text = textarea?.value.trim() ?? '';
    return text.length >= 10 ? { ok: true, ua: { kind: 'OpenQ', text } } : { ok: false, ua: null };
  }
  return { ok: false, ua: null };
}

function normalizeAnswersInPlace(q: Question) {
  if ((q.type === 'QCM' || q.type === 'QR') && q.answers) {
    q.answers = q.answers
      .map(a => ({ ...a, text: (a.text ?? '').trim() }))
      .filter(a => a.text.length > 0);
  }
}

function updateButtonsFromDOM() {
  const btn = document.getElementById('btn-valider') as HTMLButtonElement | null;
  if (!btn) return;
  const q = state.questions[state.index];
  const { ok } = getDOMAnswer(q);
  btn.disabled = !ok;
}

// scheduling functions moved to src/scheduling.ts

/* =========================
   Utils
   ========================= */
function computeIsCorrect(q: Question, ua: UserAnswer): boolean {
  if (q.type === 'QR') return isCorrect(q, { value: ua.kind === 'QR' ? ua.value : null });
  if (q.type === 'QCM') return isCorrect(q, { values: ua.kind === 'QCM' ? ua.values : [] });
  if (q.type === 'VF') return isCorrect(q, { value: ua.kind === 'VF' ? ua.value : null });
  if (q.type === 'DragMatch') return isCorrect(q, { matches: ua.kind === 'DragMatch' ? ua.matches : {} });
  return false;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}

// Expose debug
(Object.assign(window as any, { t2q: { state } }));
/* =========================
   Mode UI hide/show helpers
   ========================= */
function enterActiveMode() {
  document.documentElement.classList.add('app-mode-active');
  if (els.selectionArea) els.selectionArea.style.display = 'none';
  updateActiveToolbar();
}
function exitActiveMode() {
  document.documentElement.classList.remove('app-mode-active');
  if (els.selectionArea) els.selectionArea.style.display = 'block';
  state.questions = [];
  state.userAnswers = [] as any;
  state.correctMap = [];
  state.index = 0;
  state.corrige = false;
  els.root.innerHTML = '';
  mountFloatingNext(false);
  // Mettre à jour les stats matière à la sortie
  const folder = els.selectMatiere?.value || '';
  if (folder) renderFolderStats(folder);
  renderCourseStats(state.file);
}

// Sécurité: garantir que l'UI de sélection est visible au chargement initial
if (document.documentElement.classList.contains('app-mode-active')) {
  document.documentElement.classList.remove('app-mode-active');
}
if (els.selectionArea && els.selectionArea.style.display === 'none' && state.questions.length === 0) {
  els.selectionArea.style.display = 'block';
}

// Quit via toolbar
els.activeQuit?.addEventListener('click', exitActiveMode);

function modeLabel(m: Mode): string {
  if (m === 'entrainement') return 'Entraînement';
  if (m === 'examen') return 'Examen';
  if (m === 'flashcards') return 'Flashcards';
  if (m === 'match') return 'Match';
  if (m === 'fiche') return 'Fiche de révision';
  return String(m);
}
function updateActiveToolbar() {
  if (!els.activeTitle) return;
  const fileLabel = state.file || '';
  els.activeTitle.textContent = `${modeLabel(state.mode)} — ${fileLabel}`;
}

/* =========================
   Mode Fiche de révision
   ========================= */
function renderRevisionSheetsHome() {
  state.file = 'Fiches';
  updateActiveToolbar();

  const cards = demoSheets
    .map((s) => {
      const progress = loadProgressForSheet(s);
      const { totalSlots, correctSlots } = computeCompletion(s, progress);
      const pct = totalSlots > 0 ? Math.round((correctSlots / totalSlots) * 100) : 0;
      return `
        <button class="secondary" data-sheet="${escapeAttr(s.id)}" style="text-align:left; padding:12px; border-radius:12px">
          <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start">
            <div>
              <div style="font-weight:800">${escapeHtml(s.title)}</div>
              <div style="color:var(--muted); font-size:13px; margin-top:4px">${escapeHtml(s.description ?? '')}</div>
            </div>
            <span class="badge">${escapeHtml(s.subject)}</span>
          </div>
          <div style="margin-top:10px">
            <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>
            <div style="margin-top:6px; color:var(--muted); font-size:12px">Progression: ${correctSlots}/${totalSlots}</div>
          </div>
        </button>
      `;
    })
    .join('');

  els.root.innerHTML = `
    <div class="card">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px">
        <div>
          <div style="font-weight:900; font-size:18px">📄 Mode fiche de révision</div>
          <div style="color:var(--muted); margin-top:6px">Glisse les éléments (ex: une date) dans les bons emplacements. La fiche se complète petit à petit.</div>
        </div>
        <button id="btn-sheets-reset-all" class="secondary" title="Réinitialiser toutes les fiches">Reset</button>
      </div>
      <div style="display:grid; gap:10px; margin-top:12px">
        ${cards}
      </div>
    </div>
  `;
  mountFloatingNext(false);

  // Ouvrir une fiche
  Array.from(els.root.querySelectorAll('[data-sheet]')).forEach((el) => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).getAttribute('data-sheet') || '';
      const sheet = demoSheets.find((s) => s.id === id);
      if (!sheet) return;
      renderRevisionSheet(sheet);
    });
  });

  // Reset global
  const btnResetAll = document.getElementById('btn-sheets-reset-all');
  btnResetAll?.addEventListener('click', () => {
    if (!confirm('Réinitialiser la progression de toutes les fiches ?')) return;
    for (const s of demoSheets) resetProgressForSheet(s);
    renderRevisionSheetsHome();
  });
}

function renderRevisionSheet(sheet: RevisionSheet) {
  state.file = sheet.title;
  updateActiveToolbar();

  const progress = loadProgressForSheet(sheet);
  const { totalSlots, correctSlots } = computeCompletion(sheet, progress);
  const pct = totalSlots > 0 ? Math.round((correctSlots / totalSlots) * 100) : 0;

  // items restant (non placés correctement)
  const usedCorrect = new Set(Object.entries(progress.placed)
    .filter(([slotId, itemId]) => isSlotFilledCorrectly(sheet, progress, slotId) && !!itemId)
    .map(([, itemId]) => itemId));

  const remainingItems = sheet.items.filter(i => !usedCorrect.has(i.id));
  shuffleInPlace(remainingItems);

  const itemsHtml = remainingItems
    .map((i) => {
      return `
        <span class="drag-match-chip" draggable="true" data-item-id="${escapeAttr(i.id)}" data-item-kind="${escapeAttr(i.kind ?? 'autre')}" title="Glisser-déposer">${escapeHtml(i.text)}</span>
      `;
    })
    .join('');

  const sectionsHtml = sheet.sections
    .map((sec) => {
      const slotsHtml = sec.slots
        .map((slot) => {
          const placedItemId = progress.placed[slot.id];
          const placedItem = placedItemId ? sheet.items.find(i => i.id === placedItemId) : null;
          const isCorrect = placedItemId ? placedItemId === slot.correctItemId : false;
          const zoneCls = ['drag-drop-zone', isCorrect ? 'correct-zone' : '', placedItemId && !isCorrect ? 'wrong-zone' : '']
            .filter(Boolean)
            .join(' ');

          const label = `<div style="font-weight:700">${escapeHtml(slot.label)}</div>`;
          const chip = placedItem ? `<span class="drag-match-chip ${isCorrect ? 'used' : ''}" draggable="false">${escapeHtml(placedItem.text)}</span>` : `<span class="placeholder">Dépose ici</span>`;
          const feedback = placedItemId
            ? (isCorrect
                ? `<div class="correct-answer" style="margin-top:6px">✅ Correct</div>`
                : `<div class="correct-answer" style="margin-top:6px">❌ Essaie encore</div>`)
            : '';

          return `
            <div class="card" style="margin:0">
              ${label}
              <div class="${zoneCls}" data-slot-id="${escapeAttr(slot.id)}" data-accepts="${escapeAttr((slot.accepts ?? []).join(','))}">
                ${chip}
              </div>
              ${feedback}
            </div>
          `;
        })
        .join('');
      return `
        <div class="card" style="margin:0">
          <div style="font-weight:900; margin-bottom:8px">${escapeHtml(sec.title)}</div>
          <div style="display:grid; gap:10px">${slotsHtml}</div>
        </div>
      `;
    })
    .join('');

  els.root.innerHTML = `
    <div class="head">
      <div><span class="badge">${escapeHtml(sheet.subject)}</span></div>
      <div>Progression : <strong>${correctSlots} / ${totalSlots}</strong></div>
    </div>
    <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>

    <div class="card" style="margin-top:12px">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start">
        <div>
          <div style="font-weight:900; font-size:18px">${escapeHtml(sheet.title)}</div>
          <div style="color:var(--muted); margin-top:6px">${escapeHtml(sheet.description ?? '')}</div>
        </div>
        <div style="display:flex; gap:8px">
          <button id="btn-sheet-back" class="secondary">← Fiches</button>
          <button id="btn-sheet-reset" class="secondary">Reset</button>
        </div>
      </div>
    </div>

    <div class="drag-container">
      <div class="drag-matches-pool">
        <div class="pool-label">Éléments à placer</div>
        <div class="drag-matches" id="sheet-items-pool">
          ${itemsHtml || '<span class="placeholder">Tout est placé 🎉</span>'}
        </div>
      </div>
    </div>

    <div style="display:grid; gap:12px; margin-top:12px">
      ${sectionsHtml}
    </div>
  `;
  mountFloatingNext(false);

  document.getElementById('btn-sheet-back')?.addEventListener('click', () => renderRevisionSheetsHome());
  document.getElementById('btn-sheet-reset')?.addEventListener('click', () => {
    if (!confirm('Réinitialiser cette fiche ?')) return;
    resetProgressForSheet(sheet);
    renderRevisionSheet(sheet);
  });

  bindRevisionDragAndDrop(sheet);

  // Terminé ?
  if (correctSlots === totalSlots && totalSlots > 0) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--ok-bg); color:var(--ok-fg); padding:12px 20px; border-radius:8px; border:1px solid var(--ok-brd); z-index:999; box-shadow:0 4px 12px rgba(0,0,0,0.3)';
    toast.textContent = '🎉 Fiche complétée !';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

function bindRevisionDragAndDrop(sheet: RevisionSheet) {
  const pool = document.getElementById('sheet-items-pool');
  const zones = Array.from(els.root.querySelectorAll('[data-slot-id]')) as HTMLElement[];
  const chips = Array.from(els.root.querySelectorAll('[data-item-id]')) as HTMLElement[];

  chips.forEach((chip) => {
    chip.addEventListener('dragstart', (ev) => {
      const dt = (ev as DragEvent).dataTransfer;
      if (!dt) return;
      const itemId = chip.getAttribute('data-item-id') || '';
      const kind = chip.getAttribute('data-item-kind') || '';
      dt.setData('text/plain', itemId);
      dt.setData('application/x-t2q-item-kind', kind);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
  });

  const allowDrop = (ev: DragEvent) => {
    ev.preventDefault();
    ev.dataTransfer!.dropEffect = 'move';
  };

  zones.forEach((zone) => {
    zone.addEventListener('dragover', (ev) => {
      allowDrop(ev as DragEvent);
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (ev) => {
      const e = ev as DragEvent;
      e.preventDefault();
      zone.classList.remove('drag-over');

      const itemId = e.dataTransfer?.getData('text/plain') || '';
      const itemKind = e.dataTransfer?.getData('application/x-t2q-item-kind') || '';
      if (!itemId) return;

      const slotId = zone.getAttribute('data-slot-id') || '';
      if (!slotId) return;

      const acceptsRaw = zone.getAttribute('data-accepts') || '';
      const accepts = acceptsRaw.split(',').map(s => s.trim()).filter(Boolean);
      if (accepts.length > 0 && itemKind && !accepts.includes(itemKind)) {
        // mauvais type (ex: on dépose un concept sur un slot date)
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--warn-bg); color:var(--fg); padding:12px 20px; border-radius:8px; border:1px solid var(--warn-brd); z-index:999; box-shadow:0 4px 12px rgba(0,0,0,0.3)';
        toast.textContent = "Type d'élément non compatible avec cet emplacement.";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
        return;
      }

      const progress = loadProgressForSheet(sheet);
      // si déjà correct, on bloque
      if (isSlotFilledCorrectly(sheet, progress, slotId)) return;

      progress.placed[slotId] = itemId;
      const slot = sheet.sections.flatMap(s => s.slots).find(s => s.id === slotId);
      const ok = !!slot && slot.correctItemId === itemId;
      if (ok) {
        // Quand c'est correct, on "valide" implicitement : l'item disparaît du pool.
        const { totalSlots, correctSlots } = computeCompletion(sheet, progress);
        if (correctSlots === totalSlots && totalSlots > 0) {
          progress.completedAt = new Date().toISOString();
        }
      }
      saveProgressForSheet(progress);
      renderRevisionSheet(sheet);
    });
  });

  // drop back to pool = remove tentative placement
  pool?.addEventListener('dragover', (ev) => allowDrop(ev as DragEvent));
  pool?.addEventListener('drop', (ev) => {
    const e = ev as DragEvent;
    e.preventDefault();
    const itemId = e.dataTransfer?.getData('text/plain') || '';
    if (!itemId) return;
    const progress = loadProgressForSheet(sheet);
    // enlever toutes les occurrences de cet itemId (tentatives)
    for (const [slotId, placed] of Object.entries(progress.placed)) {
      if (placed === itemId && !isSlotFilledCorrectly(sheet, progress, slotId)) {
        delete progress.placed[slotId];
      }
    }
    saveProgressForSheet(progress);
    renderRevisionSheet(sheet);
  });
}

/* =========================
   Disponibilité du mode Match
   ========================= */
function updateMatchModeAvailability() {
  const matchRadio = document.querySelector('input[name="mode"][value="match"]') as HTMLInputElement | null;
  const hintEl = document.getElementById('match-mode-hint');
  if (!matchRadio || !hintEl) return;

  // Si l'utilisateur a décoché DragMatch dans les types, le mode est indisponible
  const selectedTypes = getSelectedTypes();
  if (selectedTypes.length > 0 && !selectedTypes.includes('DragMatch')) {
    matchRadio.disabled = true;
    if (matchRadio.checked) {
      // Basculer sur un mode valide
      const fallback = document.querySelector('input[name="mode"][value="entrainement"]') as HTMLInputElement | null;
      if (fallback) fallback.checked = true;
    }
    hintEl.textContent = 'Match indisponible : type DragMatch décoché.';
    return;
  }

  // Déterminer les fichiers sélectionnés
  let selectedFiles: string[] = [];
  if (els.multiCoursToggle?.checked) {
    const checkedBoxes = $$('#cours-checkbox-list input[type="checkbox"]:checked') as HTMLInputElement[];
    selectedFiles = checkedBoxes.map(cb => cb.value).filter(Boolean);
  } else {
    selectedFiles = [state.file || (els.selectCours?.value || '')];
  }
  selectedFiles = selectedFiles.filter(Boolean);

  if (selectedFiles.length === 0) {
    matchRadio.disabled = true;
    hintEl.textContent = 'Match indisponible : aucun cours sélectionné.';
    return;
  }

  const themes = getSelectedThemes();
  let totalPairs = 0;
  let dragMatchQuestions = 0;
  for (const fp of selectedFiles) {
    const course = courses.find(c => c.path === fp || c.file === fp);
    if (!course) continue;
    let qs = parserCache.getParsedQuestions(course.path, course.content);
    if (themes.length > 0) {
  qs = qs.filter(q => (q.tags ?? []).some((t: string) => themes.includes(t)));
      qs = dedupeQuestions(qs);
    }
    if (selectedTypes.length > 0 && selectedTypes.length < 4) {
      qs = qs.filter(q => selectedTypes.includes(q.type));
    }
    for (const q of qs) {
      if (q.type === 'DragMatch') {
        dragMatchQuestions += 1;
        totalPairs += (q.pairs ?? []).length;
      }
    }
  }

  if (totalPairs === 0) {
    matchRadio.disabled = true;
    if (matchRadio.checked) {
      const fallback = document.querySelector('input[name="mode"][value="entrainement"]') as HTMLInputElement | null;
      if (fallback) fallback.checked = true;
    }
    hintEl.textContent = 'Match indisponible : aucune paire DragMatch trouvée avec les filtres actuels.';
  } else {
    matchRadio.disabled = false;
    hintEl.textContent = `Match disponible : ${totalPairs} paire${totalPairs > 1 ? 's' : ''} (dans ${dragMatchQuestions} question${dragMatchQuestions > 1 ? 's' : ''}).`;
  }
}

// Brancher les événements déclenchant la mise à jour
document.addEventListener('DOMContentLoaded', () => {
  updateMatchModeAvailability();
});

// Sur changement de sélection de cours simple
els.selectCours?.addEventListener('change', () => updateMatchModeAvailability());
// Sur changement des checkboxes multi-cours
els.selectAllCours?.addEventListener('change', () => updateMatchModeAvailability());
// Délégation pour chaque checkbox dynamique (re-évaluation après création)
function observeCoursCheckboxContainer() {
  const container = document.getElementById('cours-checkbox-list');
  if (!container) return;
  const mo = new MutationObserver(() => {
    const boxes = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    boxes.forEach(b => {
      b.removeEventListener('change', updateMatchModeAvailability);
      b.addEventListener('change', updateMatchModeAvailability);
    });
  });
  mo.observe(container, { childList: true, subtree: true });
}
observeCoursCheckboxContainer();

// Sur changement de thèmes
els.selectThemes?.addEventListener('change', () => updateMatchModeAvailability());
// Sur changement des types
Array.from(document.querySelectorAll('.qtype')).forEach(el => {
  el.addEventListener('change', () => updateMatchModeAvailability());
});
// Sur bascule multi-cours
els.multiCoursToggle?.addEventListener('change', () => {
  setTimeout(updateMatchModeAvailability, 0); // après création des checkboxes
});

// Après remplissage des thèmes : injecter appel dans fonction existante
// (on ajoute un hook à la fin en modifiant directement la fonction ci-dessus)
// NOTE: si la signature de fillThemes change, mettre à jour ce hook.
// Pour éviter la réassignation interdite, on ajoute un MutationObserver plus haut
// et on appelle updateMatchModeAvailability dans les événements + dans loadCourseForThemes/multi.
