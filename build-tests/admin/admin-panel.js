// src/admin/admin-panel.ts
// Script TypeScript pour le panneau d'administration
import { questionDB } from '../database/QuestionDatabase';
import { importText2QuizFile, analyzeText2QuizFile } from '../database/ImportService';
// ========================================
// INITIALISATION
// ========================================
let currentTab = 'dashboard';
let selectedFiles = [];
async function init() {
    try {
        // Initialiser la base de données
        await questionDB.init();
        showToast('Base de données initialisée', 'success');
        // Charger les données initiales
        await loadDashboardStats();
        await initializeDefaultData();
        // Setup event listeners
        setupEventListeners();
    }
    catch (error) {
        showToast('Erreur d\'initialisation: ' + error.message, 'error');
    }
}
// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    // File upload
    const fileUploadZone = document.getElementById('file-upload-zone');
    const fileInput = document.getElementById('file-input');
    fileUploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files)
            handleFileSelect(Array.from(files));
    });
    // Drag & Drop
    fileUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadZone.classList.add('drag-over');
    });
    fileUploadZone.addEventListener('dragleave', () => {
        fileUploadZone.classList.remove('drag-over');
    });
    fileUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadZone.classList.remove('drag-over');
        const files = e.dataTransfer?.files;
        if (files)
            handleFileSelect(Array.from(files));
    });
    // Import button
    document.getElementById('start-import-btn').addEventListener('click', handleImport);
    // Quick actions
    document.getElementById('quick-import-btn').addEventListener('click', () => switchTab('import'));
    document.getElementById('update-stats-btn').addEventListener('click', updateAllStats);
    document.getElementById('clear-db-btn').addEventListener('click', clearDatabase);
    document.getElementById('export-db-btn').addEventListener('click', exportDatabase);
    document.getElementById('back-to-app-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    // Question filters
    document.getElementById('search-questions').addEventListener('input', filterQuestions);
    document.getElementById('filter-subject').addEventListener('change', filterQuestions);
    document.getElementById('filter-difficulty').addEventListener('change', filterQuestions);
    // Add theme/subject buttons
    document.getElementById('add-theme-btn').addEventListener('click', () => {
        showToast('Fonctionnalité en développement', 'info');
    });
    document.getElementById('add-subject-btn').addEventListener('click', () => {
        showToast('Fonctionnalité en développement', 'info');
    });
}
// ========================================
// TAB NAVIGATION
// ========================================
function switchTab(tabName) {
    currentTab = tabName;
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    // Load tab data
    switch (tabName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'questions':
            loadQuestions();
            break;
        case 'themes':
            loadThemes();
            break;
        case 'subjects':
            loadSubjects();
            break;
    }
}
// ========================================
// DASHBOARD
// ========================================
async function loadDashboardStats() {
    try {
        const questions = await questionDB.getAllQuestions();
        const themes = await questionDB.getAllThemes();
        const subjects = await questionDB.getAllSubjects();
        const expertCount = questions.filter(q => q.difficulty === 'Expert').length;
        document.getElementById('stat-total-questions').textContent = questions.length.toString();
        document.getElementById('stat-total-themes').textContent = themes.length.toString();
        document.getElementById('stat-total-subjects').textContent = subjects.length.toString();
        document.getElementById('stat-expert-questions').textContent = expertCount.toString();
    }
    catch (error) {
        showToast('Erreur de chargement des stats: ' + error.message, 'error');
    }
}
async function updateAllStats() {
    try {
        showToast('Mise à jour des statistiques...', 'info');
        await questionDB.updateThemeStatistics();
        await questionDB.updateSubjectStatistics();
        await loadDashboardStats();
        showToast('Statistiques mises à jour', 'success');
    }
    catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}
// ========================================
// FILE IMPORT
// ========================================
function handleFileSelect(files) {
    selectedFiles = files.filter(f => f.name.endsWith('.txt'));
    if (selectedFiles.length === 0) {
        showToast('Veuillez sélectionner des fichiers .txt', 'warning');
        return;
    }
    // Show preview
    const preview = document.getElementById('file-preview');
    const fileList = document.getElementById('file-list');
    preview.style.display = 'block';
    fileList.innerHTML = '';
    selectedFiles.forEach(file => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.75rem; margin: 0.5rem 0; background: white; border-radius: 8px; border: 2px solid var(--border);';
        div.innerHTML = `
      <strong>${file.name}</strong> 
      <span style="color: var(--text-light);">(${(file.size / 1024).toFixed(2)} KB)</span>
    `;
        fileList.appendChild(div);
    });
}
async function handleImport() {
    if (selectedFiles.length === 0) {
        showToast('Veuillez sélectionner au moins un fichier', 'warning');
        return;
    }
    const subject = document.getElementById('import-subject').value;
    if (!subject) {
        showToast('Veuillez sélectionner une matière', 'warning');
        return;
    }
    const defaultThemesInput = document.getElementById('import-default-themes').value;
    const defaultThemes = defaultThemesInput ? defaultThemesInput.split(',').map(t => t.trim()) : [];
    const autoDetect = document.getElementById('import-auto-detect').checked;
    const overwrite = document.getElementById('import-overwrite').checked;
    const resultDiv = document.getElementById('import-result');
    const logPre = document.getElementById('import-log');
    resultDiv.style.display = 'block';
    logPre.textContent = 'Import en cours...\n';
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    for (const file of selectedFiles) {
        try {
            const content = await file.text();
            // Analyser le fichier d'abord
            const analysis = analyzeText2QuizFile(content);
            logPre.textContent += `\n📁 ${file.name}\n`;
            logPre.textContent += `   📊 ${analysis.questionCount} questions, ${analysis.themes.length} thèmes\n`;
            // Importer
            const result = await importText2QuizFile(content, {
                subject,
                source: file.name,
                autoDetectThemes: autoDetect,
                defaultThemes,
                overwriteExisting: overwrite
            });
            totalSuccess += result.success;
            totalErrors += result.errors;
            totalSkipped += result.skipped;
            logPre.textContent += result.details.join('\n') + '\n';
        }
        catch (error) {
            logPre.textContent += `❌ Erreur: ${error.message}\n`;
            totalErrors++;
        }
    }
    logPre.textContent += `\n${'='.repeat(50)}\n`;
    logPre.textContent += `✅ Total: ${totalSuccess} importées, ${totalSkipped} ignorées, ${totalErrors} erreurs\n`;
    showToast(`Import terminé: ${totalSuccess} questions importées`, 'success');
    // Actualiser les stats
    await updateAllStats();
    await loadDashboardStats();
}
// ========================================
// QUESTIONS MANAGEMENT
// ========================================
async function loadQuestions() {
    const loading = document.getElementById('questions-loading');
    const tbody = document.getElementById('questions-tbody');
    loading.classList.add('active');
    tbody.innerHTML = '';
    try {
        const questions = await questionDB.getAllQuestions();
        // Populate subject filter
        const subjects = [...new Set(questions.map(q => q.subject))].sort();
        const subjectFilter = document.getElementById('filter-subject');
        subjectFilter.innerHTML = '<option value="">Toutes les matières</option>';
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            subjectFilter.appendChild(opt);
        });
        // Render questions
        renderQuestions(questions);
    }
    catch (error) {
        showToast('Erreur de chargement: ' + error.message, 'error');
    }
    finally {
        loading.classList.remove('active');
    }
}
function renderQuestions(questions) {
    const tbody = document.getElementById('questions-tbody');
    tbody.innerHTML = '';
    if (questions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-light);">Aucune question trouvée</td></tr>';
        return;
    }
    questions.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td class="question-text" title="${escapeHtml(q.question.question)}">${escapeHtml(q.question.question)}</td>
      <td><span class="tag">${q.subject}</span></td>
      <td>${q.themes.map(t => `<span class="tag">${t}</span>`).join('')}</td>
      <td><span class="tag difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
      <td style="font-size: 0.85rem; color: var(--text-light);">${q.source}</td>
      <td>
        <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="editQuestion('${q.id}')">
          ✏️ Éditer
        </button>
        <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="deleteQuestion('${q.id}')">
          🗑️
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}
async function filterQuestions() {
    const searchTerm = document.getElementById('search-questions').value.toLowerCase();
    const subjectFilter = document.getElementById('filter-subject').value;
    const difficultyFilter = document.getElementById('filter-difficulty').value;
    let questions = await questionDB.getAllQuestions();
    if (searchTerm) {
        questions = questions.filter(q => q.question.question.toLowerCase().includes(searchTerm) ||
            q.themes.some(t => t.toLowerCase().includes(searchTerm)));
    }
    if (subjectFilter) {
        questions = questions.filter(q => q.subject === subjectFilter);
    }
    if (difficultyFilter) {
        questions = questions.filter(q => q.difficulty === difficultyFilter);
    }
    renderQuestions(questions);
}
// ========================================
// THEMES MANAGEMENT
// ========================================
async function loadThemes() {
    const grid = document.getElementById('themes-grid');
    grid.innerHTML = '';
    try {
        await questionDB.updateThemeStatistics();
        const themes = await questionDB.getAllThemes();
        if (themes.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Aucun thème trouvé</p>';
            return;
        }
        themes.forEach(theme => {
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.style.borderColor = theme.color;
            card.innerHTML = `
        <h4>${theme.name}</h4>
        <div class="count">${theme.questionCount}</div>
        <p style="color: var(--text-light); font-size: 0.85rem; margin-top: 0.5rem;">
          ${theme.description || 'Aucune description'}
        </p>
      `;
            grid.appendChild(card);
        });
    }
    catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}
// ========================================
// SUBJECTS MANAGEMENT
// ========================================
async function loadSubjects() {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = '';
    try {
        await questionDB.updateSubjectStatistics();
        const subjects = await questionDB.getAllSubjects();
        if (subjects.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Aucune matière trouvée</p>';
            return;
        }
        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.style.borderColor = subject.color;
            card.innerHTML = `
        <h4>${subject.name}</h4>
        <div class="count">${subject.questionCount}</div>
        <p style="color: var(--text-light); font-size: 0.85rem; margin-top: 0.5rem;">
          ${subject.themeCount} thèmes
        </p>
      `;
            grid.appendChild(card);
        });
    }
    catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}
// ========================================
// DATABASE ACTIONS
// ========================================
async function exportDatabase() {
    try {
        const json = await questionDB.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `text2quiz-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Base de données exportée', 'success');
    }
    catch (error) {
        showToast('Erreur d\'export: ' + error.message, 'error');
    }
}
async function clearDatabase() {
    if (!confirm('⚠️ Voulez-vous vraiment vider toute la base de données ? Cette action est irréversible !')) {
        return;
    }
    try {
        await questionDB.clearAll();
        showToast('Base de données vidée', 'success');
        await loadDashboardStats();
        await loadQuestions();
    }
    catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}
// ========================================
// INITIALIZE DEFAULT DATA
// ========================================
async function initializeDefaultData() {
    const subjects = await questionDB.getAllSubjects();
    if (subjects.length === 0) {
        // Créer les matières par défaut
        const defaultSubjects = [
            { id: 'MACRO', name: 'Macroéconomie', shortName: 'MACRO', color: '#3b82f6', themeCount: 0, questionCount: 0 },
            { id: 'INSTIT', name: 'Institutions', shortName: 'INSTIT', color: '#10b981', themeCount: 0, questionCount: 0 },
            { id: 'STATS', name: 'Statistiques', shortName: 'STATS', color: '#f59e0b', themeCount: 0, questionCount: 0 },
            { id: 'DROIT', name: 'Droit', shortName: 'DROIT', color: '#ef4444', themeCount: 0, questionCount: 0 },
            { id: 'ECO', name: 'Analyse Économique', shortName: 'ECO', color: '#8b5cf6', themeCount: 0, questionCount: 0 }
        ];
        for (const subject of defaultSubjects) {
            await questionDB.addSubject(subject);
        }
    }
}
// ========================================
// UTILITIES
// ========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span style="font-size: 1.5rem;">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Global functions for inline onclick
window.editQuestion = async (id) => {
    showToast('Fonctionnalité en développement', 'info');
};
window.deleteQuestion = async (id) => {
    if (!confirm('Supprimer cette question ?'))
        return;
    try {
        await questionDB.deleteQuestion(id);
        showToast('Question supprimée', 'success');
        await loadQuestions();
        await loadDashboardStats();
    }
    catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
};
window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};
// Start the app
init();
