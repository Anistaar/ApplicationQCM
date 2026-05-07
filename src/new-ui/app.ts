// src/new-ui/app.ts
// Application principale - chargement direct depuis fichiers .txt
// Pas de base de données - tout en localStorage

import { parseText2Quiz } from '../parser';
import { simpleProgress } from '../database/SimpleProgress';
import { shuffleArray } from '../shuffle';
import type { Question } from '../types';

// Bundler les fichiers .txt au build (évite fetch en production)
const QUESTIONS_RAW = (import.meta as any).glob('../questions/**/*.txt', {
  query: '?raw', import: 'default', eager: true
}) as Record<string, string>;

// Bundler les structures JSON
const STRUCTURES_RAW = (import.meta as any).glob('../database/structures/*.json', {
  eager: true
}) as Record<string, any>;

function getQuestionContent(viteAbsPath: string): string | null {
  // '/src/questions/S2/SOCIO/...' -> '../questions/S2/SOCIO/...'
  const rel = viteAbsPath.replace(/^\/src\/questions\//, '../questions/');
  return QUESTIONS_RAW[rel] ?? null;
}

// ========================================
// INTERFACES
// ========================================

interface SubjectStructure {
  chapters: Chapter[];
  authors?: CrossCutting[];
  contentTypes?: CrossCutting[];
}

interface Chapter {
  id: string;
  name: string;
  notions: Notion[];
}

interface Notion {
  id: string;
  name: string;
  description: string;
  tags: string[];
  estimatedTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  questionCount: number;
  subNotions?: SubNotion[];
}

interface SubNotion {
  id: string;
  name: string;
  tags: string[];
  questionCount: number;
}

interface CrossCutting {
  id: string;
  name: string;
  tags: string[];
  questionCount: number;
}

interface Session {
  type: string;
  questions: Question[];
  estimatedDuration: number;
}

interface LearningPath {
  sessions: Session[];
  totalQuestions: number;
  estimatedTotalDuration: number;
  notionsCovered: string[];
}
// ========================================
// CONFIGURATION DES MATIÈRES
// ========================================

const SUBJECTS: { id: string; name: string; icon: string; file?: string; files?: string[] }[] = [
  { id: 'TEST', name: 'Matière TEST', icon: '🧪', file: '/src/questions/TEST/definitions.txt' },
  { id: 'MACRO', name: 'Macroéconomie', icon: '📊', file: '/src/questions/S1/MACRO/MACRO_QUESTIONS_COMPLETE_v2.txt' },
  { id: 'INSTIT', name: 'Institutions', icon: '🏛️', file: '/src/questions/S1/INSTIT/INSTIT_QUESTIONS_COMPLETE_v2.txt' },
  { id: 'STATS', name: 'Statistiques', icon: '📈', file: '/src/questions/S1/STATS/stats_chap1_banque_facile.txt' },
  { id: 'DROITPRIVE', name: 'Droit privé', icon: '⚖️', file: '/src/questions/S1/DROIT/DROITPRIVE_CH3_CH4_v1.txt' },
  { id: 'DEMO', name: 'Démographie', icon: '👥', files: [
    '/src/questions/S2/DEMO/DEMOGRAPHIE_QCM_v1.txt',
    '/src/questions/S2/DEMO/DEMO_ANNALES_2025_v1.txt'
  ] },
  { id: 'SOCIO', name: 'Sociologie', icon: '🧑‍🤝‍🧑', file: '/src/questions/S2/SOCIO/SOCIOLOGIE_QCM_v1.txt' },
  { id: 'HFE', name: 'Histoire des Faits Éco', icon: '🏭', files: [
    '/src/questions/S2/HFE/HFE_QCM_v1.txt',
    '/src/questions/S2/HFE/HFE_OpenQ_v1.txt',
    '/src/questions/S2/HFE/HFE_ANNALES_2023_v1.txt',
    '/src/questions/S2/HFE/HFE_ANNALES_2025_v1.txt'
  ]},
  { id: 'DEBATS', name: 'Débats Contemporains', icon: '🌍', files: [
    '/src/questions/S2/DEBATS/DEBATS_QCM_v1.txt',
    '/src/questions/S2/DEBATS/DEBATS_ANNALES_2025_v1.txt'
  ]},
  { id: 'DEBAT_QCM', name: 'QCM Débats Contemporains', icon: '🗳️', file: '/src/questions/S2/DEBATS/DEBAT_QCM_v1.txt' }
];

// ========================================
// STATE
// ========================================

let selectedSubject: string | null = null;
let selectedNotions: Set<string> = new Set();
let selectedThemes: Set<string> = new Set();
let availableQuestions: Question[] = [];
let currentStructure: SubjectStructure | null = null;
let learningMode: 'adaptive' | 'manual' | 'review' | 'marathon' = 'adaptive';

// ========================================
// INITIALIZATION
// ========================================

async function init() {
  hideEmptyState();
  renderSubjects();
  setupEventListeners();

  // Auto-sélection depuis URL hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    setTimeout(() => selectSubject(hash), 300);
  }
}

function showEmptyState() {
  document.getElementById('empty-state')!.style.display = 'block';
  document.getElementById('subjects-grid')!.style.display = 'none';
}

function hideEmptyState() {
  document.getElementById('empty-state')!.style.display = 'none';
  document.getElementById('subjects-grid')!.style.display = 'grid';
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Theme search
  document.getElementById('theme-search')!.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    filterThemes(query);
  });

  // Theme actions
  document.getElementById('select-all-themes')!.addEventListener('click', selectAllThemes);
  document.getElementById('clear-themes')!.addEventListener('click', clearAllThemes);

  // Start quiz
  document.getElementById('start-quiz-btn')!.addEventListener('click', startQuiz);

  // Config changes
  document.getElementById('nb-questions')!.addEventListener('change', updateSummary);
}

// ========================================
// SUBJECTS
// ========================================

function renderSubjects() {
  const grid = document.getElementById('subjects-grid')!;
  grid.innerHTML = '';

  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  SUBJECTS.forEach((subject, index) => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.background = colors[index % colors.length];
    card.dataset.subjectId = subject.id;

    card.innerHTML = `
      <div class="icon">${subject.icon}</div>
      <div class="name">${subject.name}</div>
      <div class="count">Cliquez pour charger</div>
    `;

    card.addEventListener('click', () => selectSubject(subject.id));
    grid.appendChild(card);
  });

}

async function selectSubject(subjectId: string) {
  selectedSubject = subjectId;
  selectedThemes.clear();
  selectedNotions.clear();

  // Update UI
  document.querySelectorAll('.subject-card').forEach(card => {
    card.classList.remove('active');
    if (card.getAttribute('data-subject-id') === subjectId) {
      card.classList.add('active');
    }
  });

  // Afficher un loader
  const themesGrid = document.getElementById('themes-grid')!;
  themesGrid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary);"><div class="spinner" style="display:inline-block;width:40px;height:40px;border:4px solid var(--border-color);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:var(--text-primary);">Chargement des questions...</p></div>';
  // Load structure and questions
  await loadSubjectStructure(subjectId);
  await loadQuestionsForSubject(subjectId);

  // Render hierarchical view
  renderHierarchicalView();
  // Show themes section
  const themesSection = document.getElementById('themes-section')!;
  themesSection.classList.add('active');
  // Hide legacy controls when structured plan is active
  const legacyControls = document.querySelector('#themes-section > div:first-of-type') as HTMLElement;
  const themeSearch = document.getElementById('theme-search') as HTMLElement;
  if (legacyControls) legacyControls.style.display = currentStructure ? 'none' : '';
  if (themeSearch) themeSearch.style.display = currentStructure ? 'none' : '';
  // Scroll to themes
  document.getElementById('themes-section')!.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadSubjectStructure(subjectId: string) {
  try {
    // Charger la structure depuis le bundle (import.meta.glob)
    const structureKey = `../database/structures/${subjectId}_complete.json`;
    const data = STRUCTURES_RAW[structureKey]?.default ?? STRUCTURES_RAW[structureKey];

    if (data) {
      // Transformer la structure complete en format SubjectStructure
      currentStructure = {
        chapters: data.chapters.map((chap: any) => ({
          id: chap.id,
          name: `${chap.number}. ${chap.name}`,
          notions: extractNotionsFromChapter(chap)
        })),
        authors: data.crossCutting?.authors?.items?.map((author: any) => ({
          id: author.id,
          name: author.name,
          tags: author.tags || [],
          questionCount: 0 // Will be calculated from questions
        })) || []
      };
    } else {
      currentStructure = null;
    }
  } catch (error) {
    currentStructure = null;
  }
}

function extractNotionsFromChapter(chapter: any): Notion[] {
  const notions: Notion[] = [];
  
  // Parcourir sections -> subsections -> notions
  chapter.sections?.forEach((section: any) => {
    section.subsections?.forEach((subsection: any) => {
      subsection.notions?.forEach((notion: any) => {
        notions.push({
          id: notion.id,
          name: notion.name,
          description: notion.description || '',
          tags: notion.tags || [],
          estimatedTime: notion.estimatedTime || 5,
          difficulty: notion.difficulty || 'Moyen',
          questionCount: 0 // Will be calculated from questions
        });
      });
    });
  });
  
  return notions;
}

async function loadQuestionsForSubject(subjectId: string) {
  const subject = SUBJECTS.find(s => s.id === subjectId);
  if (!subject) {
    console.error('❌ Matière introuvable:', subjectId);
    return;
  }
  try {
    const filesToLoad = subject.files ?? (subject.file ? [subject.file] : []);
    const texts = filesToLoad.map(f => {
      const content = getQuestionContent(f);
      if (!content) throw new Error(`Fichier introuvable dans le bundle: ${f}`);
      return content;
    });
    const text = texts.join('\n\n');
    availableQuestions = parseText2Quiz(text);
    // Mettre à jour le compteur dans la carte
    const card = document.querySelector(`[data-subject-id="${subjectId}"]`);
    if (card) {
      const countDiv = card.querySelector('.count');
      const themes = new Set(availableQuestions.flatMap(q => q.topics || []));
      if (countDiv) {
        countDiv.textContent = `${availableQuestions.length} questions • ${themes.size} thèmes`;
      }
    }
  } catch (error) {
    alert(`Impossible de charger ${subject.name}\n\nErreur: ${error}`);
    availableQuestions = [];
  }
}

// ========================================
// HIERARCHICAL VIEW
// ========================================

function renderHierarchicalView() {
  const grid = document.getElementById('themes-grid')!;
  grid.innerHTML = '';

  if (!currentStructure) {
    // Mode classique : afficher le plan puis les thèmes
    renderCoursePlan();
    renderClassicThemes();
    return;
  }

  // Mode hiérarchique : afficher les chapitres et notions
  renderStructuredPlan();
}

function renderCoursePlan() {
  if (!selectedSubject) return;

  const grid = document.getElementById('themes-grid')!;
  const subject = SUBJECTS.find(s => s.id === selectedSubject);
  if (!subject) return;

  // Analyser la structure depuis les questions
  const chaptersMap = new Map<string, Map<string, number>>();
  const allThemes = new Set<string>();

  availableQuestions.forEach(q => {
    const topics = q.topics || [];
    topics.forEach(topic => {
      allThemes.add(topic);
      
      // Essayer d'extraire le chapitre du topic (format: "Chapitre X - ..." ou "Chap X ...")
      const chapterMatch = topic.match(/^(Chapitre?\s*\d+|Chap\.?\s*\d+|Ch\.?\s*\d+)/i);
      if (chapterMatch) {
        const chapterName = chapterMatch[1];
        if (!chaptersMap.has(chapterName)) {
          chaptersMap.set(chapterName, new Map());
        }
        const chapter = chaptersMap.get(chapterName)!;
        chapter.set(topic, (chapter.get(topic) || 0) + 1);
      }
    });
  });

  // Afficher le plan si des chapitres sont détectés
  if (chaptersMap.size > 0) {
    const planSection = document.createElement('div');
    planSection.className = 'course-plan-section';
    planSection.innerHTML = `
      <h3>📖 Plan du cours - ${subject.name}</h3>
      <div class="course-plan-content" style="display: none;">
        ${Array.from(chaptersMap.entries()).map(([chapterName, topics]) => {
          const totalQuestions = Array.from(topics.values()).reduce((sum, count) => sum + count, 0);
          return `
            <div class="plan-chapter">
              <div class="plan-chapter-header">
                <span class="plan-toggle">▶</span>
                <strong>${chapterName}</strong>
                <span class="plan-count">${totalQuestions} questions</span>
              </div>
              <div class="plan-topics collapsed">
                ${Array.from(topics.entries()).map(([topic, count]) => `
                  <div class="plan-topic">
                    <span>${topic}</span>
                    <span class="plan-count">${count}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <button class="btn btn-secondary toggle-plan-btn" style="margin-top: 1rem;">
        Afficher le plan complet
      </button>
    `;

    grid.appendChild(planSection);

    // Toggle plan visibility
    const toggleBtn = planSection.querySelector('.toggle-plan-btn') as HTMLButtonElement;
    const planContent = planSection.querySelector('.course-plan-content') as HTMLElement;
    
    toggleBtn.addEventListener('click', () => {
      if (planContent.style.display === 'none') {
        planContent.style.display = 'block';
        toggleBtn.textContent = 'Masquer le plan';
      } else {
        planContent.style.display = 'none';
        toggleBtn.textContent = 'Afficher le plan complet';
      }
    });

    // Toggle chapters
    planSection.querySelectorAll('.plan-chapter-header').forEach(header => {
      header.addEventListener('click', () => {
        const topics = header.nextElementSibling as HTMLElement;
        const toggle = header.querySelector('.plan-toggle')!;
        topics.classList.toggle('collapsed');
        toggle.textContent = topics.classList.contains('collapsed') ? '▶' : '▼';
      });
    });

    // Separator
    const separator = document.createElement('div');
    separator.style.width = '100%';
    separator.style.height = '2px';
    separator.style.background = 'var(--border-color)';
    separator.style.margin = '2rem 0';
    grid.appendChild(separator);
  }
}

function renderLearningModes() {
  const grid = document.getElementById('themes-grid')!;

  const modesSection = document.createElement('div');
  modesSection.className = 'learning-modes-section';
  modesSection.innerHTML = `
    <h3>🎯 Mode d'apprentissage</h3>
    <div class="learning-modes">
      <button class="mode-btn ${learningMode === 'adaptive' ? 'active' : ''}" data-mode="adaptive">
        🚀 Adaptatif<br><small>Parcours optimisé</small>
      </button>
      <button class="mode-btn ${learningMode === 'manual' ? 'active' : ''}" data-mode="manual">
        🎯 Manuel<br><small>Sélection libre</small>
      </button>
      <button class="mode-btn ${learningMode === 'review' ? 'active' : ''}" data-mode="review">
        📅 Révisions<br><small>Notions à revoir</small>
      </button>
      <button class="mode-btn ${learningMode === 'marathon' ? 'active' : ''}" data-mode="marathon">
        🔥 Marathon<br><small>Toutes les questions</small>
      </button>
    </div>
  `;

  grid.appendChild(modesSection);

  // Event listeners
  modesSection.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      learningMode = btn.getAttribute('data-mode') as any;
      renderHierarchicalView();
    });
  });
}

function renderChapters() {
  if (!currentStructure) return;

  const grid = document.getElementById('themes-grid')!;

  currentStructure.chapters.forEach(chapter => {
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-section';

    const chapterHeader = document.createElement('div');
    chapterHeader.className = 'chapter-header';
    chapterHeader.innerHTML = `
      <span class="toggle-icon">▶</span>
      <h3>${chapter.name}</h3>
      <span class="count">${chapter.notions.reduce((sum, n) => sum + n.questionCount, 0)} questions</span>
    `;

    chapterDiv.appendChild(chapterHeader);

    const notionsContainer = document.createElement('div');
    notionsContainer.className = 'notions-container collapsed';

    chapter.notions.forEach(notion => {
      renderNotion(notionsContainer, notion, chapter.id);
    });

    chapterDiv.appendChild(notionsContainer);

    // Toggle collapse
    chapterHeader.addEventListener('click', () => {
      notionsContainer.classList.toggle('collapsed');
      const icon = chapterHeader.querySelector('.toggle-icon')!;
      icon.textContent = notionsContainer.classList.contains('collapsed') ? '▶' : '▼';
    });

    grid.appendChild(chapterDiv);
  });
}

async function renderNotion(container: HTMLElement, notion: Notion, chapterId: string) {
  const notionDiv = document.createElement('div');
  notionDiv.className = 'notion-item';
  notionDiv.dataset.notionId = notion.id;

  // Get mastery info from localStorage
  const masteryInfo = selectedSubject ?
    simpleProgress.getNotionProgress(selectedSubject, notion.id) : null;

  const masteryScore = masteryInfo?.score || 0;
  const masteryClass = masteryScore >= 80 ? 'mastered' :
    masteryScore >= 50 ? 'in-progress' :
      masteryScore > 0 ? 'needs-review' : 'new';

  const masteryIcon = masteryScore >= 80 ? '🟢' :
    masteryScore >= 50 ? '🟡' :
      masteryScore > 0 ? '🔴' : '⚪';

  notionDiv.innerHTML = `
    <div class="notion-content">
      <span class="mastery-icon">${masteryIcon}</span>
      <div class="notion-info">
        <div class="notion-name">${notion.name}</div>
        <div class="notion-meta">
          <span class="difficulty difficulty-${notion.difficulty.toLowerCase()}">${notion.difficulty}</span>
          <span class="time">⏱️ ${notion.estimatedTime} min</span>
          <span class="count">${notion.questionCount} questions</span>
          ${masteryInfo ? `<span class="mastery-score">${Math.round(masteryScore)}%</span>` : ''}
        </div>
      </div>
    </div>
  `;

  notionDiv.addEventListener('click', () => toggleNotion(notion));

  container.appendChild(notionDiv);

  // Sub-notions
  if (notion.subNotions && notion.subNotions.length > 0) {
    const subNotionsContainer = document.createElement('div');
    subNotionsContainer.className = 'sub-notions-container';

    notion.subNotions.forEach(subNotion => {
      const subDiv = document.createElement('div');
      subDiv.className = 'sub-notion-item';
      subDiv.innerHTML = `
        <span>${subNotion.name}</span>
        <span class="count">${subNotion.questionCount}</span>
      `;
      subNotionsContainer.appendChild(subDiv);
    });

    container.appendChild(subNotionsContainer);
  }
}

function renderClassicThemes() {
  // Mode classique quand pas de structure
  const themeCounts = new Map<string, number>();
  availableQuestions.forEach(q => {
    const tags = q.topics || [];
    tags.forEach(tag => {
      themeCounts.set(tag, (themeCounts.get(tag) || 0) + 1);
    });
  });

  const grid = document.getElementById('themes-grid')!;

  if (themeCounts.size === 0) {
    grid.innerHTML = '<p style="width: 100%; text-align: center; color: var(--dark-alt);">Aucun thème disponible</p>';
    return;
  }

  const sortedThemes = Array.from(themeCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  sortedThemes.forEach(([theme, count]) => {
    const chip = document.createElement('div');
    chip.className = 'theme-chip';
    chip.dataset.theme = theme;
    chip.setAttribute('role', 'checkbox');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('aria-checked', 'false');
    chip.setAttribute('aria-label', `Thème ${theme} - ${count} question${count > 1 ? 's' : ''}`);
    chip.innerHTML = `
      <span>${theme}</span>
      <span class="count">${count}</span>
    `;
    
    // Click toggle
    chip.addEventListener('click', () => toggleTheme(theme));
    
    // Keyboard support: Enter or Space to toggle
    chip.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme(theme);
      }
    });
    
    grid.appendChild(chip);
  });
}

function renderStructuredPlan() {
  if (!currentStructure) return;

  const grid = document.getElementById('themes-grid')!;
  const subject = SUBJECTS.find(s => s.id === selectedSubject);
  
  // Calculate question counts for notions based on tags
  const notionQuestionCounts = new Map<string, number>();
  availableQuestions.forEach(q => {
    const tags = q.topics || [];
    // Match question tags with notion tags
    currentStructure!.chapters.forEach(chapter => {
      chapter.notions.forEach(notion => {
        const hasMatchingTag = notion.tags.some(tag => 
          tags.some(qTag => qTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (hasMatchingTag) {
          notionQuestionCounts.set(notion.id, (notionQuestionCounts.get(notion.id) || 0) + 1);
        }
      });
    });
  });

  // Update notion question counts
  currentStructure.chapters.forEach(chapter => {
    chapter.notions.forEach(notion => {
      notion.questionCount = notionQuestionCounts.get(notion.id) || 0;
    });
  });

  // Switch grid to column mode
  grid.classList.add('structured-plan-mode');

  // Slim header bar
  const headerSection = document.createElement('div');
  headerSection.className = 'structured-plan-header';
  const totalNotions = currentStructure.chapters.reduce((sum, c) => sum + c.notions.length, 0);
  headerSection.innerHTML = `
    <div class="plan-header-info">
      <span class="plan-header-title">📖 ${subject?.name || 'Plan du cours'}</span>
      <span class="plan-header-stats">${availableQuestions.length} questions &bull; ${currentStructure.chapters.length} chapitres &bull; ${totalNotions} notions</span>
    </div>
    <div class="selection-actions">
      <button id="select-all-notions-btn" class="btn btn-sm btn-secondary">✓ Tout sélectionner</button>
      <button id="clear-all-notions-btn" class="btn btn-sm btn-outline">✕ Tout décocher</button>
    </div>
  `;
  grid.appendChild(headerSection);

  // Event listeners for select/clear all
  headerSection.querySelector('#select-all-notions-btn')!.addEventListener('click', selectAllNotions);
  headerSection.querySelector('#clear-all-notions-btn')!.addEventListener('click', clearAllNotions);

  // Render chapters
  currentStructure.chapters.forEach((chapter, index) => {
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'plan-chapter';
    chapterDiv.style.marginTop = index === 0 ? '2rem' : '1rem';

    const chapterHeader = document.createElement('div');
    chapterHeader.className = 'plan-chapter-header';
    const totalChapterQuestions = chapter.notions.reduce((sum, n) => sum + n.questionCount, 0);
    chapterHeader.innerHTML = `
      <span class="plan-toggle">▼</span>
      <strong>${chapter.name}</strong>
      <span class="plan-count">${totalChapterQuestions} questions</span>
    `;

    const notionsContainer = document.createElement('div');
    notionsContainer.className = 'plan-notions-container';

    chapter.notions.forEach(notion => {
      const notionDiv = document.createElement('div');
      notionDiv.className = 'plan-notion-item';
      notionDiv.dataset.notionId = notion.id;
      
      const isSelected = selectedNotions.has(notion.id);
      notionDiv.classList.toggle('selected', isSelected);

      // Get mastery info
      const masteryInfo = selectedSubject ? simpleProgress.getNotionProgress(selectedSubject, notion.id) : null;
      const masteryScore = masteryInfo?.score || 0;
      const masteryIcon = masteryScore >= 80 ? '🟢' : masteryScore >= 50 ? '🟡' : masteryScore > 0 ? '🔴' : '⚪';

      notionDiv.innerHTML = `
        <input type="checkbox" id="notion-${notion.id}" ${isSelected ? 'checked' : ''} style="width:15px;height:15px;flex-shrink:0;accent-color:var(--primary);cursor:pointer;">
        <label for="notion-${notion.id}" class="notion-row-label">
          <span class="notion-name">${notion.name}</span>
          <span class="notion-row-meta">
            <span class="difficulty difficulty-${notion.difficulty.toLowerCase()}">${notion.difficulty}</span>
            <span class="notion-time">⏱ ${notion.estimatedTime}min</span>
            <span class="notion-qcount">${notion.questionCount} Q</span>
            ${masteryInfo ? `<span class="mastery-dot mastery-dot-${masteryScore >= 80 ? 'green' : masteryScore >= 50 ? 'yellow' : 'red'}">${Math.round(masteryScore)}%</span>` : ''}
          </span>
        </label>
      `;

      // Click toggle
      notionDiv.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          toggleNotion(notion);
          const checkbox = notionDiv.querySelector('input') as HTMLInputElement;
          checkbox.checked = selectedNotions.has(notion.id);
          notionDiv.classList.toggle('selected', selectedNotions.has(notion.id));
        }
      });

      // Checkbox change
      const checkbox = notionDiv.querySelector('input') as HTMLInputElement;
      checkbox.addEventListener('change', () => {
        toggleNotion(notion);
        notionDiv.classList.toggle('selected', selectedNotions.has(notion.id));
      });

      notionsContainer.appendChild(notionDiv);
    });

    chapterDiv.appendChild(chapterHeader);
    chapterDiv.appendChild(notionsContainer);

    // Toggle collapse
    chapterHeader.addEventListener('click', () => {
      notionsContainer.classList.toggle('collapsed');
      const toggle = chapterHeader.querySelector('.plan-toggle')!;
      toggle.textContent = notionsContainer.classList.contains('collapsed') ? '▶' : '▼';
    });

    grid.appendChild(chapterDiv);
  });

  updateSummary();
}

function selectAllNotions() {
  if (!currentStructure) return;
  currentStructure.chapters.forEach(chapter => {
    chapter.notions.forEach(notion => {
      selectedNotions.add(notion.id);
      notion.tags.forEach(tag => selectedThemes.add(tag));
    });
  });
  renderStructuredPlan();
}

function clearAllNotions() {
  selectedNotions.clear();
  selectedThemes.clear();
  renderStructuredPlan();
}

function toggleNotion(notion: Notion) {
  if (selectedNotions.has(notion.id)) {
    selectedNotions.delete(notion.id);
    // Retirer tous les tags de cette notion
    notion.tags.forEach(tag => {
      selectedThemes.delete(tag);
    });
  } else {
    selectedNotions.add(notion.id);
    // Ajouter tous les tags de cette notion
    notion.tags.forEach(tag => {
      selectedThemes.add(tag);
    });
  }
  updateNotionUI();
  updateQuizConfig();
}

function toggleTheme(theme: string) {
  if (selectedThemes.has(theme)) {
    selectedThemes.delete(theme);
  } else {
    selectedThemes.add(theme);
  }

  updateThemeUI();
  updateQuizConfig();
}

function updateNotionUI() {
  document.querySelectorAll('.notion-item').forEach(item => {
    const notionId = item.getAttribute('data-notion-id')!;
    if (selectedNotions.has(notionId)) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function updateThemeUI() {
  document.querySelectorAll('.theme-chip').forEach(chip => {
    const theme = chip.getAttribute('data-theme')!;
    if (selectedThemes.has(theme)) {
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
    } else {
      chip.classList.remove('selected');
      chip.setAttribute('aria-checked', 'false');
    }
  });
}

function filterThemes(query: string) {
  document.querySelectorAll('.theme-chip').forEach(chip => {
    const theme = chip.getAttribute('data-theme')!.toLowerCase();
    if (theme.includes(query)) {
      (chip as HTMLElement).style.display = 'inline-flex';
    } else {
      (chip as HTMLElement).style.display = 'none';
    }
  });
}

function selectAllThemes() {
  if (currentStructure) {
    // Mode hiérarchique
    currentStructure.chapters.forEach(chapter => {
      chapter.notions.forEach(notion => {
        selectedNotions.add(notion.id);
        notion.tags.forEach(tag => selectedThemes.add(tag));
      });
    });
    updateNotionUI();
  } else {
    // Mode classique
    document.querySelectorAll('.theme-chip').forEach(chip => {
      const theme = chip.getAttribute('data-theme')!;
      if ((chip as HTMLElement).style.display !== 'none') {
        selectedThemes.add(theme);
      }
    });
    updateThemeUI();
  }
  updateQuizConfig();
}

function clearAllThemes() {
  selectedThemes.clear();
  selectedNotions.clear();

  if (currentStructure) {
    updateNotionUI();
  } else {
    updateThemeUI();
  }
  updateQuizConfig();
}

// ========================================
// QUIZ CONFIGURATION
// ========================================

function updateQuizConfig() {
  const configSection = document.getElementById('quiz-config')!;

  if (selectedThemes.size === 0) {
    configSection.classList.remove('active');
    return;
  }

  configSection.classList.add('active');
  updateSummary();

  // Scroll to config
  setTimeout(() => {
    configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function updateSummary() {
  // Filtrer les questions par thèmes sélectionnés
  const filteredQuestions = availableQuestions.filter(q => {
    const tags = q.topics || [];
    const match = selectedThemes.size === 0 || tags.some(tag => selectedThemes.has(tag));
    return match;
  });
  if (filteredQuestions.length > 0 && filteredQuestions.length <= 5) {
  }

  const totalQuestions = filteredQuestions.length;
  const nbQuestionsInput = document.getElementById('nb-questions') as HTMLInputElement;
  const startBtn = document.getElementById('start-quiz-btn') as HTMLButtonElement;

  // Update summary
  document.getElementById('summary-total')!.textContent = totalQuestions.toString();
  document.getElementById('summary-themes')!.textContent = selectedThemes.size.toString();
  document.getElementById('summary-subject')!.textContent =
    SUBJECTS.find(s => s.id === selectedSubject)?.name || '-';

  // Update max questions
  nbQuestionsInput.max = totalQuestions.toString();
  if (parseInt(nbQuestionsInput.value) > totalQuestions) {
    nbQuestionsInput.value = totalQuestions.toString();
  }

  // Enable/disable start button
  startBtn.disabled = totalQuestions === 0;
}

// ========================================
// START QUIZ
// ========================================

async function startQuiz() {
  if (!selectedSubject) {
    return;
  }

  // Mode adaptatif : créer un parcours optimisé
  if (learningMode === 'adaptive') {
    await startAdaptiveQuiz();
    return;
  }

  // Mode révision : notions à revoir
  if (learningMode === 'review') {
    await startReviewQuiz();
    return;
  }

  // Mode manuel : configuration classique
  const nbQuestions = parseInt((document.getElementById('nb-questions') as HTMLInputElement).value);
  const mode = (document.getElementById('quiz-mode') as HTMLSelectElement).value;
  const minDifficulty = (document.getElementById('min-difficulty') as HTMLSelectElement).value;
  const shuffle = (document.getElementById('shuffle-questions') as HTMLInputElement).checked;
  const shuffleAnswers = (document.getElementById('shuffle-answers') as HTMLInputElement).checked;
  const showExplanations = (document.getElementById('show-explanations') as HTMLInputElement).checked;

  // Filtrer les questions
  let questions = availableQuestions.filter(q => {
    const tags = q.topics || [];
    return selectedThemes.size === 0 || tags.some(tag => selectedThemes.has(tag));
  });
  // Filtrer par difficulté
  const difficultyOrder = ['Facile', 'Moyen', 'Difficile', 'Expert'];
  const minDiffIndex = difficultyOrder.indexOf(minDifficulty);
  questions = questions.filter(q => {
    const qDiff = getDifficulty(q);
    const qIndex = difficultyOrder.indexOf(qDiff);
    return qIndex >= minDiffIndex;
  });

  // Mélanger si demandé
  if (shuffle) {
    questions = shuffleArray(questions);
  }

  // Limiter le nombre
  questions = questions.slice(0, nbQuestions);
  if (questions.length === 0) {
    alert('Aucune question disponible pour cette sélection.\n\nVérifiez vos filtres (thèmes, difficulté).');
    return;
  }

  // Sauvegarder la config dans sessionStorage
  const config = {
    questions: questions,
    mode,
    shuffleAnswers,
    showExplanations,
    subject: selectedSubject,
    themes: Array.from(selectedThemes),
    learningMode,
    retryWrongAnswers: true, // NOUVEAU : toujours actif dans nouvelle interface
    maxRetries: 3 // NOUVEAU : maximum 3 passages par question
  };
  sessionStorage.setItem('quizConfig', JSON.stringify(config));  // Rediriger vers la page de quiz
  window.location.href = '/quiz.html';
}

async function startAdaptiveQuiz() {
  if (!selectedSubject) return;

  // Filtrer les questions selon la sélection
  let questions = availableQuestions;
  if (selectedThemes.size > 0) {
    questions = questions.filter(q => {
      const tags = q.topics || [];
      return tags.some(tag => selectedThemes.has(tag));
    });
  }

  if (questions.length === 0) {
    alert('Aucune question disponible pour cette sélection.');
    return;
  }

  // Mode adaptatif simplifié : trier par score (priorité aux notions faibles)
  const questionsWithScore = questions.map(q => {
    const tags = q.topics || [];
    const avgScore = tags.reduce((sum, tag) => {
      const progress = simpleProgress.getNotionProgress(selectedSubject!, tag);
      return sum + (progress?.score || 0);
    }, 0) / (tags.length || 1);
    return { question: q, avgScore };
  });

  // Trier : score faible d'abord
  questionsWithScore.sort((a, b) => a.avgScore - b.avgScore);

  // Prendre N questions selon le champ nb-questions
  const nbQuestions = parseInt((document.getElementById('nb-questions') as HTMLInputElement).value) || 20;
  const selectedQuestions = questionsWithScore.slice(0, nbQuestions).map(item => item.question);
  // Sauvegarder la config dans sessionStorage
  const config = {
    questions: selectedQuestions,
    mode: 'entrainement',
    shuffleAnswers: true,
    showExplanations: true,
    subject: selectedSubject,
    themes: Array.from(selectedThemes),
    learningMode: 'adaptive',
    retryWrongAnswers: true,
    maxRetries: 3
  };
  sessionStorage.setItem('quizConfig', JSON.stringify(config));

  // Rediriger vers la page de quiz
  window.location.href = '/quiz.html';
}

async function startReviewQuiz() {
  if (!selectedSubject) return;

  // Get notions sorted by score (lowest first = needs review)
  const notionsDue = simpleProgress.getNotionsByScore(selectedSubject).slice(0, 10); // Top 10 lowest scores

  if (notionsDue.length === 0) {
    alert('🎉 Aucune notion à réviser pour le moment!\n\nRevenez plus tard ou choisissez le mode adaptatif.');
    return;
  }

  // Récupérer les questions des notions à revoir
  const allTags = new Set<string>();
  notionsDue.forEach(notion => {
    allTags.add(notion.notionId);
  });

  const questions = availableQuestions.filter(q => {
    const tags = q.topics || [];
    return tags.some(tag => allTags.has(tag));
  });

  if (questions.length === 0) {
    alert('Aucune question trouvée pour les notions à réviser.');
    return;
  }

  // Limiter selon le champ nb-questions
  const nbQuestionsReview = parseInt((document.getElementById('nb-questions') as HTMLInputElement).value) || 20;
  const selectedQuestions = questions.slice(0, nbQuestionsReview);
  // Sauvegarder la config dans sessionStorage
  const config = {
    questions: selectedQuestions,
    mode: 'entrainement',
    shuffleAnswers: true,
    showExplanations: true,
    subject: selectedSubject,
    themes: Array.from(allTags),
    learningMode: 'review',
    retryWrongAnswers: true,
    maxRetries: 3
  };
  sessionStorage.setItem('quizConfig', JSON.stringify(config));

  // Rediriger vers la page de quiz
  window.location.href = '/quiz.html';
}

function showLearningPathSummary(path: LearningPath) {
  const summary = `
📚 Parcours d'apprentissage créé!

🎯 Sessions: ${path.sessions.length}
📝 Total de questions: ${path.totalQuestions}
⏱️ Durée estimée: ${Math.round(path.estimatedTotalDuration)} minutes
🔢 Notions couvertes: ${path.notionsCovered.length}

Détails des sessions:
${path.sessions.map((s, i) =>
    `Session ${i + 1}: ${s.type} - ${s.questions.length}q (${Math.round(s.estimatedDuration)}min)`
  ).join('\n')}

✨ Chaque session mélange 2 questions de révision + 3 nouvelles!
  `;

  alert(summary);

  // Sauvegarder le parcours
  sessionStorage.setItem('learningPath', JSON.stringify(path));
  sessionStorage.setItem('currentSessionIndex', '0');

  // TODO: Rediriger vers l'interface de session
  // window.location.href = '../session.html';
}

// ========================================
// UTILITIES
// ========================================

function getDifficulty(question: Question): 'Facile' | 'Moyen' | 'Difficile' | 'Expert' {
  const tags = question.tags || [];
  const difficulties = ['Facile', 'Moyen', 'Difficile', 'Expert'];
  const found = tags.find(tag => difficulties.includes(tag));
  return (found as any) || 'Moyen';
}

// ========================================
// START
// ========================================

init();
