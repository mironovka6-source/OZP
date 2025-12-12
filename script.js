const QUESTIONS_URL = 'https://raw.githubusercontent.com/mironovka6-source/OZP/main/questions.json';

// Элементы DOM
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const resultsScreen = document.getElementById('results-screen');
const classSelection = document.getElementById('class-selection');
const questionText = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const navigationPanel = document.getElementById('navigation-panel');
const progressCounter = document.getElementById('progress-counter');
const selectedClassSpan = document.getElementById('selected-class');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const finishButton = document.getElementById('finish-button');
const restartButton = document.getElementById('restart-button');
const scoreSpan = document.getElementById('score');
const reportContainer = document.getElementById('report-container');

// Переменные состояния
let allQuestions = [];
let currentClass = null;
let filteredQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// =======================================================
// 1. ЗАГРУЗКА ДАННЫХ
// =======================================================

async function loadQuestions() {
    try {
        const response = await fetch(QUESTIONS_URL);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        allQuestions = await response.json();
        console.log(`Вопросы успешно загружены с GitHub! Всего ${allQuestions.length} вопросов.`);
        startScreen.style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        questionText.textContent = 'Не удалось загрузить вопросы. Проверьте подключение или URL.';
    }
}

// =======================================================
// 2. УПРАВЛЕНИЕ КЛАССОМ И НАЧАЛО ТЕСТА
// =======================================================

classSelection.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        // Берем класс и приводим его к строке для универсальности
        currentClass = event.target.dataset.class.toString(); 
        selectedClassSpan.textContent = `Класс: ${currentClass}`;
        
        // !!! ИСПРАВЛЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ !!!
        // Сравниваем класс в JSON (приведенный к строке) с выбранным классом (строка)
        filteredQuestions = allQuestions.filter(q => 
            q.class != null && q.class.toString() === currentClass
        );

        if (filteredQuestions.length === 0) {
            alert(`Нет вопросов для ${currentClass} класса. Проверьте поле "class" в questions.json.`);
            return;
        }

        initializeQuiz();
    }
});

function initializeQuiz() {
    // Сброс состояния
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    score = 0;
    reportContainer.innerHTML = '';
    
    // Переключение экранов
    startScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    quizContainer.style.display = 'block';

    renderNavigation();
    renderQuestion(currentQuestionIndex);
}

// =======================================================
// 3. ОТОБРАЖЕНИЕ ТЕСТА И НАВИГАЦИЯ
// =======================================================

function renderNavigation() {
    navigationPanel.innerHTML = '';
    filteredQuestions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        dot.textContent = index + 1;
        
        if (index === currentQuestionIndex) {
            dot.classList.add('active');
        }
        if (userAnswers[index] !== null) {
            dot.classList.add('answered');
        }

        dot.addEventListener('click', () => {
            currentQuestionIndex = index;
            renderQuestion(currentQuestionIndex);
            updateButtonVisibility();
        });

        navigationPanel.appendChild(dot);
    });
}

function renderQuestion(index) {
    const question = filteredQuestions[index];
    
    // !!! ИСПРАВЛЕНИЕ: ПРОВЕРКА НАЛИЧИЯ OPTIONS !!!
    // Проверка, что вопрос существует и содержит валидный массив вариантов ответа
    if (!question || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
        questionText.textContent = `Ошибка: Вопрос №${index + 1} отсутствует или не содержит вариантов ответа. Проверьте questions.json.`;
        answersArea.innerHTML = '';
        updateButtonVisibility();
        return; 
    }
    
    questionText.textContent = `${index + 1}. ${question.question}`;
    answersArea.innerHTML = '';

    // Отображение вариантов ответов
    question.options.forEach((option, optionIndex) => { 
        const button = document.createElement('button');
        button.classList.add('answer-option');
        button.textContent = option;
        button.dataset.index = optionIndex;

        // Помечаем выбранный ранее ответ
        if (userAnswers[index] === optionIndex) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => {
            selectAnswer(optionIndex);
        });

        answersArea.appendChild(button);
    });

    // Обновление прогресса и кнопок
    progressCounter.textContent = `${index + 1}/${filteredQuestions.length}`;
    renderNavigation();
    updateButtonVisibility();
}

function selectAnswer(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Удаляем класс 'selected' у всех кнопок
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Добавляем класс 'selected' только выбранной кнопке
    const selectedButton = document.querySelector(`.answer-option[data-index="${optionIndex}"]`);
    selectedButton.classList.add('selected');

    renderNavigation(); // Обновляем точку навигации как "answered"
}

// =======================================================
// 4. УПРАВЛЕНИЕ КНОПКАМИ
// =======================================================

function updateButtonVisibility() {
    // Кнопка "Назад"
    prevButton.disabled = currentQuestionIndex === 0;

    // Кнопка "Далее" / "Завершить"
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
    
    nextButton.style.display = isLastQuestion ? 'none' : 'inline-block';
    
    // Кнопка "Завершить тест" показывается, если это последний вопрос
    finishButton.style.display = isLastQuestion ? 'inline-block' : 'none';
}

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
});

// =======================================================
// 5. РЕЗУЛЬТАТЫ И ЗАВЕРШЕНИЕ
// =======================================================

finishButton.addEventListener('click', calculateResults);

function calculateResults() {
    score = 0;
    reportContainer.innerHTML = '';
    
    filteredQuestions.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        
        // Пропускаем вопросы с неверной структурой при подсчете
        if (!question || !question.options || !question.options.length) {
            return;
        }

        const isCorrect = userAnswerIndex !== null && userAnswerIndex === question.correctAnswerIndex;
        
        if (isCorrect) {
            score++;
        } else {
            // Создание отчета об ошибке
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item', isCorrect ? 'correct' : 'wrong');
            
            const selectedText = userAnswerIndex !== null ? 
                `Ваш ответ: ${question.options[userAnswerIndex]}` : 
                `Вы не ответили.`;
            
            const correctText = `Верный ответ: ${question.options[question.correctAnswerIndex]}`;
            
            resultItem.innerHTML = `
                <p><strong>Вопрос ${index + 1}:</strong> ${question.question}</p>
                <p>${selectedText}</p>
                <p>${correctText}</p>
                <hr>
            `;
            reportContainer.appendChild(resultItem);
        }
    });

    // Обновление экрана результатов
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreSpan.textContent = `${score} из ${filteredQuestions.length}`;
}

restartButton.addEventListener('click', () => {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
    currentClass = null; // Сброс класса для нового выбора
});

// Запускаем загрузку вопросов при старте страницы
loadQuestions();
