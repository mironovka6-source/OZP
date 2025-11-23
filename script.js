// ===============================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ И УТИЛИТЫ
// ===============================================

// Получение элементов DOM (важно: ID должны совпадать с index.html!)
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const questionTextElement = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const nextButton = document.getElementById('next-button');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score');
const classSelectionArea = document.getElementById('class-selection'); // Контейнер кнопок выбора класса

let allQuestions = []; // Хранит все вопросы из questions.json
let questions = []; // Отфильтрованные, перемешанные вопросы для текущего теста
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = []; // Хранит историю ответов пользователя

/**
 * Утилита для случайного перемешивания массива (Fisher-Yates).
 * Используется для перемешивания вопросов и вариантов ответов.
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
 * Асинхронно загружает все вопросы из JSON-файла.
 * Назначает обработчики событий кнопкам выбора класса.
 */
async function loadQuestions() {
    try {
        const response = await fetch('questions.json'); 
        allQuestions = await response.json();
        
        // Добавляем слушатели к кнопкам классов, если контейнер найден (Fix для ошибки null)
        if (classSelectionArea) {
            Array.from(classSelectionArea.children).forEach(button => {
                button.addEventListener('click', handleClassSelect);
            });
        }

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        if (questionTextElement) {
            questionTextElement.textContent = 'Не удалось загрузить вопросы. Проверьте файл questions.json.';
        }
    }
}

/**
 * Обработка выбора класса пользователем.
 * Фильтрует, перемешивает вопросы и запускает тест.
 */
function handleClassSelect(event) {
    const selectedClass = parseInt(event.target.dataset.class);
    
    // 1. Фильтруем вопросы по выбранному классу
    questions = allQuestions.filter(q => q.class === selectedClass);
    
    if (questions.length === 0) {
        alert(`Для ${selectedClass} класса вопросов пока нет. Выберите другой.`);
        return;
    }

    // 2. Перемешиваем список вопросов
    shuffleArray(questions);
    
    // 3. Сброс состояния для нового теста
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = [];

    // 4. Скрываем начальный экран и показываем тест
    if (startScreen) startScreen.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';
    
    // Обновляем отображение класса
    const classDisplay = document.querySelector('.current-class');
    if (classDisplay) {
        classDisplay.textContent = `Класс: ${selectedClass}`;
    }
    
    displayQuestion();
}


// ===============================================
// ЧАСТЬ 2: ЛОГИКА ТЕСТА
// ===============================================

/**
 * Отображает текущий вопрос и варианты ответов, перемешивая их.
 */
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    questionTextElement.textContent = currentQ.question;
    answersArea.innerHTML = ''; 
    nextButton.disabled = true;

    // Перемешиваем варианты ответов перед отображением
    const shuffledAnswers = [...currentQ.answers]; 
    shuffleArray(shuffledAnswers);

    shuffledAnswers.forEach((answer) => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.textContent = answer.text;
        // Используем текст ответа, чтобы найти его при проверке
        button.dataset.answerText = answer.text; 
        button.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(button);
    });
}

/**
 * Обработка выбора ответа пользователем, стилизация и запись в историю.
 */
function handleAnswerSelect(event) {
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
    
    // Находим выбранный ответ и правильный ответ для проверки и записи
    const selectedAnswer = currentQ.answers.find(a => a.text === selectedAnswerText);
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswerText = currentQ.answers.find(a => a.isCorrect).text;

    // Стилизация выбранного ответа и правильного
    if (isCorrect) {
        score++;
        selectedButton.classList.add('correct'); // Зеленый
    } else {
        selectedButton.classList.add('wrong'); // Красный
        
        // Показываем правильный ответ
        const correctButton = Array.from(answersArea.children)
            .find(btn => btn.dataset.answerText === correctAnswerText);
        if (correctButton) {
             correctButton.classList.add('correct');
        }
    }

    // СОХРАНЕНИЕ В ИСТОРИЮ
    answerHistory.push({
        id: currentQ.id,
        question: currentQ.question,
        userAnswer: selectedAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect
    });
}

/**
 * Переход к следующему вопросу.
 */
if (nextButton) {
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
}


// ===============================================
// ЧАСТЬ 3: РЕЗУЛЬТАТЫ И ДЕТАЛЬНЫЙ ОТЧЕТ
// ===============================================

/**
 * Отображение финального экрана результатов и детального отчета.
 */
function showResults() {
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
        // Создаем контейнер, если он еще не добавлен в HTML
        reportContainer = document.createElement('div');
        reportContainer.id = 'report-container';
        resultsScreen.appendChild(reportContainer);
    }
    
    if (!reportContainer) return; // Выход, если контейнер результатов отсутствует
    
    reportContainer.innerHTML = '<h2>Детальный отчет:</h2>';

    answerHistory.forEach(item => {
        const resultClass = item.isCorrect ? 'report-correct' : 'report-wrong';
        const resultText = item.isCorrect ? '✅ Правильно' : '❌ Неправильно';

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('report-item');
        itemDiv.innerHTML = `
            <p><strong>Вопрос:</strong> ${item.question}</p>
            <p><strong>Ваш ответ:</strong> <span class="${item.isCorrect ? 'correct' : 'wrong'}">${item.userAnswer}</span></p>
            ${!item.isCorrect ? `<p><strong>Правильный ответ:</strong> <span class="correct">${item.correctAnswer}</span></p>` : ''}
            <p class="status ${resultClass}">Статус: ${resultText}</p>
        `;

        reportContainer.appendChild(itemDiv);
    });
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
            // Использование относительного пути ('sw.js') для совместимости с GitHub Pages
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

// Запуск приложения: регистрация Service Worker и загрузка вопросов
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    loadQuestions();
});
