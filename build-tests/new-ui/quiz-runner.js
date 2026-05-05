// State
let config;
let currentQuestionIndex = 0;
let score = 0;
let startTime;
let timerInterval;
// DOM Elements
const els = {
    subjectName: document.getElementById('subject-name'),
    progressFill: document.getElementById('progress-fill'),
    questionCounter: document.getElementById('question-counter'),
    questionText: document.getElementById('question-text'),
    optionsGrid: document.getElementById('options-grid'),
    feedbackSection: document.getElementById('feedback-section'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackText: document.getElementById('feedback-text'),
    btnValidate: document.getElementById('btn-validate'),
    btnNext: document.getElementById('btn-next'),
    btnQuit: document.getElementById('btn-quit'),
    quizInterface: document.getElementById('quiz-interface'),
    resultsInterface: document.getElementById('results-interface'),
    finalScore: document.getElementById('final-score'),
    correctCount: document.getElementById('correct-count'),
    totalCount: document.getElementById('total-count'),
    btnHome: document.getElementById('btn-home'),
    btnRetry: document.getElementById('btn-retry'),
    timer: document.getElementById('timer')
};
// Init
function init() {
    console.log('🎮 Initialisation du quiz-runner');
    console.log('📦 sessionStorage keys:', Object.keys(sessionStorage));
    const configStr = sessionStorage.getItem('quizConfig');
    console.log('📋 Config récupérée:', configStr ? `${configStr.length} caractères` : 'AUCUNE');
    if (!configStr) {
        console.error('❌ Configuration du quiz introuvable dans sessionStorage');
        alert('Configuration du quiz introuvable. Retour à l\'accueil.');
        window.location.href = '/';
        return;
    }
    try {
        config = JSON.parse(configStr);
        console.log('✅ Config parsée:', {
            questions: config.questions.length,
            mode: config.mode,
            subject: config.subject
        });
    }
    catch (error) {
        console.error('❌ Erreur lors du parsing de la config:', error);
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
    // Start
    startTimer();
    showQuestion(0);
}
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = config.questions[index];
    // Update Progress
    const progress = ((index) / config.questions.length) * 100;
    els.progressFill.style.width = `${progress}%`;
    els.questionCounter.textContent = `Question ${index + 1}/${config.questions.length}`;
    // Render Question
    els.questionText.textContent = question.question;
    // Render Options
    els.optionsGrid.innerHTML = '';
    els.feedbackSection.classList.remove('visible', 'correct', 'wrong');
    els.btnValidate.style.display = 'block';
    els.btnNext.style.display = 'none';
    els.btnValidate.disabled = true;
    // Handle different question types (currently focusing on QCM/Multiple Choice)
    // Extract options from Answer[]
    const answers = question.answers || [];
    const options = [...answers];
    if (config.shuffleAnswers) {
        shuffleArray(options);
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
function selectOption(btn) {
    if (els.btnValidate.style.display === 'none')
        return; // Already validated
    // Single choice for now (adapt for multiple if needed)
    els.optionsGrid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    els.btnValidate.disabled = false;
}
function validateAnswer() {
    const selectedBtn = els.optionsGrid.querySelector('.option-btn.selected');
    if (!selectedBtn)
        return;
    const isCorrect = selectedBtn.dataset.correct === 'true';
    const question = config.questions[currentQuestionIndex];
    const correctAnswer = question.answers?.find(a => a.correct)?.text;
    // Visual Feedback
    els.optionsGrid.querySelectorAll('.option-btn').forEach(btn => {
        const isBtnCorrect = btn.dataset.correct === 'true';
        if (isBtnCorrect) {
            btn.classList.add('correct');
        }
        else if (btn.classList.contains('selected') && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    // Feedback Section
    els.feedbackSection.className = `feedback-section visible ${isCorrect ? 'correct' : 'wrong'}`;
    els.feedbackTitle.textContent = isCorrect ? 'Excellente réponse ! 🎉' : 'Oups, ce n\'est pas ça...';
    els.feedbackText.textContent = question.explication || (isCorrect ? 'Bien joué.' : `La bonne réponse était : ${correctAnswer}`);
    // Update Score
    if (isCorrect)
        score++;
    // Switch Buttons
    els.btnValidate.style.display = 'none';
    els.btnNext.style.display = 'block';
    // Focus next
    els.btnNext.focus();
}
function nextQuestion() {
    if (currentQuestionIndex < config.questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
    else {
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
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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
export {};
