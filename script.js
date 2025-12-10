// ==============================================================================
// ВАЖНО: Убедитесь, что здесь указана ваша правильная RAW-ссылка с GitHub!
// Пример: "https://raw.githubusercontent.com/username/repo/branch/questions.json"
const JSON_URL = "https://raw.githubusercontent.com/mironovka6-source/OZP/main/questions.json"; 
// ==============================================================================


// --- Переменные состояния ---
let quizData = {}; // Сюда загрузятся вопросы, сгруппированные по классу
let currentClass = null;
let currentQuestions = []; // Вопросы для текущего теста (уже перемешанные)
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


// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕМЕШИВАНИЯ (Fisher-Yates) ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// --- ЗАГРУЗКА И ОБРАБОТКА ДАННЫХ С GITHUB (Улучшенная версия) ---
async function loadAndProcessQuestions() {
    try {
        const response = await fetch(JSON_URL);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}. Не удалось загрузить данные с GitHub. Проверьте ссылку!`);
        }

        let rawData = await response.json();
        
        // АНТИ-КРАШ КОД: Убеждаемся, что rawData является массивом
        if (typeof rawData === 'object' && rawData !== null && !Array.isArray(rawData)) {
            if (rawData.questions) { 
                rawData = rawData.questions;
            } else if (rawData.Questions) { 
                rawData = rawData.Questions;
            } else {
                const keys = Object.keys(rawData);
                if (keys.length === 1 && Array.isArray(rawData[keys[0]])) {
                    rawData = rawData[keys[0]];
                }
            }
        }
        
        if (!Array.isArray(rawData)) {
            throw new Error(`Файл вопросов не содержит массива. Тип данных: ${typeof rawData}.`);
        }
        
        // --- Логика обработки и перемешивания ответов ---
        rawData.forEach(item => {
            if (!quizData[item.class]) {
                quizData[item.class] = [];
            }
            
            // Перемешиваем варианты ответов ОДИН РАЗ при загрузке
            shuffleArray(item.answers); 

            // Находим новый индекс правильного ответа после перемешивания
            const newCorrectIndex = item.answers.findIndex(answer => answer.isCorrect === true);
            
            const answersList = item.answers.map(answer => answer.text);

            quizData[item.class].push({
                question: item.question,
                answers: answersList,
                correct: newCorrectIndex, // Сохраняем НОВЫЙ, случайный индекс
                topic: item.topic
            });
        });
        console.log(`Вопросы успешно загружены с GitHub! Всего ${rawData.length} вопросов.`);

    } catch (error) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА загрузки:", error);
        alert(`Не удалось загрузить или обработать вопросы. Ошибка: ${error.message}`);
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
        alert("Данные еще не загрузились. Пожалуйста, подождите.");
        return;
    }

    currentClass = classNum;
    
    if (!quizData[classNum] || quizData[classNum].length === 0) {
        alert("Для этого класса вопросов пока нет в базе!");
        return;
    }

    // 1. ПЕРЕМЕШИВАНИЕ ВОПРОСОВ ПРИ СТАРТЕ ТЕСТА
    let questionsForClass = [...quizData[classNum]]; // Копируем массив
    shuffleArray(questionsForClass);
    currentQuestions = questionsForClass;

    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;

    // 2. Улучшенное отображение класса
    selectedClassSpan.textContent = `${classNum} класс`;
    
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
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
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === currentQuestions.length - 1;
    
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
    let reportHTML = '<div style="text-align:left; max-height: 300px; overflow-y: auto; padding: 10px;">';
    const totalQuestions = currentQuestions.length;

    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isAnswered = userAnswer !== null; 
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) score++;

        let feedbackText = '';
        let resultClass = 'result-item';
        let answerText = isAnswered ? q.answers[userAnswer] : 'Нет ответа';
        
        if (isCorrect) {
            feedbackText = '✅';
            resultClass += ' correct';
        } else if (isAnswered && !isCorrect) {
            // Пользователь ответил, но ошибся - показываем правильный ответ
            feedbackText = `❌ (Правильно: ${q.answers[q.correct]})`;
            resultClass += ' wrong';
        } else {
            // Пользователь не ответил - не показываем правильный ответ
            feedbackText = '— Пропущен';
            resultClass += ' skipped';
        }

        reportHTML += `
            <div class="${resultClass}" style="margin-bottom: 10px; padding: 10px; background: #f9f9f9; border: 1px solid #eee; border-left: 5px solid ${isCorrect ? '#27ae60' : (isAnswered ? '#c0392b' : '#bdc3c7')};">
                <strong>${index + 1}. ${q.question}</strong><br>
                Ваш ответ: <span style="font-weight: 500;">${answerText}</span> 
                <span style="float: right; color: ${isCorrect ? 'green' : (isAnswered ? 'red' : 'gray')};">${feedbackText}</span>
            </div>
        `;
    });
    reportHTML += '</div>';
    
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
