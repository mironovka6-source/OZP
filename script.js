// --- Переменные состояния ---
let quizData = {}; // Сюда загрузятся вопросы
let currentClass = null;
let currentQuestions = [];
let userAnswers = [];
let currentQuestionIndex = 0;

// --- DOM Элементы ---
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const resultsScreen = document.getElementById('results-screen');
const classButtons = document.querySelectorAll('#class-selection button');

const questionText = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const navigationPanel = document.getElementById('navigation-panel');
const progressCounter = document.getElementById('progress-counter');
const selectedClassSpan = document.getElementById('selected-class');

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const finishButton = document.getElementById('finish-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const reportContainer = document.getElementById('report-container');

// --- ЗАГРУЗКА И ОБРАБОТКА ДАННЫХ ИЗ JSON ---
async function loadAndProcessQuestions() {
    try {
        const response = await fetch('questions.json');
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}. Проверьте наличие файла 'questions.json' и использование локального сервера.`);
        }

        const rawData = await response.json();
        
        // Обработка "сырых" данных из JSON в формат, удобный для игры
        rawData.forEach(item => {
            // 1. Создаем массив для класса, если его еще нет
            if (!quizData[item.class]) {
                quizData[item.class] = [];
            }

            // 2. Находим индекс правильного ответа
            const correctIndex = item.answers.findIndex(answer => answer.isCorrect === true);

            // 3. Формируем массив текстов ответов
            const answersList = item.answers.map(answer => answer.text);

            // 4. Добавляем в итоговую базу
            quizData[item.class].push({
                question: item.question,
                answers: answersList,
                correct: correctIndex,
                topic: item.topic
            });
        });

    } catch (error) {
        console.error("Ошибка загрузки вопросов:", error);
        alert("Не удалось загрузить вопросы! (Проверьте консоль для деталей).\n\nВозможно, нужно запустить локальный сервер.");
    }
}

// Запускаем загрузку сразу при старте страницы
loadAndProcessQuestions();


// --- ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ---

classButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = parseInt(btn.getAttribute('data-class'));
        startQuiz(selected);
    });
});

restartButton.addEventListener('click', () => {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
});

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
});

finishButton.addEventListener('click', showResults);


// --- ЛОГИКА ТЕСТА ---

function startQuiz(classNum) {
    if (Object.keys(quizData).length === 0) {
        alert("Данные еще не загрузились. Пожалуйста, подождите или проверьте ошибки.");
        return;
    }

    currentClass = classNum;
    
    if (!quizData[classNum] || quizData[classNum].length === 0) {
        alert("Для этого класса вопросов пока нет в базе!");
        return;
    }

    currentQuestions = quizData[classNum];
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;

    selectedClassSpan.textContent = classNum;
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // **ИЗМЕНЕНИЕ ДЛЯ ЗАВЕРШЕНИЯ В ЛЮБОЙ МОМЕНТ:** // Кнопка "Завершить" становится видна сразу
    finishButton.style.display = 'inline-block';
    finishButton.disabled = false;

    createNavigationPanel();
    renderQuestion();
}

function createNavigationPanel() {
    navigationPanel.innerHTML = '';
    currentQuestions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        dot.textContent = index + 1;
        dot.onclick = () => {
            currentQuestionIndex = index;
            renderQuestion();
        };
        navigationPanel.appendChild(dot);
    });
}

function renderQuestion() {
    const questionData = currentQuestions[currentQuestionIndex];
    
    let questionTitle = `${currentQuestionIndex + 1}. ${questionData.question}`;
    if(questionData.topic) {
        questionTitle = `<small style="color: #7f8c8d;">Тема: ${questionData.topic}</small><br>` + questionTitle;
    }

    questionText.innerHTML = questionTitle;

    answersArea.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.classList.add('answer-option');
        btn.textContent = answer;
        
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }

        btn.onclick = () => selectAnswer(index);
        answersArea.appendChild(btn);
    });

    updateControls();
    updateNavigationDots();

    const answeredCount = userAnswers.filter(a => a !== null).length;
    progressCounter.textContent = `Отвечено: ${answeredCount} из ${currentQuestions.length}`;
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    renderQuestion();
}

function updateControls() {
    // Кнопка "Назад"
    prevButton.disabled = currentQuestionIndex === 0;

    // Кнопка "Вперед"
    // Снимаем блокировку по ответу, чтобы разрешить свободное перемещение
    nextButton.disabled = currentQuestionIndex === currentQuestions.length - 1;
    
    // Управление видимостью кнопки "Завершить"
    // Кнопка "Завершить" всегда видна, кроме последней страницы, где она остается одна
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextButton.style.display = 'none';
        finishButton.style.display = 'inline-block';
    } else {
        nextButton.style.display = 'inline-block';
        finishButton.style.display = 'inline-block';
    }
}

function updateNavigationDots() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'answered');
        if (index === currentQuestionIndex) {
            dot.classList.add('active');
        }
        if (userAnswers[index] !== null) {
            dot.classList.add('answered');
        }
    });
}

function showResults() {
    let score = 0;
    let reportHTML = '<div style="text-align:left; max-height: 300px; overflow-y: auto;">';
    const totalQuestions = currentQuestions.length;

    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) score++;

        reportHTML += `
            <div class="result-item ${isCorrect ? 'correct' : 'wrong'}" style="margin-bottom: 10px; padding: 10px; background: #fff; border: 1px solid #eee;">
                <strong>${index + 1}. ${q.question}</strong><br>
                Ваш ответ: ${userAnswer !== null ? q.answers[userAnswer] : 'Нет ответа'} 
                ${isCorrect ? '✅' : '❌'}<br>
                ${!isCorrect ? `<span style="color:green">Правильно: ${q.answers[q.correct]}</span>` : ''}
            </div>
        `;
    });
    reportHTML += '</div>';
    
    // **ИЗМЕНЕНИЕ ДЛЯ ПРОЦЕНТОВ:**
    let percentage = 0;
    if (totalQuestions > 0) {
        percentage = ((score / totalQuestions) * 100).toFixed(0);
        scoreDisplay.textContent = `${score} из ${totalQuestions} (${percentage}%)`;
    } else {
        scoreDisplay.textContent = `0 из 0`;
    }

    reportContainer.innerHTML = reportHTML;

    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
}
