// ===============================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ И УТИЛИТЫ
// ===============================================

// Получение элементов DOM
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const questionTextElement = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score');
const classSelectionArea = document.getElementById('class-selection'); 
const navigationPanel = document.getElementById('navigation-panel'); // Добавляем панель навигации
const progressCounter = document.getElementById('progress-counter'); // Счетчик прогресса

let allQuestions = []; // Хранит все вопросы из JSON
let questions = []; // Отфильтрованные и перемешанные вопросы
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = []; // Хранит историю ответов пользователя
let currentClass = null;
let isReviewMode = false; // Режим просмотра результатов

/**
 * Утилита для случайного перемешивания массива (Fisher-Yates).
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===============================================
// ЧАСТЬ 1: ЗАГРУЗКА И НАЧАЛО ТЕСТА (Выбор класса)
// ===============================================

/**
 * Асинхронно загружает вопросы и назначает обработчики кнопкам классов.
 */
async function loadQuestions() {
    try {
        const response = await fetch('questions.json'); 
        allQuestions = await response.json();
        
        // Назначаем обработчики кнопкам выбора класса
        if (classSelectionArea) {
            Array.from(classSelectionArea.children).forEach(button => {
                button.addEventListener('click', handleClassSelect);
            });
        }

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        if (questionTextElement) {
            questionTextElement.textContent = 'Не удалось загрузить вопросы. Проверьте questions.json.';
        }
    }
}

/**
 * Обработка выбора класса, фильтрация, перемешивание и запуск теста.
 */
function handleClassSelect(event) {
    currentClass = parseInt(event.target.dataset.class);
    
    // 1. Фильтруем вопросы
    questions = allQuestions.filter(q => q.class === currentClass);
    
    if (questions.length === 0) {
        alert(`Для ${currentClass} класса вопросов пока нет. Выберите другой.`);
        return;
    }

    // 2. Перемешиваем список вопросов
    shuffleArray(questions);
    
    // 3. Сброс состояния
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = new Array(questions.length).fill(null);
    isReviewMode = false;

    // 4. Запуск теста
    if (startScreen) startScreen.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';
    
    const classDisplay = document.querySelector('.current-class');
    if (classDisplay) {
        classDisplay.textContent = `Класс: ${currentClass}`;
    }
    
    // 5. Создаем навигационные кнопки
    createNavigationButtons();
    
    displayQuestion();
    updateProgress();
}

/**
 * Создает кнопки навигации для всех вопросов
 */
function createNavigationButtons() {
    if (!navigationPanel) return;
    
    navigationPanel.innerHTML = '';
    
    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.className = 'nav-btn';
        button.textContent = index + 1;
        button.setAttribute('data-index', index);
        
        button.addEventListener('click', () => {
            goToQuestion(index);
        });
        
        navigationPanel.appendChild(button);
    });
    
    updateNavigationButtons();
}

/**
 * Обновляет состояние всех кнопок навигации
 */
function updateNavigationButtons() {
    if (!navigationPanel) return;
    
    const navButtons = navigationPanel.querySelectorAll('.nav-btn');
    navButtons.forEach((button, index) => {
        // Сбрасываем все классы
        button.classList.remove('current', 'answered', 'skipped');
        
        // Текущий вопрос
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        
        // Отвеченные вопросы
        if (answerHistory[index] !== null) {
            button.classList.add('answered');
        }
        
        // Пропущенные вопросы (если есть такие)
        if (answerHistory[index] === null && index < currentQuestionIndex) {
            button.classList.add('skipped');
        }
    });
}

/**
 * Переход к конкретному вопросу
 */
function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
    updateNavigationButtons();
    updateProgress();
}

/**
 * Обновляет счетчик прогресса
 */
function updateProgress() {
    if (!progressCounter) return;
    
    const answeredCount = answerHistory.filter(answer => answer !== null).length;
    const totalQuestions = questions.length;
    progressCounter.textContent = `Отвечено: ${answeredCount} из ${totalQuestions}`;
}

// ===============================================
// ЧАСТЬ 2: ЛОГИКА ТЕСТА С НАВИГАЦИЕЙ
// ===============================================

/**
 * Отображает текущий вопрос и перемешивает варианты ответов.
 */
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    questionTextElement.textContent = `${currentQuestionIndex + 1}. ${currentQ.question}`;
    answersArea.innerHTML = ''; 
    nextButton.disabled = true;
    prevButton.disabled = (currentQuestionIndex === 0);

    // Перемешиваем варианты ответов перед отображением (только при первом показе)
    let shuffledAnswers;
    
    if (isReviewMode && answerHistory[currentQuestionIndex] !== null) {
        // В режиме просмотра показываем ответы в исходном порядке
        shuffledAnswers = [...currentQ.answers];
    } else {
        // В обычном режиме перемешиваем
        shuffledAnswers = [...currentQ.answers];
        shuffleArray(shuffledAnswers);
    }

    const userAnswer = answerHistory[currentQuestionIndex];
    const correctAnswer = currentQ.answers.find(a => a.isCorrect).text;
    
    shuffledAnswers.forEach((answer) => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.textContent = answer.text;
        button.dataset.answerText = answer.text;
        
        // В режиме просмотра показываем правильность ответов
        if (isReviewMode) {
            button.disabled = true;
            
            // Правильный ответ всегда зеленый
            if (answer.text === correctAnswer) {
                button.classList.add('correct');
            }
            
            // Ответ пользователя - красный, если неправильный
            if (userAnswer && answer.text === userAnswer.userAnswer && !userAnswer.isCorrect) {
                button.classList.add('wrong');
            }
        }
        
        // Если уже есть ответ на этот вопрос, отмечаем его
        if (userAnswer && answer.text === userAnswer.userAnswer && !isReviewMode) {
            button.classList.add('selected');
            nextButton.disabled = false;
        }
        
        button.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(button);
    });
    
    updateNavigationButtons();
    updateProgress();
}

/**
 * Обработка выбора ответа, стилизация и запись в историю.
 */
function handleAnswerSelect(event) {
    if (isReviewMode) return;
    
    const selectedButton = event.target;
    const selectedAnswerText = selectedButton.dataset.answerText;

    // Блокируем все кнопки после выбора
    Array.from(answersArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('selected');
    });

    selectedButton.classList.add('selected');
    nextButton.disabled = false;
    
    const currentQ = questions[currentQuestionIndex];
    
    // Находим правильный ответ
    const selectedAnswer = currentQ.answers.find(a => a.text === selectedAnswerText);
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswerText = currentQ.answers.find(a => a.isCorrect).text;

    // Стилизация (Зеленый/Красный)
    if (isCorrect) {
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('wrong');
        
        // Показываем правильный ответ
        const correctButton = Array.from(answersArea.children)
            .find(btn => btn.dataset.answerText === correctAnswerText);
        if (correctButton) {
             correctButton.classList.add('correct');
        }
    }

    // СОХРАНЕНИЕ В ИСТОРИЮ
    answerHistory[currentQuestionIndex] = {
        id: currentQ.id,
        question: currentQ.question,
        userAnswer: selectedAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect
    };
    
    updateNavigationButtons();
    updateProgress();
}

/**
 * Переход к следующему вопросу.
 */
if (nextButton) {
    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            showResults();
        }
    });
}

/**
 * Переход к предыдущему вопросу.
 */
if (prevButton) {
    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    });
}

// ===============================================
// ЧАСТЬ 3: РЕЗУЛЬТАТЫ И ДЕТАЛЬНЫЙ ОТЧЕТ С ВОЗМОЖНОСТЬЮ ПЕРЕСМОТРА
// ===============================================

/**
 * Отображение финального экрана результатов и детального отчета.
 */
function showResults() {
    // Подсчет правильных ответов
    score = answerHistory.filter(answer => answer && answer.isCorrect).length;
    
    if (quizContainer) quizContainer.style.display = 'none';
    if (resultsScreen) resultsScreen.style.display = 'block';
    if (scoreDisplay) scoreDisplay.textContent = `${score} из ${questions.length}`;

    generateDetailedReport(); 
}

/**
 * Генерирует и отображает детальный отчет по всем вопросам.
 */
function generateDetailedReport() {
    let reportContainer = document.getElementById('report-container'); 
    
    if (!reportContainer && resultsScreen) {
        reportContainer = document.createElement('div');
        reportContainer.id = 'report-container';
        resultsScreen.appendChild(reportContainer);
    }
    
    if (!reportContainer) return;
    
    reportContainer.innerHTML = `
        <h2>Детальный отчет:</h2>
        <button id="review-test-btn" class="review-btn">Просмотреть все вопросы</button>
        <div class="report-items-container">
    `;
    
    const reportItemsContainer = document.createElement('div');
    reportItemsContainer.className = 'report-items-container';
    
    answerHistory.forEach((item, index) => {
        if (!item) return;
        
        const resultClass = item.isCorrect ? 'report-correct' : 'report-wrong';
        const resultText = item.isCorrect ? '✅ Правильно' : '❌ Неправильно';

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('report-item', resultClass);
        itemDiv.dataset.questionIndex = index;
        itemDiv.style.cursor = 'pointer';
        
        itemDiv.innerHTML = `
            <p class="question-number">Вопрос ${index + 1}:</p>
            <p><strong>${item.question}</strong></p>
            <p><strong>Ваш ответ:</strong> <span class="${item.isCorrect ? 'correct' : 'wrong'}">${item.userAnswer}</span></p>
            ${!item.isCorrect ? `<p><strong>Правильный ответ:</strong> <span class="correct">${item.correctAnswer}</span></p>` : ''}
            <p class="status ${resultClass}">${resultText}</p>
        `;
        
        // Клик по отчету ведет к соответствующему вопросу
        itemDiv.addEventListener('click', () => {
            startReviewMode(index);
        });
        
        reportContainer.appendChild(itemDiv);
    });
    
    // Добавляем кнопку для просмотра всех вопросов
    const reviewButton = document.createElement('button');
    reviewButton.id = 'review-test-btn';
    reviewButton.className = 'review-btn';
    reviewButton.textContent = 'Просмотреть все вопросы';
    reviewButton.addEventListener('click', () => {
        startReviewMode(0);
    });
    
    reportContainer.appendChild(reviewButton);
}

/**
 * Запускает режим просмотра всех вопросов с ответами
 */
function startReviewMode(startIndex = 0) {
    isReviewMode = true;
    currentQuestionIndex = startIndex;
    
    // Возвращаемся к тесту
    if (resultsScreen) resultsScreen.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';
    
    // Меняем текст кнопок для режима просмотра
    if (nextButton) {
        if (currentQuestionIndex < questions.length - 1) {
            nextButton.textContent = 'Следующий вопрос';
            nextButton.disabled = false;
        } else {
            nextButton.textContent = 'Завершить просмотр';
        }
    }
    
    if (prevButton) {
        prevButton.disabled = (currentQuestionIndex === 0);
    }
    
    // Добавляем кнопку возврата к результатам
    if (!document.getElementById('back-to-results')) {
        const backButton = document.createElement('button');
        backButton.id = 'back-to-results';
        backButton.textContent = 'Вернуться к результатам';
        backButton.className = 'review-btn';
        backButton.addEventListener('click', () => {
            isReviewMode = false;
            if (quizContainer) quizContainer.style.display = 'none';
            if (resultsScreen) resultsScreen.style.display = 'block';
        });
        
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            buttonsContainer.appendChild(backButton);
        }
    }
    
    displayQuestion();
}

// ===============================================
// ЧАСТЬ 4: РЕГИСТРАЦИЯ SW И ЗАПУСК ПРИЛОЖЕНИЯ
// ===============================================

/**
 * Регистрация Service Worker для обеспечения офлайн-функциональности.
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker успешно зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.error('Ошибка регистрации ServiceWorker:', error);
                });
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    loadQuestions();
    
    // Добавляем кнопку "Завершить тест" в HTML если ее нет
    if (!document.getElementById('finish-button')) {
        const finishButton = document.createElement('button');
        finishButton.id = 'finish-button';
        finishButton.textContent = 'Завершить тест';
        finishButton.style.display = 'none';
        finishButton.addEventListener('click', showResults);
        
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            buttonsContainer.appendChild(finishButton);
        }
    }
});
