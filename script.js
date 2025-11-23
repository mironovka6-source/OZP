// ===============================================
// ЧАСТЬ 1: ЛОГИКА ТЕСТА
// ===============================================

const quizContainer = document.getElementById('quiz-container');
const questionTextElement = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const nextButton = document.getElementById('next-button');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score');

let questions = []; // Массив для хранения всех вопросов
let currentQuestionIndex = 0;
let score = 0;
let userSelection = null; // Выбор пользователя для текущего вопроса

/**
 * Загружает вопросы из JSON-файла.
 */
async function loadQuestions() {
    try {
        // Запрос к файлу questions.json
        const response = await fetch('questions.json');
        questions = await response.json();
        
        // Перемешивание вопросов (по желанию)
        // questions.sort(() => Math.random() - 0.5); 
        
        displayQuestion();
        quizContainer.style.display = 'block';

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        questionTextElement.textContent = 'Не удалось загрузить вопросы. Попробуйте обновить страницу.';
    }
}

/**
 * Отображает текущий вопрос и варианты ответов.
 */
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    questionTextElement.textContent = currentQ.question;
    answersArea.innerHTML = ''; // Очистка предыдущих ответов
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
 * Обработка выбора ответа пользователем.
 */
function handleAnswerSelect(event) {
    // 1. Фиксируем выбор
    const selectedButton = event.target;
    userSelection = parseInt(selectedButton.dataset.answerId);

    // 2. Блокируем все кнопки и снимаем выделение
    Array.from(answersArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('selected');
    });

    // 3. Выделяем выбранный ответ
    selectedButton.classList.add('selected');
    nextButton.disabled = false;
    
    // 4. Проверяем ответ и обновляем счет (добавляем класс для стилизации)
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = currentQ.answers[userSelection].isCorrect;

    if (isCorrect) {
        score++;
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('wrong');
        // Показываем правильный ответ
        const correctIndex = currentQ.answers.findIndex(a => a.isCorrect);
        answersArea.children[correctIndex].classList
