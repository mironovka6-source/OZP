// ===============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ===============================================
let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = [];
let currentClass = null;

// ===============================================
// ИНИЦИАЛИЗАЦИЯ - ГЛАВНАЯ ФУНКЦИЯ
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Тест инициализирован');
    
    // 1. Сначала создаем все необходимые элементы
    createMissingElements();
    
    // 2. Настраиваем все обработчики событий
    setupEventListeners();
    
    // 3. Загружаем вопросы
    loadQuestions();
    
    // 4. Тестовый запуск
    console.log('✅ Все готово к работе');
});

// ===============================================
// 1. СОЗДАНИЕ ОТСУТСТВУЮЩИХ ЭЛЕМЕНТОВ
// ===============================================
function createMissingElements() {
    console.log('🔧 Проверяю и создаю недостающие элементы...');
    
    // 1.1. КНОПКА "ЗАВЕРШИТЬ ТЕСТ" - ОБЯЗАТЕЛЬНО!
    let finishButton = document.getElementById('finish-button');
    if (!finishButton) {
        console.log('➕ Создаю кнопку "Завершить тест"');
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            finishButton = document.createElement('button');
            finishButton.id = 'finish-button';
            finishButton.textContent = '🏁 Завершить тест';
            finishButton.style.cssText = `
                display: none;
                padding: 12px 24px;
                background-color: #2ecc71;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                margin: 0 10px;
            `;
            buttonsContainer.appendChild(finishButton);
        }
    } else {
        console.log('✅ Кнопка "Завершить" уже существует');
    }
    
    // 1.2. КОНТЕЙНЕР ДЛЯ ОТЧЕТА - ОБЯЗАТЕЛЬНО!
    let reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.log('➕ Создаю контейнер для отчета');
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'report-container';
            reportContainer.style.cssText = `
                margin: 30px 0;
                padding: 25px;
                background-color: #f8f9fa;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                max-height: 500px;
                overflow-y: auto;
            `;
            resultsScreen.insertBefore(reportContainer, resultsScreen.querySelector('button'));
        }
    } else {
        console.log('✅ Контейнер отчета уже существует');
    }
    
    // 1.3. КНОПКА "НАЧАТЬ ЗАНОВО" - если её нет
    let restartButton = document.getElementById('restart-button');
    if (!restartButton) {
        console.log('➕ Создаю кнопку "Начать заново"');
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const existingButton = resultsScreen.querySelector('button');
            if (existingButton) {
                existingButton.id = 'restart-button';
                restartButton = existingButton;
                console.log('✅ Переименовал существующую кнопку в "restart-button"');
            } else {
                restartButton = document.createElement('button');
                restartButton.id = 'restart-button';
                restartButton.textContent = '🔄 Начать заново';
                restartButton.style.cssText = `
                    padding: 15px 40px;
                    background-color: #9b59b6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                `;
                resultsScreen.appendChild(restartButton);
            }
        }
    } else {
        console.log('✅ Кнопка "Начать заново" уже существует');
    }
}

// ===============================================
// 2. НАСТРОЙКА ВСЕХ ОБРАБОТЧИКОВ
// ===============================================
function setupEventListeners() {
    console.log('🔗 Настраиваю обработчики событий...');
    
    // 2.1. КНОПКИ ВЫБОРА КЛАССА
    const classButtons = document.querySelectorAll('#class-selection button');
    classButtons.forEach(button => {
        // Удаляем старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Обновленные кнопки
    const updatedButtons = document.querySelectorAll('#class-selection button');
    updatedButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎯 Выбран ${classNum} класс`);
            startTest(classNum);
        });
    });
    
    // 2.2. КНОПКИ НАВИГАЦИИ В ТЕСТЕ
    // Предыдущий вопрос
    const prevButton = document.getElementById('prev-button');
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayCurrentQuestion();
            }
        });
    }
    
    // Следующий вопрос
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                displayCurrentQuestion();
            }
        });
    }
    
    // Завершить тест - ВАЖНО! Проверяем существование кнопки
    const finishButton = document.getElementById('finish-button');
    if (finishButton) {
        finishButton.addEventListener('click', function() {
            console.log('🏁 Нажата кнопка "Завершить тест"');
            showResults();
        });
        console.log('✅ Обработчик для кнопки "Завершить" установлен');
    } else {
        console.error('❌ Кнопка "Завершить" не найдена после создания!');
    }
    
    // Начать заново
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            console.log('🔄 Начало нового теста');
            restartTest();
        });
    }
    
    console.log('✅ Все обработчики настроены');
}

// ===============================================
// 3. ЗАГРУЗКА ВОПРОСОВ
// ===============================================
async function loadQuestions() {
    try {
        console.log('📥 Загружаю вопросы из questions.json...');
        const response = await fetch('questions.json');
        
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        
        allQuestions = await response.json();
        console.log(`✅ Загружено ${allQuestions.length} вопросов`);
        
        // Обновляем кнопки классов
        updateClassButtons();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки вопросов:', error);
        
        // Показываем тестовые вопросы если файл не найден
        allQuestions = [
            {
                "id": 1,
                "class": 5,
                "question": "Тестовый вопрос для 5 класса?",
                "answers": [
                    {"text": "Правильный ответ", "isCorrect": true},
                    {"text": "Неправильный ответ 1", "isCorrect": false},
                    {"text": "Неправильный ответ 2", "isCorrect": false},
                    {"text": "Неправильный ответ 3", "isCorrect": false}
                ]
            },
            {
                "id": 2,
                "class": 5,
                "question": "Второй тестовый вопрос?",
                "answers": [
                    {"text": "Неправильный ответ 1", "isCorrect": false},
                    {"text": "Правильный ответ", "isCorrect": true},
                    {"text": "Неправильный ответ 2", "isCorrect": false},
                    {"text": "Неправильный ответ 3", "isCorrect": false}
                ]
            }
        ];
        
        console.log('📋 Использую тестовые вопросы');
        updateClassButtons();
    }
}

function updateClassButtons() {
    const classButtons = document.querySelectorAll('#class-selection button');
    const classCounts = {};
    
    // Считаем вопросы по классам
    allQuestions.forEach(q => {
        if (!classCounts[q.class]) classCounts[q.class] = 0;
        classCounts[q.class]++;
    });
    
    // Обновляем кнопки
    classButtons.forEach(button => {
        const classNum = parseInt(button.getAttribute('data-class'));
        const count = classCounts[classNum] || 0;
        
        if (count > 0) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.innerHTML = `${classNum} класс <span style="font-size:0.8em; opacity:0.7">(${count})</span>`;
            button.title = `${count} вопросов`;
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.innerHTML = `${classNum} класс`;
            button.title = 'Нет вопросов';
        }
    });
}

// ===============================================
// 4. ЗАПУСК ТЕСТА
// ===============================================
function startTest(classNum) {
    console.log(`🚀 Запускаю тест для ${classNum} класса`);
    
    // Фильтруем вопросы
    questions = allQuestions.filter(q => q.class === classNum);
    
    if (questions.length === 0) {
        alert(`Для ${classNum} класса нет вопросов!`);
        return;
    }
    
    // Сбрасываем состояние
    currentClass = classNum;
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = new Array(questions.length).fill(null);
    
    // Перемешиваем вопросы
    shuffleArray(questions);
    
    // Переключаем экраны
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-screen').style.display = 'none';
    
    // Обновляем информацию
    document.getElementById('selected-class').textContent = classNum;
    
    // Создаем навигационные кнопки
    createNavigationButtons();
    
    // Показываем первый вопрос
    displayCurrentQuestion();
}

// ===============================================
// 5. ОТОБРАЖЕНИЕ ВОПРОСОВ И ОТВЕТОВ
// ===============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createNavigationButtons() {
    const navPanel = document.getElementById('navigation-panel');
    if (!navPanel) return;
    
    navPanel.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const button = document.createElement('button');
        button.className = 'nav-btn';
        button.textContent = i + 1;
        button.dataset.index = i;
        
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            currentQuestionIndex = index;
            displayCurrentQuestion();
        });
        
        navPanel.appendChild(button);
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

function displayCurrentQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    // Текст вопроса
    document.getElementById('question-text').textContent = 
        `${currentQuestionIndex + 1}. ${question.question}`;
    
    // Очищаем старые ответы
    const answersArea = document.getElementById('answers-area');
    answersArea.innerHTML = '';
    
    // Обновляем кнопки навигации
    document.getElementById('prev-button').disabled = currentQuestionIndex === 0;
    document.getElementById('next-button').disabled = true;
    
    // Проверяем последний ли вопрос - ВАЖНО ДЛЯ КНОПКИ "ЗАВЕРШИТЬ"
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const nextButton = document.getElementById('next-button');
    const finishButton = document.getElementById('finish-button');
    
    if (nextButton && finishButton) {
        nextButton.style.display = isLastQuestion ? 'none' : 'inline-block';
        finishButton.style.display = isLastQuestion ? 'inline-block' : 'none';
        console.log(`📊 Вопрос ${currentQuestionIndex + 1}/${questions.length}, кнопка "Завершить": ${finishButton.style.display}`);
    }
    
    // Создаем варианты ответов
    const letters = ['А', 'Б', 'В', 'Г'];
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.dataset.index = index;
        answerElement.dataset.correct = answer.isCorrect;
        
        answerElement.innerHTML = `
            <span class="answer-letter">${letters[index]}</span>
            <span class="answer-text">${answer.text}</span>
        `;
        
        // Если уже отвечали на этот вопрос
        const userAnswer = answerHistory[currentQuestionIndex];
        if (userAnswer && userAnswer.index === index) {
            answerElement.classList.add('selected');
            if (userAnswer.isCorrect) {
                answerElement.classList.add('correct');
            } else {
                answerElement.classList.add('wrong');
            }
        }
        
        // Обработчик выбора
        answerElement.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(answerElement);
    });
    
    updateProgress();
    updateNavigationButtons();
}

function handleAnswerSelect(event) {
    const answerElement = event.currentTarget;
    const answerIndex = parseInt(answerElement.dataset.index);
    const isCorrect = answerElement.dataset.correct === 'true';
    
    // Блокируем все варианты
    document.querySelectorAll('.answer-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.classList.remove('selected');
    });
    
    // Выделяем выбранный
    answerElement.classList.add('selected');
    
    // Показываем правильность
    if (isCorrect) {
        answerElement.classList.add('correct');
        score++;
    } else {
        answerElement.classList.add('wrong');
        
        // Показываем правильный ответ
        const correctAnswer = document.querySelector('.answer-option[data-correct="true"]');
        if (correctAnswer) {
            correctAnswer.classList.add('correct');
        }
    }
    
    // Сохраняем ответ
    answerHistory[currentQuestionIndex] = {
        index: answerIndex,
        isCorrect: isCorrect,
        text: answerElement.querySelector('.answer-text').textContent
    };
    
    // Активируем кнопку "Следующий"
    document.getElementById('next-button').disabled = false;
    
    updateProgress();
}

function updateProgress() {
    const answered = answerHistory.filter(a => a !== null).length;
    document.getElementById('progress-counter').textContent = 
        `Отвечено: ${answered} из ${questions.length}`;
}

// ===============================================
// 6. РЕЗУЛЬТАТЫ И ОТЧЕТ - ВАЖНАЯ ЧАСТЬ!
// ===============================================
function showResults() {
    console.log('📊 Показываю результаты теста...');
    
    // Переключаем экраны
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // Обновляем счет
    const correctAnswers = answerHistory.filter(a => a && a.isCorrect).length;
    document.getElementById('score').textContent = `${correctAnswers} из ${questions.length}`;
    
    // Генерируем отчет - ВАЖНО!
    generateReport();
}

function generateReport() {
    console.log('📋 Генерирую подробный отчет...');
    
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.error('❌ Контейнер отчета не найден!');
        return;
    }
    
    // Очищаем контейнер
    reportContainer.innerHTML = '';
    
    // Добавляем заголовок
    const title = document.createElement('h3');
    title.textContent = 'Детальный отчет по вопросам:';
    title.style.cssText = `
        color: #2c3e50;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ecf0f1;
        text-align: center;
    `;
    reportContainer.appendChild(title);
    
    // Проверяем, есть ли ответы
    const answeredQuestions = answerHistory.filter(a => a !== null);
    if (answeredQuestions.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Вы не ответили ни на один вопрос.';
        message.style.cssText = `
            text-align: center;
            color: #7f8c8d;
            padding: 30px;
            font-style: italic;
        `;
        reportContainer.appendChild(message);
        return;
    }
    
    // Создаем отчет для каждого вопроса
    questions.forEach((question, index) => {
        const userAnswer = answerHistory[index];
        if (userAnswer === null) return; // Пропускаем неотвеченные
        
        const isCorrect = userAnswer.isCorrect;
        
        // Создаем элемент отчета
        const reportItem = document.createElement('div');
        reportItem.className = `report-item ${isCorrect ? 'correct' : 'incorrect'}`;
        reportItem.style.cssText = `
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: ${isCorrect ? '#f0fff4' : '#fff5f5'};
            border-left: 6px solid ${isCorrect ? '#2ecc71' : '#e74c3c'};
            transition: transform 0.3s;
        `;
        
        reportItem.onmouseover = function() { this.style.transform = 'translateX(5px)'; };
        reportItem.onmouseout = function() { this.style.transform = 'translateX(0)'; };
        
        // Вопрос
        const questionDiv = document.createElement('div');
        questionDiv.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 15px;
        `;
        questionDiv.innerHTML = `<span style="color: #3498db;">Вопрос ${index + 1}:</span> ${question.question}`;
        
        // Ответ пользователя
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.style.cssText = `
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 2px solid ${isCorrect ? '#d4edda' : '#f8d7da'};
        `;
        userAnswerDiv.innerHTML = `
            <strong style="color: ${isCorrect ? '#27ae60' : '#e74c3c'};">Ваш ответ:</strong> 
            ${userAnswer.text} 
            ${isCorrect ? '✅' : '❌'}
        `;
        
        // Если ответ неправильный - показываем правильный
        let correctAnswerDiv = '';
        if (!isCorrect) {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (correctAnswer) {
                correctAnswerDiv = `
                    <div style="
                        margin-top: 10px;
                        padding: 10px;
                        background: #e8f5e9;
                        border-radius: 6px;
                        border: 2px solid #c8e6c9;
                    ">
                        <strong style="color: #27ae60;">Правильный ответ:</strong> 
                        ${correctAnswer.text} ✅
                    </div>
                `;
            }
        }
        
        // Статус
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            margin-top: 15px;
            padding: 8px 15px;
            background: ${isCorrect ? '#d4edda' : '#f8d7da'};
            color: ${isCorrect ? '#155724' : '#721c24'};
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            font-size: 14px;
        `;
        statusDiv.textContent = isCorrect ? '✓ Правильно' : '✗ Неправильно';
        
        // Собираем все вместе
        reportItem.appendChild(questionDiv);
        reportItem.appendChild(userAnswerDiv);
        if (correctAnswerDiv) {
            reportItem.innerHTML += correctAnswerDiv;
        }
        reportItem.appendChild(statusDiv);
        
        reportContainer.appendChild(reportItem);
    });
    
    console.log(`✅ Отчет сгенерирован: ${answeredQuestions.length} вопросов`);
}

// ===============================================
// 7. ПЕРЕЗАПУСК ТЕСТА
// ===============================================
function restartTest() {
    console.log('🔄 Перезапускаю тест...');
    
    // Сбрасываем все переменные
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = [];
    currentClass = null;
    questions = [];
    
    // Переключаем экраны
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Обновляем кнопки классов
    updateClassButtons();
}

// ===============================================
// 8. ФУНКЦИИ ДЛЯ ОТЛАДКИ
// ===============================================
function checkElements() {
    console.log('🔍 Проверяю элементы DOM:');
    console.log('- Кнопка "Завершить":', document.getElementById('finish-button'));
    console.log('- Контейнер отчета:', document.getElementById('report-container'));
    console.log('- Кнопка "Начать заново":', document.getElementById('restart-button'));
    console.log('- Экран теста:', document.getElementById('quiz-container'));
    console.log('- Экран результатов:', document.getElementById('results-screen'));
}

function forceShowResults() {
    // Принудительно показываем результаты (для теста)
    console.log('🔄 Принудительный показ результатов');
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    document.getElementById('score').textContent = '3 из 5';
    
    // Создаем тестовый отчет
    const reportContainer = document.getElementById('report-container');
    if (reportContainer) {
        reportContainer.innerHTML = `
            <h3 style="color: #2c3e50; margin-bottom: 20px;">Тестовый отчет</h3>
            <div style="background: #f0fff4; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #2ecc71;">
                <div style="font-weight: bold; margin-bottom: 5px;">Вопрос 1: Тестовый вопрос?</div>
                <div style="color: #27ae60;">✅ Ваш ответ: Правильный</div>
            </div>
            <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 5px solid #e74c3c;">
                <div style="font-weight: bold; margin-bottom: 5px;">Вопрос 2: Другой вопрос?</div>
                <div style="color: #e74c3c;">❌ Ваш ответ: Неправильный</div>
                <div style="color: #27ae60; margin-top: 5px;">✅ Правильный ответ: Правильный вариант</div>
            </div>
        `;
    }
}

// Экспортируем функции для отладки в консоли
window.debug = checkElements;
window.testResults = forceShowResults;
window.restart = restartTest;
