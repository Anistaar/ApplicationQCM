import { Question } from '../types';
import { shuffleInPlace } from '../shuffle';

interface QuizConfig {
    questions: Question[];
    mode: string;
    shuffleAnswers: boolean;
    showExplanations: boolean;
    subject: string;
    themes: string[];
    learningMode: string;
}

// State
let config: QuizConfig;
let currentQuestionIndex = 0;
let score = 0;
let startTime: number;
let timerInterval: any;
let isMultiSelect = false;

// DOM Elements
const els = {
    subjectName: document.getElementById('subject-name')!,
    progressFill: document.getElementById('progress-fill')!,
    questionCounter: document.getElementById('question-counter')!,
    questionText: document.getElementById('question-text')!,
    optionsGrid: document.getElementById('options-grid')!,
    feedbackSection: document.getElementById('feedback-section')!,
    feedbackTitle: document.getElementById('feedback-title')!,
    feedbackText: document.getElementById('feedback-text')!,
    btnValidate: document.getElementById('btn-validate') as HTMLButtonElement,
    btnNext: document.getElementById('btn-next') as HTMLButtonElement,
    btnQuit: document.getElementById('btn-quit')!,
    quizInterface: document.getElementById('quiz-interface')!,
    resultsInterface: document.getElementById('results-interface')!,
    finalScore: document.getElementById('final-score')!,
    correctCount: document.getElementById('correct-count')!,
    totalCount: document.getElementById('total-count')!,
    btnHome: document.getElementById('btn-home')!,
    btnRetry: document.getElementById('btn-retry')!,
    btnNewThemes: document.getElementById('btn-new-themes')!,
    timer: document.getElementById('timer')!
};

// Init
function init() {
    const configStr = sessionStorage.getItem('quizConfig');
    
    if (!configStr) {
        alert('Configuration du quiz introuvable. Retour à l\'accueil.');
        window.location.href = '/';
        return;
    }

    try {
        config = JSON.parse(configStr);
    } catch (error) {
        alert('Erreur lors du chargement de la configuration. Retour à l\'accueil.');
        window.location.href = '/';
        return;
    }

    // Setup UI
    els.subjectName.textContent = config.subject;

    // Event Listeners
    els.btnValidate.addEventListener('click', validateAnswer);
    els.btnNext.addEventListener('click', nextQuestion);
    els.btnQuit.addEventListener('click', quitQuiz);
    els.btnHome.addEventListener('click', () => window.location.href = '/');
    els.btnRetry.addEventListener('click', () => window.location.reload());
    els.btnNewThemes.addEventListener('click', () => {
        const subject = config?.subject || '';
        window.location.href = subject ? `/#${subject}` : '/';
    });

    // Start
    startTimer();
    showQuestion(0);
}

function showQuestion(index: number) {
    currentQuestionIndex = index;
    const question = config.questions[index];

    // Update Progress
    const progress = ((index) / config.questions.length) * 100;
    els.progressFill.style.width = `${progress}%`;
    els.questionCounter.textContent = `Question ${index + 1}/${config.questions.length}`;

    // Render Question
    els.questionText.textContent = question.question;

    // Detect multi-select
    const correctCount = (question.answers || []).filter(a => a.correct).length;
    isMultiSelect = question.type === 'QCM' && correctCount > 1;

    // Render Options
    els.optionsGrid.innerHTML = '';
    els.feedbackSection.classList.remove('visible', 'correct', 'wrong');
    els.btnValidate.style.display = 'block';
    els.btnNext.style.display = 'none';
    els.btnValidate.disabled = true;

    // Multi-select hint
    const existingHint = document.getElementById('multi-select-hint');
    if (existingHint) existingHint.remove();
    if (isMultiSelect) {
        const hint = document.createElement('div');
        hint.id = 'multi-select-hint';
        hint.style.cssText = 'font-size:0.85em;color:var(--primary);margin-bottom:8px;font-weight:600;text-align:center;';
        hint.textContent = `☑️ Plusieurs réponses correctes — sélectionnez toutes les bonnes (${correctCount})`;
        els.optionsGrid.before(hint);
    }

    if (question.type === 'VF') {
        // Vrai / Faux buttons
        const vfOptions = [
            { label: '✅ Vrai', value: 'V', correct: question.vf === 'V' },
            { label: '❌ Faux', value: 'F', correct: question.vf === 'F' }
        ];
        vfOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span style="font-size:1.2em;width:28px;">${opt.value === 'V' ? '✅' : '❌'}</span><span>${opt.value === 'V' ? 'Vrai' : 'Faux'}</span>`;
            btn.dataset.value = opt.value;
            btn.dataset.correct = opt.correct.toString();
            btn.addEventListener('click', () => selectOption(btn));
            els.optionsGrid.appendChild(btn);
        });
    } else {
        // QCM / QR: extract options from Answer[]
        const answers = question.answers || [];
        const options = [...answers];
        if (config.shuffleAnswers) {
            shuffleInPlace(options);
        }
        options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `
      <span style="font-weight:700;color:var(--primary);width:24px;">${String.fromCharCode(65 + i)}</span>
      <span>${opt.text}</span>
    `;
            btn.dataset.value = opt.text;
            btn.dataset.correct = opt.correct.toString();
            btn.addEventListener('click', () => selectOption(btn));
            els.optionsGrid.appendChild(btn);
        });
    }
}

function selectOption(btn: HTMLButtonElement) {
    if (els.btnValidate.style.display === 'none') return; // Already validated

    if (isMultiSelect) {
        // Toggle selection
        btn.classList.toggle('selected');
        const anySelected = els.optionsGrid.querySelector('.option-btn.selected') !== null;
        els.btnValidate.disabled = !anySelected;
    } else {
        // Single choice
        els.optionsGrid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        els.btnValidate.disabled = false;
    }
}

function validateAnswer() {
    const question = config.questions[currentQuestionIndex];
    const allBtns = Array.from(els.optionsGrid.querySelectorAll('.option-btn')) as HTMLButtonElement[];
    const selectedBtns = allBtns.filter(b => b.classList.contains('selected'));
    if (selectedBtns.length === 0) return;

    let isCorrect: boolean;

    if (isMultiSelect) {
        // Correct iff selected set = correct set exactly
        const selectedValues = new Set(selectedBtns.map(b => b.dataset.value));
        const correctValues = new Set(
            allBtns.filter(b => b.dataset.correct === 'true').map(b => b.dataset.value)
        );
        isCorrect = selectedValues.size === correctValues.size &&
            [...selectedValues].every(v => correctValues.has(v));
    } else {
        isCorrect = selectedBtns[0].dataset.correct === 'true';
    }

    // Visual Feedback on buttons
    allBtns.forEach(btn => {
        const isBtnCorrect = btn.dataset.correct === 'true';
        if (isBtnCorrect) {
            btn.classList.add('correct');
        } else if (btn.classList.contains('selected')) {
            btn.classList.add('wrong');
        }
    });

    // Feedback text
    const correctAnswers = question.answers?.filter(a => a.correct).map(a => a.text) || [];
    const defaultWrongText = correctAnswers.length > 1
        ? `Les bonnes réponses étaient : ${correctAnswers.join(' + ')}`
        : `La bonne réponse était : ${correctAnswers[0] || '?'}`;

    els.feedbackSection.className = `feedback-section visible ${isCorrect ? 'correct' : 'wrong'}`;
    els.feedbackTitle.textContent = isCorrect ? 'Excellente réponse ! 🎉' : 'Oups, ce n\'est pas ça...';
    els.feedbackText.textContent = question.explication || (isCorrect ? 'Bien joué.' : defaultWrongText);

    // Update Score
    if (isCorrect) score++;

    // Switch Buttons
    els.btnValidate.style.display = 'none';
    els.btnNext.style.display = 'block';

    // Focus next
    els.btnNext.focus();
}

function nextQuestion() {
    if (currentQuestionIndex < config.questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    els.quizInterface.style.display = 'none';
    els.resultsInterface.style.display = 'block';

    const percentage = Math.round((score / config.questions.length) * 100);
    els.finalScore.textContent = `${percentage}%`;
    els.correctCount.textContent = score.toString();
    els.totalCount.textContent = config.questions.length.toString();

    if (percentage >= 80) {
        launchConfetti();
    }
}

function quitQuiz() {
    if (confirm('Voulez-vous vraiment quitter le quiz ? Votre progression sera perdue.')) {
        window.location.href = '/';
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const delta = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(delta / 60).toString().padStart(2, '0');
        const secs = (delta % 60).toString().padStart(2, '0');
        els.timer.textContent = `${mins}:${secs}`;
    }, 1000);
}



function launchConfetti() {
    const colors = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
    }
}

// Run
init();
