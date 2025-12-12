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

// Кэширование данных
let questionsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// =======================================================
// 1. ЗАГРУЗКА ДАННЫХ
// =======================================================

async function loadQuestions() {
    // Использовать кэш, если данные актуальны
    if (questionsCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        allQuestions = questionsCache;
        console.log('Используются кэшированные вопросы');
        startScreen.style.display = 'block';
        return;
    }
    
    try {
        // Добавляем таймаут для загрузки
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(QUESTIONS_URL, { 
            signal: controller.signal,
            cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.text();
        if (!data.trim()) {
            throw new Error('Файл questions.json пустой');
        }
        
        allQuestions = JSON.parse(data);
        
        // Проверка и очистка данных от дубликатов
        allQuestions = cleanQuestionsData(allQuestions);
        
        console.log(`Загружено ${allQuestions.length} вопросов после очистки`);
        
        // Сохраняем в кэш
        questionsCache = allQuestions;
        lastFetchTime = Date.now();
        
        startScreen.style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        
        if (questionsCache) {
            allQuestions = questionsCache;
            console.log('Используются кэшированные вопросы');
            startScreen.style.display = 'block';
            return;
        }
        
        let errorMessage = 'Ошибка загрузки вопросов. Проверьте подключение.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Ошибка: Превышено время ожидания';
        } else if (error instanceof SyntaxError) {
            errorMessage = 'Ошибка: Некорректный формат JSON';
        }
        
        questionText.textContent = errorMessage;
        
        document.querySelectorAll('#class-selection button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}

// Функция для очистки вопросов от дубликатов
function cleanQuestionsData(questions) {
    if (!Array.isArray(questions)) return [];
    
    // Удаляем дубликаты по комбинации id, class и question
    const uniqueQuestions = [];
    const seen = new Set();
    
    questions.forEach(question => {
        if (!question || typeof question !== 'object') return;
        
        // Создаем уникальный ключ
        const key = `${question.id || ''}-${question.class || ''}-${question.question || ''}`;
        
        if (!seen.has(key)) {
            seen.add(key);
            
            // Проверяем и нормализуем структуру вопроса
            const cleanedQuestion = {
                id: question.id || Date.now() + Math.random(),
                class: question.class || 5,
                topic: question.topic || 'Без темы',
                question: question.question || 'Вопрос без текста',
                answers: []
            };
            
            // Обрабатываем answers
            if (Array.isArray(question.answers)) {
                question.answers.forEach((answer, index) => {
                    if (answer && typeof answer === 'object') {
                        cleanedQuestion.answers.push({
                            text: answer.text || `Вариант ${index + 1}`,
                            isCorrect: Boolean(answer.isCorrect)
                        });
                    }
                });
            }
            
            // Если нет answers, создаем пустые
            if (cleanedQuestion.answers.length === 0) {
                cleanedQuestion.answers = [
                    { text: 'Первый ответ', isCorrect: false },
                    { text: 'Второй ответ', isCorrect: true },
                    { text: 'Третий ответ', isCorrect: false },
                    { text: 'Четвертый ответ', isCorrect: false }
                ];
            }
            
            uniqueQuestions.push(cleanedQuestion);
        }
    });
    
    return uniqueQuestions;
}

// =======================================================
// 2. УПРАВЛЕНИЕ КЛАССОМ И НАЧАЛО ТЕСТА
// =======================================================

classSelection.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        currentClass = event.target.dataset.class.toString();
        selectedClassSpan.textContent = `Класс: ${currentClass}`;
        
        // Фильтруем вопросы по классу
        filteredQuestions = allQuestions.filter(q => {
            if (!q || q.class === undefined || q.class === null) return false;
            return q.class.toString() === currentClass;
        });

        if (filteredQuestions.length === 0) {
            alert(`Нет вопросов для ${currentClass} класса.`);
            return;
        }

        initializeQuiz();
    }
});

function initializeQuiz() {
    if (!filteredQuestions || filteredQuestions.length === 0) {
        alert('Нет доступных вопросов');
        return;
    }
    
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    score = 0;
    reportContainer.innerHTML = '';
    
    startScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    quizContainer.style.display = 'block';

    finishButton.style.display = 'none';
    nextButton.style.display = 'inline-block';
    nextButton.disabled = true;
    prevButton.disabled = true;

    renderNavigation();
    renderQuestion(currentQuestionIndex);
}

// =======================================================
// 3. ОТОБРАЖЕНИЕ ТЕСТА И НАВИГАЦИЯ
// =======================================================

function renderNavigation() {
    navigationPanel.innerHTML = '';
    
    if (!filteredQuestions || filteredQuestions.length === 0) return;
    
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
            if (index >= 0 && index < filteredQuestions.length) {
                currentQuestionIndex = index;
                renderQuestion(currentQuestionIndex);
                updateButtonVisibility();
            }
        });

        navigationPanel.appendChild(dot);
    });
}

function renderQuestion(index) {
    if (index < 0 || index >= filteredQuestions.length) {
        console.error(`Некорректный индекс: ${index}`);
        return;
    }
    
    const question = filteredQuestions[index];
    
    if (!question || typeof question !== 'object') {
        questionText.textContent = `Ошибка в вопросе №${index + 1}`;
        answersArea.innerHTML = '';
        updateButtonVisibility();
        return;
    }
    
    // Отображаем тему и текст вопроса
    questionText.innerHTML = `
        ${question.topic ? `<small style="color: #6610f2; font-weight: bold;">${question.topic}</small><br>` : ''}
        <strong>${index + 1}.</strong> ${question.question}
    `;
    
    answersArea.innerHTML = '';

    // Отображаем варианты ответов из нового формата
    if (!question.answers || !Array.isArray(question.answers) || question.answers.length === 0) {
        answersArea.innerHTML = '<p style="color: #e74c3c;">Нет вариантов ответа</p>';
    } else {
        question.answers.forEach((answer, optionIndex) => { 
            if (!answer || !answer.text) return;
            
            const button = document.createElement('button');
            button.classList.add('answer-option');
            button.textContent = answer.text;
            button.dataset.index = optionIndex;

            if (userAnswers[index] === optionIndex) {
                button.classList.add('selected');
            }

            button.addEventListener('click', () => {
                selectAnswer(optionIndex);
            });

            answersArea.appendChild(button);
        });
    }

    progressCounter.textContent = `${index + 1}/${filteredQuestions.length}`;
    renderNavigation();
    updateButtonVisibility();
}

function selectAnswer(optionIndex) {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.answers) {
        console.error('Вопрос не найден');
        return;
    }
    
    if (optionIndex < 0 || optionIndex >= currentQuestion.answers.length) {
        console.error('Некорректный индекс ответа');
        return;
    }
    
    userAnswers[currentQuestionIndex] = optionIndex;
    
    const answerButtons = answersArea.querySelectorAll('.answer-option');
    answerButtons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === optionIndex);
    });

    renderNavigation();
    updateButtonVisibility();
}

// =======================================================
// 4. УПРАВЛЕНИЕ КНОПКАМИ
// =======================================================

function updateButtonVisibility() {
    if (!filteredQuestions || filteredQuestions.length === 0) return;
    
    prevButton.disabled = currentQuestionIndex === 0;
    
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
    
    if (!isLastQuestion) {
        nextButton.disabled = !hasAnswer;
        nextButton.style.display = 'inline-block';
        finishButton.style.display = 'none';
    } else {
        nextButton.style.display = 'none';
        finishButton.style.display = 'inline-block';
        finishButton.disabled = !hasAnswer;
    }
}

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
        if (userAnswers[currentQuestionIndex] === null) {
            alert('Пожалуйста, выберите ответ');
            return;
        }
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
});

// =======================================================
// 5. РЕЗУЛЬТАТЫ И ЗАВЕРШЕНИЕ
// =======================================================

finishButton.addEventListener('click', () => {
    const unanswered = userAnswers.filter(answer => answer === null).length;
    
    if (unanswered > 0) {
        const confirmFinish = confirm(`Вы не ответили на ${unanswered} вопрос(ов). Завершить?`);
        if (!confirmFinish) return;
    }
    
    calculateResults();
});

function calculateResults() {
    if (!filteredQuestions || filteredQuestions.length === 0) {
        alert('Нет данных для расчета');
        return;
    }
    
    score = 0;
    reportContainer.innerHTML = '';
    let correctQuestions = 0;
    let totalQuestions = 0;
    
    filteredQuestions.forEach((question, index) => {
        if (!question || !question.answers || !Array.isArray(question.answers)) {
            console.warn(`Пропущен вопрос ${index + 1}`);
            return;
        }

        totalQuestions++;
        const userAnswerIndex = userAnswers[index];
        
        // Находим правильный ответ
        const correctAnswerIndex = question.answers.findIndex(answer => answer.isCorrect);
        
        if (correctAnswerIndex === -1) {
            console.warn(`Нет правильного ответа в вопросе ${index + 1}`);
            return;
        }

        const isCorrect = userAnswerIndex !== null && userAnswerIndex === correctAnswerIndex;
        
        if (isCorrect) {
            score++;
            correctQuestions++;
        } else {
            // Создаем отчет об ошибке
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item', 'wrong');
            
            let selectedText = 'Вы не ответили на этот вопрос.';
            if (userAnswerIndex !== null && question.answers[userAnswerIndex]) {
                selectedText = `Ваш ответ: ${question.answers[userAnswerIndex].text}`;
            }
            
            const correctText = `Верный ответ: ${question.answers[correctAnswerIndex].text}`;
            
            resultItem.innerHTML = `
                <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #c0392b;">
                    <p style="margin-bottom: 10px;">
                        <strong>Вопрос ${index + 1}:</strong> ${question.question}
                    </p>
                    <p style="color: #c0392b; margin-bottom: 5px;">${selectedText}</p>
                    <p style="color: #27ae60; font-weight: bold; margin-bottom: 5px;">${correctText}</p>
                    ${question.topic ? `<p style="color: #7f8c8d; font-size: 0.9em;">Тема: ${question.topic}</p>` : ''}
                </div>
            `;
            reportContainer.appendChild(resultItem);
        }
    });

    // Обновляем результаты
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreSpan.textContent = `${score} из ${filteredQuestions.length}`;
    
    // Показываем статистику
    const statsHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 1.1em;">Правильно: <strong style="color: #27ae60;">${correctQuestions}</strong></p>
            <p style="font-size: 1.1em;">Неправильно: <strong style="color: #c0392b;">${filteredQuestions.length - correctQuestions}</strong></p>
            <p style="font-size: 1.1em;">Процент правильных: <strong>${Math.round((correctQuestions / filteredQuestions.length) * 100)}%</strong></p>
        </div>
    `;
    
    if (reportContainer.children.length === 0) {
        reportContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #e8f5e9; border-radius: 10px; margin: 20px 0;">
                <p style="font-size: 1.3em; color: #27ae60; font-weight: bold;">🎉 Поздравляем! 🎉</p>
                <p>Вы ответили правильно на все вопросы теста!</p>
                ${statsHTML}
            </div>
        `;
    } else {
        reportContainer.insertAdjacentHTML('afterbegin', statsHTML);
    }
}

restartButton.addEventListener('click', () => {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
    currentClass = null;
    
    document.querySelectorAll('#class-selection button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
});

// =======================================================
// 6. ГОРЯЧИЕ КЛАВИШИ
// =======================================================

document.addEventListener('keydown', (e) => {
    if (quizContainer.style.display !== 'block') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!prevButton.disabled) prevButton.click();
            break;
        case 'ArrowRight':
            if (!nextButton.disabled && nextButton.style.display !== 'none') nextButton.click();
            break;
        case 'Enter':
            if (finishButton.style.display !== 'none' && !finishButton.disabled) finishButton.click();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            const keyNum = parseInt(e.key) - 1;
            const currentOptions = filteredQuestions[currentQuestionIndex]?.answers;
            if (currentOptions && keyNum >= 0 && keyNum < currentOptions.length) {
                selectAnswer(keyNum);
            }
            break;
    }
});

// Предупреждение при закрытии страницы
window.addEventListener('beforeunload', (e) => {
    if (quizContainer.style.display === 'block' && userAnswers.some(answer => answer !== null)) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные ответы. Вы уверены, что хотите покинуть страницу?';
    }
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadQuestions);
