// src/new-ui/app.ts
// Application principale - chargement direct depuis fichiers .txt
// Pas de base de données - tout en localStorage
import { parseText2Quiz } from '../parser';
import { simpleProgress } from '../database/SimpleProgress';
// ========================================
// CONFIGURATION DES MATIÈRES
// ========================================
const SUBJECTS = [
    { id: 'TEST', name: 'Matière TEST', icon: '🧪', file: '/src/questions/TEST/definitions.txt' },
    { id: 'MACRO', name: 'Macroéconomie', icon: '📊', file: '/src/questions/S1/MACRO/MACRO_QUESTIONS_COMPLETE_v2.txt' },
    { id: 'INSTIT', name: 'Institutions', icon: '🏛️', file: '/src/questions/S1/INSTIT/FMI_QCM_EXHAUSTIF_v1.txt' },
    { id: 'STATS', name: 'Statistiques', icon: '📈', file: '/src/questions/S1/STATS/stats_chap1_banque_facile.txt' },
    { id: 'DROITPRIVE', name: 'Droit privé', icon: '⚖️', file: '/src/questions/S1/DROIT/DROITPRIVE_CH3_CH4_v1.txt' }
];
// ========================================
// STATE
// ========================================
let selectedSubject = null;
let selectedNotions = new Set();
let selectedThemes = new Set();
let availableQuestions = [];
let currentStructure = null;
let learningMode = 'adaptive';
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
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('subjects-grid').style.display = 'none';
}
function hideEmptyState() {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('subjects-grid').style.display = 'grid';
}
// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Theme search
    document.getElementById('theme-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterThemes(query);
    });
    // Theme actions
    document.getElementById('select-all-themes').addEventListener('click', selectAllThemes);
    document.getElementById('clear-themes').addEventListener('click', clearAllThemes);
    // Start quiz
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    // Config changes
    document.getElementById('nb-questions').addEventListener('change', updateSummary);
}
// ========================================
// SUBJECTS
// ========================================
function renderSubjects() {
    const grid = document.getElementById('subjects-grid');
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
async function selectSubject(subjectId) {
    console.log('🎯 selectSubject appelé:', subjectId);
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
    const themesGrid = document.getElementById('themes-grid');
    themesGrid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-secondary);"><div class="spinner" style="display:inline-block;width:40px;height:40px;border:4px solid var(--border-color);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:var(--text-primary);">Chargement des questions...</p></div>';
    console.log('✅ Loader affiché dans themes-grid');
    // Load structure and questions
    await loadSubjectStructure(subjectId);
    await loadQuestionsForSubject(subjectId);
    // Render hierarchical view
    console.log('📊 Appel de renderHierarchicalView...');
    renderHierarchicalView();
    console.log('✅ renderHierarchicalView terminé');
    // Show themes section
    const themesSection = document.getElementById('themes-section');
    themesSection.classList.add('active');
    console.log('✅ themes-section rendu visible:', themesSection.style.display);
    // Scroll to themes
    document.getElementById('themes-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function loadSubjectStructure(subjectId) {
    try {
        // Charger la structure depuis le fichier JSON complete
        const structureFile = `/src/database/structures/${subjectId}_complete.json`;
        console.log(`📂 Tentative de chargement structure: ${structureFile}`);
        const response = await fetch(structureFile);
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Structure chargée pour ${subjectId}:`, data);
            // Transformer la structure complete en format SubjectStructure
            currentStructure = {
                chapters: data.chapters.map((chap) => ({
                    id: chap.id,
                    name: `${chap.number}. ${chap.name}`,
                    notions: extractNotionsFromChapter(chap)
                })),
                authors: data.crossCutting?.authors?.items?.map((author) => ({
                    id: author.id,
                    name: author.name,
                    tags: author.tags || [],
                    questionCount: 0 // Will be calculated from questions
                })) || []
            };
            console.log(`✅ Structure transformée:`, currentStructure);
        }
        else {
            console.log(`ℹ️ Pas de structure trouvée pour ${subjectId} (status: ${response.status}), mode classique activé`);
            currentStructure = null;
        }
    }
    catch (error) {
        console.log(`ℹ️ Pas de structure JSON pour ${subjectId}, mode classique activé`, error);
        currentStructure = null;
    }
}
function extractNotionsFromChapter(chapter) {
    const notions = [];
    // Parcourir sections -> subsections -> notions
    chapter.sections?.forEach((section) => {
        section.subsections?.forEach((subsection) => {
            subsection.notions?.forEach((notion) => {
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
async function loadQuestionsForSubject(subjectId) {
    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (!subject) {
        console.error('❌ Matière introuvable:', subjectId);
        return;
    }
    console.log(`🔄 Chargement de ${subjectId} depuis: ${subject.file}`);
    try {
        const response = await fetch(subject.file);
        console.log(`📡 Réponse fetch: status=${response.status}, ok=${response.ok}`);
        if (!response.ok) {
            throw new Error(`Fichier introuvable: ${subject.file} (status: ${response.status})`);
        }
        const text = await response.text();
        console.log(`📄 Texte reçu: ${text.length} caractères`);
        availableQuestions = parseText2Quiz(text);
        console.log(`✅ ${subjectId}: ${availableQuestions.length} questions parsées`);
        // Mettre à jour le compteur dans la carte
        const card = document.querySelector(`[data-subject-id="${subjectId}"]`);
        if (card) {
            const countDiv = card.querySelector('.count');
            const themes = new Set(availableQuestions.flatMap(q => q.topics || []));
            if (countDiv) {
                countDiv.textContent = `${availableQuestions.length} questions • ${themes.size} thèmes`;
            }
        }
        console.log(`🎯 Thèmes disponibles:`, [...new Set(availableQuestions.flatMap(q => q.topics || []))]);
    }
    catch (error) {
        console.error('❌ Erreur chargement:', error);
        alert(`Impossible de charger ${subject.name}\n\nErreur: ${error}`);
        availableQuestions = [];
    }
}
// ========================================
// HIERARCHICAL VIEW
// ========================================
function renderHierarchicalView() {
    const grid = document.getElementById('themes-grid');
    grid.innerHTML = '';
    if (!currentStructure) {
        // Mode classique : afficher le plan puis les thèmes
        renderCoursePlan();
        renderClassicThemes();
        return;
    }
    // Mode hiérarchique : afficher les chapitres et notions
    console.log('📊 Rendu hiérarchique avec structure JSON');
    renderStructuredPlan();
}
function renderCoursePlan() {
    if (!selectedSubject)
        return;
    const grid = document.getElementById('themes-grid');
    const subject = SUBJECTS.find(s => s.id === selectedSubject);
    if (!subject)
        return;
    // Analyser la structure depuis les questions
    const chaptersMap = new Map();
    const allThemes = new Set();
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
                const chapter = chaptersMap.get(chapterName);
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
        const toggleBtn = planSection.querySelector('.toggle-plan-btn');
        const planContent = planSection.querySelector('.course-plan-content');
        toggleBtn.addEventListener('click', () => {
            if (planContent.style.display === 'none') {
                planContent.style.display = 'block';
                toggleBtn.textContent = 'Masquer le plan';
            }
            else {
                planContent.style.display = 'none';
                toggleBtn.textContent = 'Afficher le plan complet';
            }
        });
        // Toggle chapters
        planSection.querySelectorAll('.plan-chapter-header').forEach(header => {
            header.addEventListener('click', () => {
                const topics = header.nextElementSibling;
                const toggle = header.querySelector('.plan-toggle');
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
    const grid = document.getElementById('themes-grid');
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
            learningMode = btn.getAttribute('data-mode');
            renderHierarchicalView();
        });
    });
}
function renderChapters() {
    if (!currentStructure)
        return;
    const grid = document.getElementById('themes-grid');
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
            const icon = chapterHeader.querySelector('.toggle-icon');
            icon.textContent = notionsContainer.classList.contains('collapsed') ? '▶' : '▼';
        });
        grid.appendChild(chapterDiv);
    });
}
async function renderNotion(container, notion, chapterId) {
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
    const themeCounts = new Map();
    availableQuestions.forEach(q => {
        const tags = q.topics || [];
        tags.forEach(tag => {
            themeCounts.set(tag, (themeCounts.get(tag) || 0) + 1);
        });
    });
    const grid = document.getElementById('themes-grid');
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
        chip.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme(theme);
            }
        });
        grid.appendChild(chip);
    });
}
function renderStructuredPlan() {
    if (!currentStructure)
        return;
    const grid = document.getElementById('themes-grid');
    const subject = SUBJECTS.find(s => s.id === selectedSubject);
    // Calculate question counts for notions based on tags
    const notionQuestionCounts = new Map();
    availableQuestions.forEach(q => {
        const tags = q.topics || [];
        // Match question tags with notion tags
        currentStructure.chapters.forEach(chapter => {
            chapter.notions.forEach(notion => {
                const hasMatchingTag = notion.tags.some(tag => tags.some(qTag => qTag.toLowerCase().includes(tag.toLowerCase())));
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
    // Header section
    const headerSection = document.createElement('div');
    headerSection.className = 'structured-plan-header';
    headerSection.innerHTML = `
    <h3>📖 ${subject?.name || 'Plan du cours'}</h3>
    <p style="color: var(--text-secondary); margin-top: 0.5rem;">
      ${availableQuestions.length} questions • ${currentStructure.chapters.length} chapitres • 
      ${currentStructure.chapters.reduce((sum, c) => sum + c.notions.length, 0)} notions
    </p>
    <div class="selection-actions" style="margin-top: 1rem; display: flex; gap: 1rem;">
      <button id="select-all-notions-btn" class="btn btn-secondary">✅ Tout sélectionner</button>
      <button id="clear-all-notions-btn" class="btn btn-secondary">❌ Tout désélectionner</button>
    </div>
  `;
    grid.appendChild(headerSection);
    // Event listeners for select/clear all
    headerSection.querySelector('#select-all-notions-btn').addEventListener('click', selectAllNotions);
    headerSection.querySelector('#clear-all-notions-btn').addEventListener('click', clearAllNotions);
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
        <div class="notion-checkbox">
          <input type="checkbox" id="notion-${notion.id}" ${isSelected ? 'checked' : ''}>
        </div>
        <label for="notion-${notion.id}" class="notion-label">
          <span class="mastery-icon">${masteryIcon}</span>
          <div class="notion-info">
            <div class="notion-name">${notion.name}</div>
            <div class="notion-meta">
              <span class="difficulty difficulty-${notion.difficulty.toLowerCase()}">${notion.difficulty}</span>
              <span class="time">⏱️ ${notion.estimatedTime}min</span>
              <span class="count">${notion.questionCount} Q</span>
              ${masteryInfo ? `<span class="mastery-score">${Math.round(masteryScore)}%</span>` : ''}
            </div>
          </div>
        </label>
      `;
            // Click toggle
            notionDiv.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    toggleNotion(notion);
                    const checkbox = notionDiv.querySelector('input');
                    checkbox.checked = selectedNotions.has(notion.id);
                    notionDiv.classList.toggle('selected', selectedNotions.has(notion.id));
                }
            });
            // Checkbox change
            const checkbox = notionDiv.querySelector('input');
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
            const toggle = chapterHeader.querySelector('.plan-toggle');
            toggle.textContent = notionsContainer.classList.contains('collapsed') ? '▶' : '▼';
        });
        grid.appendChild(chapterDiv);
    });
    updateSummary();
}
function selectAllNotions() {
    if (!currentStructure)
        return;
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
function toggleNotion(notion) {
    console.log('🎯 toggleNotion() appelée pour:', notion.id, notion.name);
    console.log('  Tags de la notion:', notion.tags);
    if (selectedNotions.has(notion.id)) {
        console.log('  ➡️ Désélection de la notion');
        selectedNotions.delete(notion.id);
        // Retirer tous les tags de cette notion
        notion.tags.forEach(tag => {
            console.log('    Retrait du tag:', tag);
            selectedThemes.delete(tag);
        });
    }
    else {
        console.log('  ➡️ Sélection de la notion');
        selectedNotions.add(notion.id);
        // Ajouter tous les tags de cette notion
        notion.tags.forEach(tag => {
            console.log('    Ajout du tag:', tag);
            selectedThemes.add(tag);
        });
    }
    console.log('  📊 État final:');
    console.log('    selectedNotions:', Array.from(selectedNotions));
    console.log('    selectedThemes:', Array.from(selectedThemes));
    updateNotionUI();
    updateQuizConfig();
}
function toggleTheme(theme) {
    if (selectedThemes.has(theme)) {
        selectedThemes.delete(theme);
    }
    else {
        selectedThemes.add(theme);
    }
    updateThemeUI();
    updateQuizConfig();
}
function updateNotionUI() {
    document.querySelectorAll('.notion-item').forEach(item => {
        const notionId = item.getAttribute('data-notion-id');
        if (selectedNotions.has(notionId)) {
            item.classList.add('selected');
        }
        else {
            item.classList.remove('selected');
        }
    });
}
function updateThemeUI() {
    document.querySelectorAll('.theme-chip').forEach(chip => {
        const theme = chip.getAttribute('data-theme');
        if (selectedThemes.has(theme)) {
            chip.classList.add('selected');
            chip.setAttribute('aria-checked', 'true');
        }
        else {
            chip.classList.remove('selected');
            chip.setAttribute('aria-checked', 'false');
        }
    });
}
function filterThemes(query) {
    document.querySelectorAll('.theme-chip').forEach(chip => {
        const theme = chip.getAttribute('data-theme').toLowerCase();
        if (theme.includes(query)) {
            chip.style.display = 'inline-flex';
        }
        else {
            chip.style.display = 'none';
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
    }
    else {
        // Mode classique
        document.querySelectorAll('.theme-chip').forEach(chip => {
            const theme = chip.getAttribute('data-theme');
            if (chip.style.display !== 'none') {
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
    }
    else {
        updateThemeUI();
    }
    updateQuizConfig();
}
// ========================================
// QUIZ CONFIGURATION
// ========================================
function updateQuizConfig() {
    const configSection = document.getElementById('quiz-config');
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
    console.log('📊 updateSummary() appelée');
    console.log('  - availableQuestions:', availableQuestions.length);
    console.log('  - selectedThemes:', Array.from(selectedThemes));
    console.log('  - selectedNotions:', Array.from(selectedNotions));
    // Filtrer les questions par thèmes sélectionnés
    const filteredQuestions = availableQuestions.filter(q => {
        const tags = q.topics || [];
        const match = selectedThemes.size === 0 || tags.some(tag => selectedThemes.has(tag));
        return match;
    });
    console.log('  📊 Questions après filtrage:', filteredQuestions.length);
    if (filteredQuestions.length > 0 && filteredQuestions.length <= 5) {
        console.log('  📝 Échantillon de questions filtrées:', filteredQuestions.map(q => ({ question: q.question.substring(0, 40), topics: q.topics })));
    }
    const totalQuestions = filteredQuestions.length;
    console.log('  ✅ totalQuestions après filtrage:', totalQuestions);
    const nbQuestionsInput = document.getElementById('nb-questions');
    const startBtn = document.getElementById('start-quiz-btn');
    // Update summary
    document.getElementById('summary-total').textContent = totalQuestions.toString();
    document.getElementById('summary-themes').textContent = selectedThemes.size.toString();
    document.getElementById('summary-subject').textContent =
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
    console.log('🚀🚀🚀 startQuiz() APPELÉE 🚀🚀🚀');
    console.log('📊 État complet:', {
        selectedSubject,
        availableQuestions: availableQuestions.length,
        selectedThemes: Array.from(selectedThemes),
        selectedNotions: Array.from(selectedNotions),
        learningMode,
        hasStructure: !!currentStructure
    });
    // Afficher les 3 premières questions disponibles
    if (availableQuestions.length > 0) {
        console.log('📝 Échantillon questions:', availableQuestions.slice(0, 3).map(q => ({
            question: q.question.substring(0, 50),
            topics: q.topics
        })));
    }
    if (!selectedSubject) {
        console.error('❌ Pas de matière sélectionnée');
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
    const nbQuestions = parseInt(document.getElementById('nb-questions').value);
    const mode = document.getElementById('quiz-mode').value;
    const minDifficulty = document.getElementById('min-difficulty').value;
    const shuffle = document.getElementById('shuffle-questions').checked;
    const shuffleAnswers = document.getElementById('shuffle-answers').checked;
    const showExplanations = document.getElementById('show-explanations').checked;
    // Filtrer les questions
    let questions = availableQuestions.filter(q => {
        const tags = q.topics || [];
        return selectedThemes.size === 0 || tags.some(tag => selectedThemes.has(tag));
    });
    console.log(`🔍 Après filtrage thèmes: ${questions.length} questions`);
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
    console.log(`✅ Questions finales: ${questions.length}/${nbQuestions} demandées`);
    if (questions.length === 0) {
        console.error('❌ Aucune question disponible après filtrage');
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
    console.log('💾 Sauvegarde de la config dans sessionStorage:', config);
    sessionStorage.setItem('quizConfig', JSON.stringify(config));
    // Vérifier que la sauvegarde a fonctionné
    const savedConfig = sessionStorage.getItem('quizConfig');
    console.log('✅ Config sauvegardée:', savedConfig ? 'OUI' : 'NON');
    // Rediriger vers la page de quiz
    console.log('🔄 Redirection vers /quiz.html');
    window.location.href = '/quiz.html';
}
async function startAdaptiveQuiz() {
    if (!selectedSubject)
        return;
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
            const progress = simpleProgress.getNotionProgress(selectedSubject, tag);
            return sum + (progress?.score || 0);
        }, 0) / (tags.length || 1);
        return { question: q, avgScore };
    });
    // Trier : score faible d'abord
    questionsWithScore.sort((a, b) => a.avgScore - b.avgScore);
    // Prendre les 10 premières questions
    const selectedQuestions = questionsWithScore.slice(0, 10).map(item => item.question);
    console.log(`🚀 Mode Adaptatif: ${selectedQuestions.length} questions sélectionnées`);
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
    console.log('💾 Sauvegarde config mode adaptatif:', config);
    sessionStorage.setItem('quizConfig', JSON.stringify(config));
    // Rediriger vers la page de quiz
    console.log('🔄 Redirection vers /quiz.html');
    window.location.href = '/quiz.html';
}
async function startReviewQuiz() {
    if (!selectedSubject)
        return;
    // Get notions sorted by score (lowest first = needs review)
    const notionsDue = simpleProgress.getNotionsByScore(selectedSubject).slice(0, 10); // Top 10 lowest scores
    if (notionsDue.length === 0) {
        alert('🎉 Aucune notion à réviser pour le moment!\n\nRevenez plus tard ou choisissez le mode adaptatif.');
        return;
    }
    // Récupérer les questions des notions à revoir
    const allTags = new Set();
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
    // Limiter à 10 questions max
    const selectedQuestions = questions.slice(0, 10);
    console.log(`📅 Mode Révision: ${selectedQuestions.length} questions, ${notionsDue.length} notions`);
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
    console.log('💾 Sauvegarde config mode révision:', config);
    sessionStorage.setItem('quizConfig', JSON.stringify(config));
    // Rediriger vers la page de quiz
    console.log('🔄 Redirection vers /quiz.html');
    window.location.href = '/quiz.html';
}
function showLearningPathSummary(path) {
    const summary = `
📚 Parcours d'apprentissage créé!

🎯 Sessions: ${path.sessions.length}
📝 Total de questions: ${path.totalQuestions}
⏱️ Durée estimée: ${Math.round(path.estimatedTotalDuration)} minutes
🔢 Notions couvertes: ${path.notionsCovered.length}

Détails des sessions:
${path.sessions.map((s, i) => `Session ${i + 1}: ${s.type} - ${s.questions.length}q (${Math.round(s.estimatedDuration)}min)`).join('\n')}

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
function getDifficulty(question) {
    const tags = question.tags || [];
    const difficulties = ['Facile', 'Moyen', 'Difficile', 'Expert'];
    const found = tags.find(tag => difficulties.includes(tag));
    return found || 'Moyen';
}
function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
// ========================================
// START
// ========================================
init();
