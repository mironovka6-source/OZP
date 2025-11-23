// ===============================================
// ЧАСТЬ 1: ЛОГИКА ТЕСТА
// ===============================================

const quizContainer = document.getElementById('quiz-container');
const questionTextElement = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const nextButton = document.getElementById('next-button');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score');

let questions = []; 
let currentQuestionIndex = 0;
let score = 0;
let userSelection = null; 

/**
 * Асинхронно загружает вопросы из JSON-файла.
 */
async function loadQuestions() {
    try {
        // Убедитесь, что questions.json лежит в корневой папке
        const response = await fetch('questions.json'); 
        questions = await response.json();
        
        // questions.sort(() => Math.random() - 0.5); // Можно добавить перемешивание
        
        displayQuestion();
        quizContainer.style.display = 'block';

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        questionTextElement.textContent = 'Не удалось загрузить вопросы. Убедитесь, что questions.json существует.';
    }
}

/**
 * Отображает текущий вопрос и варианты ответов.
 */
function displayQuestion() {
    // Проверка, достигнут ли конец теста
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    
    // Обновляем номер класса и текст вопроса
    document.querySelector('.current-class').textContent = `Класс: ${currentQ.class}`;
    questionTextElement.textContent = currentQ.question;
    
    answersArea.innerHTML = ''; 
    nextButton.disabled = true;
    userSelection = null;

    currentQ.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.textContent = answer.text;
        button.dataset.answerId = index;
        button.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(button);
    });
}

/**
 * Обработка выбора ответа пользователем и проверка.
 */
function handleAnswerSelect(event) {
    const selectedButton = event.target;
    userSelection = parseInt(selectedButton.dataset.answerId);

    // Блокируем все кнопки после выбора
    Array.from(answersArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('selected');
    });

    selectedButton.classList.add('selected');
    nextButton.disabled = false;
    
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = currentQ.answers[userSelection].isCorrect;

    // Подсчет баллов и стилизация
    if (isCorrect) {
        score++;
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('wrong');
        // Показываем правильный ответ
        const correctIndex = currentQ.answers.findIndex(a => a.isCorrect);
        if (correctIndex !== -1) {
             answersArea.children[correctIndex].classList.add('correct');
        }
    }
}

/**
 * Переход к следующему вопросу.
 */
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

/**
 * Отображение финального экрана результатов.
 */
function showResults() {
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreDisplay.textContent = `${score} из ${questions.length}`;
}


// ===============================================
// ЧАСТЬ 2: РЕГИСТРАЦИЯ SERVICE WORKER (PWA)
// ===============================================

/**
 * Регистрация Service Worker для обеспечения офлайн-функциональности.
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Добавляем слушатель события load, чтобы Service Worker регистрировался после загрузки страницы
        window.addEventListener('load', () => {
            // Убедитесь, что sw.js лежит в корневой папке
            navigator.serviceWorker.register('/sw.js') 
                .then(registration => {
                    console.log('ServiceWorker успешно зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.error('Ошибка регистрации ServiceWorker. Убедитесь, что sw.js существует:', error);
                });
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker(); // Сначала регистрируем PWA-часть
    loadQuestions();         // Затем загружаем тест
});
