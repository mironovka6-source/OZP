// ===============================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ И УТИЛИТЫ
// ===============================================

const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const questionTextElement = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const nextButton = document.getElementById('next-button');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score');
const classSelectionArea = document.getElementById('class-selection');

let allQuestions = []; // Для хранения всех вопросов из JSON
let questions = []; // Отфильтрованные и перемешанные вопросы
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = []; // Для хранения истории ответов

/**
 * Утилита для случайного перемешивания массива (используется для вопросов и ответов).
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===============================================
// ЧАСТЬ 1: ЗАГРУЗКА И НАЧАЛО ТЕСТА
// ===============================================

/**
 * Загружает вопросы один раз при запуске.
 */
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        allQuestions = await response.json();
        
        // Добавляем слушатели к кнопкам классов
        Array.from(classSelectionArea.children).forEach(button => {
            button.addEventListener('click', handleClassSelect);
        });

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        questionTextElement.textContent = 'Не удалось загрузить вопросы.';
    }
}

/**
 * Обработка выбора класса пользователем.
 */
function handleClassSelect(event) {
    const selectedClass = parseInt(event.target.dataset.class);
    
    // 1. Фильтруем вопросы по классу
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
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
    document.querySelector('.current-class').textContent = `Класс: ${selectedClass}`;
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

    // Перемешиваем варианты ответов
    const shuffledAnswers = [...currentQ.answers]; // Клонируем массив ответов
    shuffleArray(shuffledAnswers);

    shuffledAnswers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.textContent = answer.text;
        // Используем текст ответа, чтобы найти его в исходном массиве при проверке
        button.dataset.answerText = answer.text; 
        button.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(button);
    });
}

/**
 * Обработка выбора ответа пользователем и запись в историю.
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
    
    // Находим выбранный ответ в исходном массиве для проверки isCorrect
    const selectedAnswer = currentQ.answers.find(a => a.text === selectedAnswerText);
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswerText = currentQ.answers.find(a => a.isCorrect).text;

    // Стилизация выбранного ответа и правильного
    if (isCorrect) {
        score++;
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
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});


// ===============================================
// ЧАСТЬ 3: РЕЗУЛЬТАТЫ И ДЕТАЛЬНЫЙ ОТЧЕТ
// ===============================================

/**
 * Отображение финального экрана результатов и детального отчета.
 */
function showResults() {
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreDisplay.textContent = `${score} из ${questions.length}`;

    generateDetailedReport(); 
}

/**
 * Генерирует и отображает детальный отчет по всем вопросам.
 */
function generateDetailedReport() {
    let reportContainer = document.getElementById('report-container'); 
    
    if (!reportContainer) {
        reportContainer = document.createElement('div');
        reportContainer.id = 'report-container';
        resultsScreen.appendChild(reportContainer);
    }
    
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
// ЧАСТЬ 4: РЕГИСТРАЦИЯ SW И ЗАПУСК
// ===============================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Используем относительный путь для совместимости с GitHub Pages
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
});
