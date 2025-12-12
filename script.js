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
// 1. ЗАГРУЗКА ДАННЫХ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд
        
        const response = await fetch(QUESTIONS_URL, { 
            signal: controller.signal,
            cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        // Сначала получаем как текст для проверки
        const data = await response.text();
        if (!data.trim()) {
            throw new Error('Файл questions.json пустой');
        }
        
        // Парсим JSON
        allQuestions = JSON.parse(data);
        
        // Проверка структуры данных
        if (!Array.isArray(allQuestions)) {
            throw new Error('questions.json должен содержать массив вопросов');
        }
        
        console.log(`Вопросы успешно загружены! Всего ${allQuestions.length} вопросов.`);
        
        // Сохраняем в кэш
        questionsCache = allQuestions;
        lastFetchTime = Date.now();
        
        startScreen.style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        
        // При ошибке сети используем кэш, если он есть
        if (questionsCache) {
            allQuestions = questionsCache;
            console.log('Используются кэшированные вопросы из-за ошибки сети');
            startScreen.style.display = 'block';
            return;
        }
        
        // Показываем понятное сообщение пользователю
        let errorMessage = 'Ошибка загрузки вопросов. Проверьте подключение.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Ошибка: Превышено время ожидания загрузки вопросов';
        } else if (error instanceof SyntaxError) {
            errorMessage = 'Ошибка: Некорректный формат questions.json';
        } else if (error.message.includes('пустой')) {
            errorMessage = 'Ошибка: Файл с вопросами пустой';
        }
        
        questionText.textContent = errorMessage;
        
        // Отключаем кнопки выбора класса
        document.querySelectorAll('#class-selection button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
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
        
        // Фильтрация вопросов по классу
        filteredQuestions = allQuestions.filter(q => {
            // Проверяем наличие поля class и сравниваем как строки
            if (!q || q.class === undefined || q.class === null) return false;
            return q.class.toString() === currentClass;
        });

        if (filteredQuestions.length === 0) {
            alert(`Нет вопросов для ${currentClass} класса. Проверьте поле "class" в questions.json.`);
            return;
        }

        // Дополнительная проверка структуры вопросов
        const invalidQuestions = filteredQuestions.filter(q => 
            !q.question || !q.options || !Array.isArray(q.options) || q.options.length === 0
        );
        
        if (invalidQuestions.length > 0) {
            console.warn(`Найдено ${invalidQuestions.length} вопросов с некорректной структурой`);
            // Можно показать предупреждение или отфильтровать некорректные вопросы
            filteredQuestions = filteredQuestions.filter(q => 
                q.question && q.options && Array.isArray(q.options) && q.options.length > 0
            );
        }

        initializeQuiz();
    }
});

function initializeQuiz() {
    // Проверка наличия вопросов
    if (!filteredQuestions || filteredQuestions.length === 0) {
        alert('Нет доступных вопросов для тестирования');
        return;
    }
    
    // Сброс состояния
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    score = 0;
    reportContainer.innerHTML = '';
    
    // Переключение экранов
    startScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    quizContainer.style.display = 'block';

    // Сброс кнопок к начальному состоянию
    finishButton.style.display = 'none';
    nextButton.style.display = 'inline-block';
    nextButton.disabled = true; // Первоначально отключена, пока нет ответа
    prevButton.disabled = true;

    renderNavigation();
    renderQuestion(currentQuestionIndex);
}

// =======================================================
// 3. ОТОБРАЖЕНИЕ ТЕСТА И НАВИГАЦИЯ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
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
    // Проверка индекса
    if (index < 0 || index >= filteredQuestions.length) {
        console.error(`Некорректный индекс вопроса: ${index}`);
        questionText.textContent = 'Ошибка: некорректный индекс вопроса';
        answersArea.innerHTML = '';
        return;
    }
    
    const question = filteredQuestions[index];
    
    // Проверка структуры вопроса
    if (!question || typeof question !== 'object') {
        questionText.textContent = `Ошибка: Вопрос №${index + 1} имеет некорректную структуру`;
        answersArea.innerHTML = '';
        updateButtonVisibility();
        return;
    }
    
    // Проверка наличия options
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        questionText.textContent = `Ошибка: Вопрос №${index + 1} не содержит вариантов ответа`;
        answersArea.innerHTML = '';
        updateButtonVisibility();
        return; 
    }
    
    questionText.textContent = `${index + 1}. ${question.question}`;
    answersArea.innerHTML = '';

    // Отображение вариантов ответов
    question.options.forEach((option, optionIndex) => { 
        if (!option || option.trim() === '') {
            console.warn(`Пустой вариант ответа в вопросе ${index + 1}, вариант ${optionIndex}`);
            return;
        }
        
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
    // Проверка валидности индекса
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.options) {
        console.error('Текущий вопрос не найден или не имеет вариантов ответа');
        return;
    }
    
    if (optionIndex < 0 || optionIndex >= currentQuestion.options.length) {
        console.error('Некорректный индекс ответа:', optionIndex);
        return;
    }
    
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Более эффективный способ обновления стилей
    const answerButtons = answersArea.querySelectorAll('.answer-option');
    answerButtons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === optionIndex);
    });

    renderNavigation(); // Обновляем точку навигации как "answered"
    updateButtonVisibility(); // Обновляем состояние кнопок
}

// =======================================================
// 4. УПРАВЛЕНИЕ КНОПКАМИ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// =======================================================

function updateButtonVisibility() {
    if (!filteredQuestions || filteredQuestions.length === 0) return;
    
    // Кнопка "Назад"
    prevButton.disabled = currentQuestionIndex === 0;

    // Кнопка "Далее" должна быть активна только если есть ответ на текущий вопрос
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
    
    // Для НЕ последнего вопроса
    if (!isLastQuestion) {
        nextButton.disabled = !hasAnswer;
        nextButton.style.display = 'inline-block';
        finishButton.style.display = 'none';
    } 
    // Для последнего вопроса
    else {
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
        // Проверяем, есть ли ответ на текущий вопрос
        if (userAnswers[currentQuestionIndex] === null) {
            alert('Пожалуйста, выберите ответ на текущий вопрос перед переходом к следующему');
            return;
        }
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
});

// =======================================================
// 5. РЕЗУЛЬТАТЫ И ЗАВЕРШЕНИЕ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// =======================================================

finishButton.addEventListener('click', () => {
    // Проверить, все ли вопросы отвечены
    const unanswered = userAnswers.filter(answer => answer === null).length;
    
    if (unanswered > 0) {
        const confirmFinish = confirm(`Вы не ответили на ${unanswered} вопрос(а/ов). Завершить тест?`);
        if (!confirmFinish) return;
    }
    
    calculateResults();
});

function calculateResults() {
    if (!filteredQuestions || filteredQuestions.length === 0) {
        alert('Нет данных для расчета результатов');
        return;
    }
    
    score = 0;
    reportContainer.innerHTML = '';
    
    filteredQuestions.forEach((question, index) => {
        // Пропускаем вопросы с некорректной структурой
        if (!question || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
            console.warn(`Пропущен вопрос ${index + 1} из-за некорректной структуры`);
            return;
        }

        const userAnswerIndex = userAnswers[index];
        const correctIndex = question.correctAnswerIndex;
        
        // Проверка корректности correctAnswerIndex
        if (correctIndex === undefined || correctIndex === null || 
            correctIndex < 0 || correctIndex >= question.options.length) {
            console.error(`Некорректный correctAnswerIndex в вопросе ${index + 1}:`, correctIndex);
            return;
        }

        const isCorrect = userAnswerIndex !== null && userAnswerIndex === correctIndex;
        
        if (isCorrect) {
            score++;
        } else {
            // Создание отчета об ошибке
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item', 'wrong');
            
            const selectedText = userAnswerIndex !== null ? 
                `Ваш ответ: ${question.options[userAnswerIndex]}` : 
                `Вы не ответили на этот вопрос.`;
            
            const correctText = `Верный ответ: ${question.options[correctIndex]}`;
            
            resultItem.innerHTML = `
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <p style="margin-bottom: 8px;"><strong>Вопрос ${index + 1}:</strong> ${question.question}</p>
                    <p style="color: #c0392b; margin-bottom: 5px;">${selectedText}</p>
                    <p style="color: #27ae60; font-weight: bold;">${correctText}</p>
                    ${question.explanation ? `<p style="margin-top: 8px; color: #7f8c8d; font-style: italic;">Объяснение: ${question.explanation}</p>` : ''}
                </div>
            `;
            reportContainer.appendChild(resultItem);
        }
    });

    // Обновление экрана результатов
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
    scoreSpan.textContent = `${score} из ${filteredQuestions.length}`;
    
    // Если нет ошибок, показываем сообщение
    if (reportContainer.children.length === 0) {
        reportContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #27ae60;">
                <p style="font-size: 1.2em; font-weight: bold;">Поздравляем! Все ответы верны!</p>
                <p>Вы ответили правильно на все вопросы теста.</p>
            </div>
        `;
    }
}

restartButton.addEventListener('click', () => {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
    currentClass = null;
    
    // Включаем кнопки классов обратно
    document.querySelectorAll('#class-selection button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
});

// =======================================================
// 6. ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// =======================================================

// Сохраняем прогресс при закрытии страницы (опционально)
window.addEventListener('beforeunload', (e) => {
    if (quizContainer.style.display === 'block' && userAnswers.some(answer => answer !== null)) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные ответы. Вы уверены, что хотите покинуть страницу?';
    }
});

// Добавляем горячие клавиши
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
            const currentOptions = filteredQuestions[currentQuestionIndex]?.options;
            if (currentOptions && keyNum >= 0 && keyNum < currentOptions.length) {
                selectAnswer(keyNum);
            }
            break;
    }
});

// Запускаем загрузку вопросов при старте страницы
loadQuestions();
