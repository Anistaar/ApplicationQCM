// SOLUTION RAPIDE : Chargement direct depuis fichiers
// Ce fichier remplace temporairement app.ts pour faire fonctionner le quiz immédiatement
import { parseText2Quiz } from '../parser';
const SUBJECTS = [
    {
        id: 'TEST',
        name: 'Matière TEST',
        icon: '🧪',
        files: [
            '/src/questions/TEST/definitions.txt',
            '/src/questions/TEST/apprentissage.txt',
            '/src/questions/TEST/organisation.txt',
            '/src/questions/TEST/statistiques.txt',
            '/src/questions/TEST/technique.txt'
        ]
    }
];
let selectedSubject = null;
let selectedThemes = new Set();
let availableQuestions = [];
// INIT
async function init() {
    renderSubjects();
    setupEventListeners();
}
function setupEventListeners() {
    const selectAllBtn = document.getElementById('select-all-themes');
    const clearBtn = document.getElementById('clear-themes');
    const startBtn = document.getElementById('start-quiz-btn');
    if (selectAllBtn)
        selectAllBtn.addEventListener('click', selectAllThemes);
    if (clearBtn)
        clearBtn.addEventListener('click', clearAllThemes);
    if (startBtn)
        startBtn.addEventListener('click', startQuiz);
}
function renderSubjects() {
    const grid = document.getElementById('subjects-grid');
    if (!grid)
        return;
    grid.innerHTML = '';
    SUBJECTS.forEach((subject) => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        card.innerHTML = `
      <div class="icon">${subject.icon}</div>
      <div class="name">${subject.name}</div>
      <div class="count">Cliquez pour charger</div>
    `;
        card.addEventListener('click', () => selectSubject(subject.id));
        grid.appendChild(card);
    });
    const emptyState = document.getElementById('empty-state');
    const subjectsGrid = document.getElementById('subjects-grid');
    if (emptyState)
        emptyState.style.display = 'none';
    if (subjectsGrid)
        subjectsGrid.style.display = 'grid';
}
async function selectSubject(subjectId) {
    selectedSubject = subjectId;
    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (!subject)
        return;
    const themesGrid = document.getElementById('themes-grid');
    if (!themesGrid)
        return;
    themesGrid.innerHTML = '<div style="text-align:center;padding:2rem;">Chargement...</div>';
    // Charger TOUTES les questions depuis les fichiers
    availableQuestions = [];
    for (const file of subject.files) {
        try {
            const response = await fetch(file);
            const content = await response.text();
            const questions = parseText2Quiz(content);
            availableQuestions.push(...questions);
            console.log(`✅ Chargé ${file}: ${questions.length} questions`);
        }
        catch (e) {
            console.error(`Erreur chargement ${file}:`, e);
        }
    }
    console.log(`✅ Total: ${availableQuestions.length} questions`);
    // Afficher les thèmes
    renderThemes();
    const themesSection = document.getElementById('themes-section');
    if (themesSection)
        themesSection.classList.add('active');
}
function renderThemes() {
    const themesGrid = document.getElementById('themes-grid');
    if (!themesGrid)
        return;
    const allThemes = new Set();
    availableQuestions.forEach(q => {
        if (q.topics)
            q.topics.forEach(t => allThemes.add(t));
    });
    themesGrid.innerHTML = '';
    Array.from(allThemes).sort().forEach(theme => {
        const count = availableQuestions.filter(q => q.topics?.includes(theme)).length;
        const chip = document.createElement('div');
        chip.className = 'theme-chip';
        chip.dataset.theme = theme;
        chip.innerHTML = `${theme} <span class="count">${count}</span>`;
        chip.addEventListener('click', () => toggleTheme(theme));
        themesGrid.appendChild(chip);
    });
    updateSummary();
}
function toggleTheme(theme) {
    if (selectedThemes.has(theme)) {
        selectedThemes.delete(theme);
    }
    else {
        selectedThemes.add(theme);
    }
    updateThemeUI();
    updateSummary();
}
function selectAllThemes() {
    selectedThemes.clear();
    availableQuestions.forEach(q => {
        if (q.topics)
            q.topics.forEach(t => selectedThemes.add(t));
    });
    updateThemeUI();
    updateSummary();
}
function clearAllThemes() {
    selectedThemes.clear();
    updateThemeUI();
    updateSummary();
}
function updateThemeUI() {
    document.querySelectorAll('.theme-chip').forEach(chip => {
        const theme = chip.getAttribute('data-theme');
        if (!theme)
            return;
        if (selectedThemes.has(theme)) {
            chip.classList.add('selected');
        }
        else {
            chip.classList.remove('selected');
        }
    });
}
function updateSummary() {
    const questions = availableQuestions.filter(q => q.topics?.some(t => selectedThemes.has(t)));
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
        selectedCount.textContent = `${questions.length}`;
    }
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
        startBtn.disabled = questions.length === 0;
    }
}
function startQuiz() {
    const questions = availableQuestions.filter(q => q.topics?.some(t => selectedThemes.has(t)));
    if (questions.length === 0) {
        alert('Veuillez sélectionner au moins un thème');
        return;
    }
    // Sauvegarder dans sessionStorage
    const config = {
        questions: questions,
        mode: 'manual',
        shuffleAnswers: true,
        showExplanations: true,
        subject: selectedSubject,
        themes: Array.from(selectedThemes),
        learningMode: 'manual'
    };
    sessionStorage.setItem('quizConfig', JSON.stringify(config));
    window.location.href = '/quiz.html';
}
// Start
init();
