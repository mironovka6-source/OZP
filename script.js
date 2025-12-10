// ===============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ===============================================
let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = [];
let currentClass = null;
let isTestRunning = false;

// ===============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM загружен, инициализация приложения');
    
    // Создаем кнопку "Завершить" если её нет в HTML
    ensureFinishButtonExists();
    
    // Создаем контейнер для отчета если его нет
    ensureReportContainerExists();
    
    // Настраиваем все обработчики
    setupAllEventListeners();
    
    // Загружаем вопросы
    loadQuestions();
});

// ===============================================
// СОЗДАНИЕ ОТСУТСТВУЮЩИХ ЭЛЕМЕНТОВ
// ===============================================
function ensureFinishButtonExists() {
    const finishButton = document.getElementById('finish-button');
    if (!finishButton) {
        console.log('➕ Создаю кнопку "Завершить"');
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            const newFinishButton = document.createElement('button');
            newFinishButton.id = 'finish-button';
            newFinishButton.textContent = '🏁 Завершить тест';
            newFinishButton.style.display = 'none';
            buttonsContainer.appendChild(newFinishButton);
        }
    }
}

function ensureReportContainerExists() {
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.log('➕ Создаю контейнер для отчета');
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const newReportContainer = document.createElement('div');
            newReportContainer.id = 'report-container';
            resultsScreen.appendChild(newReportContainer);
        }
    }
}

// ===============================================
// НАСТРОЙКА ВСЕХ ОБРАБОТЧИКОВ СОБЫТИЙ
// ===============================================
function setupAllEventListeners() {
    console.log('🔧 Настройка обработчиков событий...');
    
    // 1. Обработчики для кнопок классов
    setupClassButtons();
    
    // 2. Обработчики для навигации
    setupNavigationButtons();
    
    // 3. Обработчик для кнопки "Начать заново"
    setupRestartButton();
}

function setupClassButtons() {
    const classButtons = document.querySelectorAll('#class-selection button');
    classButtons.forEach(button => {
        // Очищаем старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Получаем обновленные кнопки
    const updatedButtons = document.querySelectorAll('#class-selection button');
    updatedButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎯 Нажата кнопка класса: ${classNum}`);
            startTest(classNum);
        });
    });
}

function setupNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const finishButton = document.getElementById('finish-button');
    
    if (prevButton) {
        prevButton.addEventListener('click', handlePrevButton);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', handleNextButton);
    }
    
    if (finishButton) {
        finishButton.addEventListener('click', handleFinishButton);
        console.log('✅ Обработчик для кнопки "Завершить" настроен');
    } else {
        console.error('❌ Кнопка "Завершить" не найдена');
    }
}

function setupRestartButton() {
    let restartButton = document.getElementById('restart-button');
    
    if (!restartButton) {
        // Создаем кнопку если её нет
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            restartButton = document.createElement('button');
            restartButton.id = 'restart-button';
            restartButton.textContent = '🔄 Начать заново';
            resultsScreen.appendChild(restartButton);
            console.log('➕ Создана кнопка "Начать заново"');
        }
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', handleRestartButton);
        console.log('✅ Обработчик для кнопки "Начать заново" настроен');
    }
}

// ===============================================
// ЗАГРУЗКА ВОПРОСОВ ИЗ JSON
// ===============================================
async function loadQuestions() {
    try {
        console.log('📥 Загрузка вопросов из questions.json...');
        
        const response = await fetch('questions.json');
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        allQuestions = await response.json();
        console.log(`✅ Загружено ${allQuestions.length} вопросов`);
        
        // Обновляем кнопки классов после загрузки вопросов
        updateClassButtons();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки вопросов:', error);
        showError('Не удалось загрузить вопросы. Проверьте файл questions.json');
    }
}

// ===============================================
// ОБНОВЛЕНИЕ КНОПОК КЛАССОВ
// ===============================================
function updateClassButtons() {
    console.log('🔘 Обновление кнопок классов...');
    
    const classButtons = document.querySelectorAll('#class-selection button');
    const availableClasses = {};
    
    // Считаем вопросы по классам
    allQuestions.forEach(question => {
        if (!availableClasses[question.class]) {
            availableClasses[question.class] = 0;
        }
        availableClasses[question.class]++;
    });
    
    // Обновляем каждую кнопку
    classButtons.forEach(button => {
        const classNum = parseInt(button.getAttribute('data-class'));
        const questionCount = availableClasses[classNum] || 0;
        
        if (questionCount > 0) {
            // Класс доступен
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.innerHTML = `${classNum} класс <span style="font-size:0.8em;opacity:0.7">(${questionCount})</span>`;
            button.title = `Пройти тест (${questionCount} вопросов)`;
        } else {
            // Класс недоступен
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.innerHTML = `${classNum} класс`;
            button.title = 'Вопросы не найдены';
        }
    });
    
    console.log('✅ Кнопки классов обновлены');
}

// ===============================================
// ЗАПУСК ТЕСТА
// ===============================================
function startTest(classNum) {
    console.log(`🚀 Запуск теста для ${classNum} класса`);
    
    // Проверяем, есть ли вопросы для этого класса
    const classQuestions = allQuestions.filter(q => q.class === classNum);
    
    if (classQuestions.length === 0) {
        alert(`Для ${classNum} класса нет вопросов!`);
        return;
    }
    
    // Устанавливаем состояние
    currentClass = classNum;
    questions = [...classQuestions];
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = new Array(questions.length).fill(null);
    isTestRunning = true;
    
    console.log(`📊 Найдено ${questions.length} вопросов`);
    
    // Перемешиваем вопросы
    shuffleArray(questions);
    
    // Переключаем экраны
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-screen').style.display = 'none';
    
    // Обновляем информацию о классе
    document.getElementById('selected-class').textContent = classNum;
    
    // Создаем навигационные кнопки
    createNavigationButtons();
    
    // Показываем первый вопрос
    displayCurrentQuestion();
}

// ===============================================
// УТИЛИТЫ
// ===============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===============================================
// НАВИГАЦИОННАЯ ПАНЕЛЬ
// ===============================================
function createNavigationButtons() {
    const navigationPanel = document.getElementById('navigation-panel');
    if (!navigationPanel) return;
    
    navigationPanel.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const button = document.createElement('button');
        button.className = 'nav-btn';
        button.textContent = i + 1;
        button.dataset.index = i;
        
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            goToQuestion(index);
        });
        
        navigationPanel.appendChild(button);
    }
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach((button, index) => {
        button.classList.remove('current', 'answered');
        
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        
        if (answerHistory[index] !== null) {
            button.classList.add('answered');
        }
    });
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    displayCurrentQuestion();
}

function updateProgress() {
    const answeredCount = answerHistory.filter(answer => answer !== null).length;
    document.getElementById('progress-counter').textContent = 
        `Отвечено: ${answeredCount} из ${questions.length}`;
}

// ===============================================
// ОТОБРАЖЕНИЕ ВОПРОСА
// ===============================================
function displayCurrentQuestion() {
    console.log(`📝 Показ вопроса ${currentQuestionIndex + 1} из ${questions.length}`);
    
    if (!isTestRunning || currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    const currentQ = questions[currentQuestionIndex];
    
    // Обновляем текст вопроса
    document.getElementById('question-text').textContent = 
        `${currentQuestionIndex + 1}. ${currentQ.question}`;
    
    // Очищаем предыдущие ответы
    const answersArea = document.getElementById('answers-area');
    answersArea.innerHTML = '';
    
    // Обновляем состояние кнопок навигации
    document.getElementById('prev-button').disabled = currentQuestionIndex === 0;
    document.getElementById('next-button').disabled = true;
    
    // Проверяем, последний ли это вопрос
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    // Получаем кнопки
    const nextButton = document.getElementById('next-button');
    const finishButton = document.getElementById('finish-button');
    
    if (nextButton) {
        nextButton.style.display = isLastQuestion ? 'none' : 'inline-block';
    }
    
    if (finishButton) {
        finishButton.style.display = isLastQuestion ? 'inline-block' : 'none';
        console.log(`🎯 Кнопка "Завершить": ${finishButton.style.display}`);
    }
    
    // Создаем варианты ответов
    const letters = ['А', 'Б', 'В', 'Г'];
    currentQ.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.dataset.index = index;
        answerElement.dataset.correct = answer.isCorrect;
        
        answerElement.innerHTML = `
            <span class="answer-letter">${letters[index]}</span>
            <span class="answer-text">${answer.text}</span>
        `;
        
        // Если уже есть ответ на этот вопрос, отмечаем его
        const userAnswer = answerHistory[currentQuestionIndex];
        if (userAnswer && userAnswer.index === index) {
            answerElement.classList.add('selected');
            if (userAnswer.isCorrect) {
                answerElement.classList.add('correct');
            } else {
                answerElement.classList.add('wrong');
            }
        }
        
        // Добавляем обработчик клика
        answerElement.addEventListener('click', handleAnswerClick);
        answersArea.appendChild(answerElement);
    });
    
    updateNavigationButtons();
    updateProgress();
}

// ===============================================
// ОБРАБОТКА ВЫБОРА ОТВЕТА
// ===============================================
function handleAnswerClick(event) {
    const answerElement = event.currentTarget;
    const answerIndex = parseInt(answerElement.dataset.index);
    const isCorrect = answerElement.dataset.correct === 'true';
    
    // Снимаем выделение со всех вариантов
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Выделяем выбранный вариант
    answerElement.classList.add('selected');
    
    // Показываем правильность ответа
    if (isCorrect) {
        answerElement.classList.add('correct');
    } else {
        answerElement.classList.add('wrong');
        
        // Показываем правильный ответ
        const correctOption = document.querySelector('.answer-option[data-correct="true"]');
        if (correctOption) {
            correctOption.classList.add('correct');
        }
    }
    
    // Сохраняем ответ
    answerHistory[currentQuestionIndex] = {
        index: answerIndex,
        isCorrect: isCorrect,
        text: answerElement.querySelector('.answer-text').textContent
    };
    
    // Блокируем все варианты
    document.querySelectorAll('.answer-option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Активируем кнопку "Следующий"
    document.getElementById('next-button').disabled = false;
    
    updateProgress();
}

// ===============================================
// ОБРАБОТЧИКИ КНОПОК НАВИГАЦИИ
// ===============================================
function handlePrevButton() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

function handleNextButton() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

function handleFinishButton() {
    console.log('🎯 Нажата кнопка "Завершить"');
    showResults();
}

function handleRestartButton() {
    restartTest();
}

// ===============================================
// ПОКАЗ РЕЗУЛЬТАТОВ
// ===============================================
function showResults() {
    console.log('🏁 Показ результатов теста');
    isTestRunning = false;
    
    // Подсчитываем правильные ответы
    const correctAnswers = answerHistory.filter(answer => answer && answer.isCorrect).length;
    score = correctAnswers;
    
    console.log(`🏆 Результат: ${score} из ${questions.length}`);
    
    // Переключаем экраны
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // Обновляем счет
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `${score} из ${questions.length}`;
    } else {
        console.error('❌ Элемент #score не найден');
    }
    
    // Генерируем отчет
    generateReport();
}

function generateReport() {
    console.log('📊 Генерация отчета...');
    
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.error('❌ Контейнер для отчета не найден');
        return;
    }
    
    // Очищаем контейнер
    reportContainer.innerHTML = '';
    
    // Добавляем заголовок
    const title = document.createElement('h3');
    title.textContent = 'Детальный отчет:';
    title.style.marginBottom = '20px';
    title.style.color = '#333';
    reportContainer.appendChild(title);
    
    // Проверяем, есть ли ответы
    if (answerHistory.length === 0) {
        const noAnswers = document.createElement('p');
        noAnswers.textContent = 'Нет данных для отчета';
        noAnswers.style.color = '#666';
        noAnswers.style.textAlign = 'center';
        noAnswers.style.padding = '20px';
        reportContainer.appendChild(noAnswers);
        return;
    }
    
    // Создаем элементы отчета
    answerHistory.forEach((answer, index) => {
        if (answer === null) return;
        
        const question = questions[index];
        const isCorrect = answer.isCorrect;
        
        const reportItem = document.createElement('div');
        reportItem.className = `report-item ${isCorrect ? 'correct' : 'incorrect'}`;
        reportItem.style.cssText = `
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 5px solid ${isCorrect ? '#2ecc71' : '#e74c3c'};
            background: ${isCorrect ? '#f0fff4' : '#fff5f5'};
        `;
        
        // Вопрос
        const questionDiv = document.createElement('div');
        questionDiv.className = 'report-question';
        questionDiv.innerHTML = `<strong>Вопрос ${index + 1}:</strong> ${question.question}`;
        questionDiv.style.marginBottom = '10px';
        questionDiv.style.fontSize = '16px';
        
        // Ответ пользователя
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.className = 'report-answer';
        userAnswerDiv.innerHTML = `
            <span style="color: ${isCorrect ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                Ваш ответ: ${answer.text} ${isCorrect ? '✅' : '❌'}
            </span>
        `;
        userAnswerDiv.style.marginBottom = '5px';
        
        reportItem.appendChild(questionDiv);
        reportItem.appendChild(userAnswerDiv);
        
        // Если ответ неправильный, показываем правильный
        if (!isCorrect) {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (correctAnswer) {
                const correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.className = 'correct-answer';
                correctAnswerDiv.innerHTML = `
                    <span style="color: #27ae60; font-weight: bold;">
                        Правильный ответ: ${correctAnswer.text} ✅
                    </span>
                `;
                correctAnswerDiv.style.marginTop = '5px';
                reportItem.appendChild(correctAnswerDiv);
            }
        }
        
        // Статистика по вопросу
        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = `
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid ${isCorrect ? '#d4edda' : '#f8d7da'};
            font-size: 14px;
            color: #666;
        `;
        statsDiv.innerHTML = `Статус: ${isCorrect ? '<span style="color:#27ae60">Правильно</span>' : '<span style="color:#e74c3c">Неправильно</span>'}`;
        reportItem.appendChild(statsDiv);
        
        reportContainer.appendChild(reportItem);
    });
    
    console.log(`✅ Отчет сгенерирован: ${answerHistory.filter(a => a !== null).length} ответов`);
}

// ===============================================
// ПЕРЕЗАПУСК ТЕСТА
// ===============================================
function restartTest() {
    console.log('🔄 Перезапуск теста');
    
    // Сбрасываем состояние
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = [];
    currentClass = null;
    questions = [];
    isTestRunning = false;
    
    // Переключаем экраны
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Обновляем кнопки классов
    updateClassButtons();
}

// ===============================================
// ПОКАЗ ОШИБОК
// ===============================================
function showError(message) {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #ef9a9a;
        `;
        errorDiv.innerHTML = `
            <h4>⚠️ Ошибка</h4>
            <p>${message}</p>
            <p>Проверьте консоль браузера (F12) для подробностей</p>
        `;
        startScreen.appendChild(errorDiv);
    }
}

// ===============================================
// ДЕБАГ-ФУНКЦИИ
// ===============================================
function debugState() {
    console.log('=== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===');
    console.log('Всего вопросов:', allQuestions.length);
    console.log('Текущий класс:', currentClass);
    console.log('Вопросов в тесте:', questions ? questions.length : 0);
    console.log('Текущий вопрос:', currentQuestionIndex);
    console.log('Счет:', score);
    console.log('История ответов:', answerHistory);
    console.log('Тест запущен:', isTestRunning);
    
    // Проверяем элементы DOM
    console.log('Кнопка "Завершить" существует:', !!document.getElementById('finish-button'));
    console.log('Контейнер отчета существует:', !!document.getElementById('report-container'));
    console.log('===========================');
}

// Экспортируем для отладки в консоли
window.debug = debugState;
window.restart = restartTest;
window.showResults = showResults; // Для тестирования отчета
