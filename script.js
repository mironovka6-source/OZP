// УПРОЩЕННЫЙ РАБОЧИЙ СКРИПТ ДЛЯ ВАШЕГО CSS
console.log('🔥 Тест загружен!');

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM готов');
    
    // 1. Гарантированно создаем кнопку "Завершить"
    createFinishButton();
    
    // 2. Настраиваем все кнопки
    setupButtons();
    
    // 3. Загружаем вопросы
    loadQuestions();
});

// ===============================================
// 1. СОЗДАНИЕ КНОПКИ "ЗАВЕРШИТЬ"
// ===============================================
function createFinishButton() {
    console.log('🔧 Создаю кнопку "Завершить"...');
    
    // Проверяем, есть ли уже кнопка
    let finishBtn = document.getElementById('finish-button');
    
    if (!finishBtn) {
        console.log('➕ Создаю новую кнопку');
        
        // Ищем контейнер для кнопок
        const buttonsContainer = document.querySelector('.buttons-container');
        
        if (buttonsContainer) {
            // Создаем кнопку
            finishBtn = document.createElement('button');
            finishBtn.id = 'finish-button';
            finishBtn.textContent = '🏁 Завершить тест';
            
            // НЕ используем inline стили, полагаемся на CSS
            // Только минимальные гарантии
            finishBtn.style.cssText = `
                /* Обеспечиваем видимость в любом случае */
                display: none;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            
            // Добавляем обработчик
            finishBtn.onclick = function() {
                console.log('🏁 Кнопка "Завершить" нажата');
                finishTest();
            };
            
            // Добавляем в контейнер
            buttonsContainer.appendChild(finishBtn);
            console.log('✅ Кнопка создана');
        }
    }
    
    // Также добавляем класс для управления видимостью
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        quizContainer.classList.remove('show-finish');
    }
}

// ===============================================
// 2. НАСТРОЙКА КНОПОК
// ===============================================
function setupButtons() {
    console.log('🔗 Настраиваю кнопки...');
    
    // Кнопки выбора класса
    document.querySelectorAll('#class-selection button').forEach(btn => {
        btn.onclick = function() {
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎓 Выбран ${classNum} класс`);
            startTest(classNum);
        };
    });
    
    // Кнопки навигации
    document.getElementById('prev-button').onclick = function() {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }
    };
    
    document.getElementById('next-button').onclick = function() {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion();
        }
    };
    
    // Кнопка "Начать заново"
    const restartBtn = document.getElementById('restart-button');
    if (restartBtn) {
        restartBtn.onclick = restartTest;
    } else {
        // Создаем если нет
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const newBtn = document.createElement('button');
            newBtn.id = 'restart-button';
            newBtn.textContent = '🔄 Начать заново';
            resultsScreen.appendChild(newBtn);
            newBtn.onclick = restartTest;
        }
    }
}

// ===============================================
// 3. ЗАГРУЗКА ВОПРОСОВ
// ===============================================
function loadQuestions() {
    console.log('📥 Загружаю вопросы...');
    
    // Пробуем загрузить из JSON
    fetch('questions.json')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Файл не найден');
        })
        .then(data => {
            questions = data;
            console.log(`✅ Загружено ${questions.length} вопросов`);
            updateClassButtons();
        })
        .catch(error => {
            console.log('📋 Использую тестовые вопросы');
            loadTestQuestions();
        });
}

function loadTestQuestions() {
    // Тестовые вопросы
    questions = [
        {
            "id": 1,
            "class": 5,
            "question": "Какой материал используется в оригами?",
            "answers": [
                {"text": "Картон", "isCorrect": false},
                {"text": "Бумага", "isCorrect": true},
                {"text": "Глина", "isCorrect": false},
                {"text": "Ткань", "isCorrect": false}
            ]
        },
        {
            "id": 2,
            "class": 5,
            "question": "Что такое светотень?",
            "answers": [
                {"text": "Техника рисования", "isCorrect": false},
                {"text": "Передача объема светом и тенью", "isCorrect": true},
                {"text": "Вид краски", "isCorrect": false},
                {"text": "Стиль живописи", "isCorrect": false}
            ]
        },
        {
            "id": 3,
            "class": 5,
            "question": "Что такое батик?",
            "answers": [
                {"text": "Роспись по ткани", "isCorrect": true},
                {"text": "Резьба по дереву", "isCorrect": false},
                {"text": "Лепка из глины", "isCorrect": false},
                {"text": "Вышивка", "isCorrect": false}
            ]
        }
    ];
    
    updateClassButtons();
}

function updateClassButtons() {
    document.querySelectorAll('#class-selection button').forEach(btn => {
        const classNum = parseInt(btn.getAttribute('data-class'));
        const count = questions.filter(q => q.class === classNum).length;
        
        if (count > 0) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = `${classNum} класс <span style="font-size:0.8em;opacity:0.7">(${count})</span>`;
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    });
}

// ===============================================
// 4. ЗАПУСК ТЕСТА
// ===============================================
function startTest(classNum) {
    console.log(`🚀 Запуск теста для ${classNum} класса`);
    
    // Фильтруем вопросы
    const classQuestions = questions.filter(q => q.class === classNum);
    
    if (classQuestions.length === 0) {
        alert('Для этого класса нет вопросов');
        return;
    }
    
    questions = classQuestions;
    currentQuestion = 0;
    userAnswers = new Array(questions.length).fill(null);
    score = 0;
    
    // Показываем тест
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-screen').style.display = 'none';
    
    // Обновляем заголовок
    document.getElementById('selected-class').textContent = classNum;
    
    // Создаем навигацию
    createNavigation();
    
    // Показываем первый вопрос
    showQuestion();
}

function createNavigation() {
    const navPanel = document.getElementById('navigation-panel');
    if (!navPanel) return;
    
    navPanel.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.textContent = i + 1;
        btn.onclick = function() {
            currentQuestion = i;
            showQuestion();
        };
        navPanel.appendChild(btn);
    }
    
    updateNavigation();
}

function updateNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        
        if (index === currentQuestion) {
            btn.classList.add('current');
        }
        
        if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
    });
}

// ===============================================
// 5. ПОКАЗ ВОПРОСОВ
// ===============================================
function showQuestion() {
    console.log(`📝 Вопрос ${currentQuestion + 1} из ${questions.length}`);
    
    if (currentQuestion >= questions.length) {
        finishTest();
        return;
    }
    
    const question = questions[currentQuestion];
    
    // Текст вопроса
    document.getElementById('question-text').textContent = 
        `${currentQuestion + 1}. ${question.question}`;
    
    // Очищаем ответы
    const answersArea = document.getElementById('answers-area');
    answersArea.innerHTML = '';
    
    // Обновляем кнопки
    document.getElementById('prev-button').disabled = currentQuestion === 0;
    document.getElementById('next-button').disabled = true;
    
    // ВАЖНО: Управляем кнопкой "Завершить" через класс
    const isLastQuestion = currentQuestion === questions.length - 1;
    const quizContainer = document.getElementById('quiz-container');
    
    if (isLastQuestion) {
        quizContainer.classList.add('show-finish');
        console.log('🏁 Показываю кнопку "Завершить" (последний вопрос)');
    } else {
        quizContainer.classList.remove('show-finish');
    }
    
    // Создаем варианты ответов
    const letters = ['А', 'Б', 'В', 'Г'];
    question.answers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-option';
        answerDiv.dataset.index = index;
        answerDiv.dataset.correct = answer.isCorrect;
        
        answerDiv.innerHTML = `
            <span class="answer-letter">${letters[index]}</span>
            <span class="answer-text">${answer.text}</span>
        `;
        
        // Если уже отвечали
        const userAnswer = userAnswers[currentQuestion];
        if (userAnswer !== null && userAnswer.index === index) {
            answerDiv.classList.add('selected');
            if (userAnswer.isCorrect) {
                answerDiv.classList.add('correct');
            } else {
                answerDiv.classList.add('wrong');
            }
        }
        
        // Обработчик
        answerDiv.onclick = function() {
            selectAnswer(index, answer.isCorrect, this);
        };
        
        answersArea.appendChild(answerDiv);
    });
    
    updateProgress();
    updateNavigation();
}

function selectAnswer(index, isCorrect, element) {
    // Блокируем все варианты
    document.querySelectorAll('.answer-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.classList.remove('selected');
    });
    
    // Выделяем выбранный
    element.classList.add('selected');
    
    // Показываем правильность
    if (isCorrect) {
        element.classList.add('correct');
        score++;
    } else {
        element.classList.add('wrong');
        
        // Показываем правильный ответ
        const correctAnswer = document.querySelector('.answer-option[data-correct="true"]');
        if (correctAnswer) {
            correctAnswer.classList.add('correct');
        }
    }
    
    // Сохраняем ответ
    userAnswers[currentQuestion] = {
        index: index,
        isCorrect: isCorrect,
        text: element.querySelector('.answer-text').textContent
    };
    
    // Активируем кнопку "Следующий"
    document.getElementById('next-button').disabled = false;
    
    updateProgress();
}

function updateProgress() {
    const answered = userAnswers.filter(a => a !== null).length;
    document.getElementById('progress-counter').textContent = 
        `Отвечено: ${answered} из ${questions.length}`;
}

// ===============================================
// 6. ЗАВЕРШЕНИЕ ТЕСТА И РЕЗУЛЬТАТЫ
// ===============================================
function finishTest() {
    console.log('🎉 Завершаю тест!');
    
    // Считаем правильные ответы
    const correct = userAnswers.filter(a => a && a.isCorrect).length;
    const total = questions.length;
    
    // Показываем результаты
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // Обновляем счет
    document.getElementById('score').textContent = `${correct} из ${total}`;
    
    // Создаем отчет
    createReport();
}

function createReport() {
    console.log('📊 Создаю отчет...');
    
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.error('❌ Контейнер отчета не найден');
        return;
    }
    
    // Очищаем
    reportContainer.innerHTML = '';
    
    // Заголовок
    const title = document.createElement('h3');
    title.textContent = 'Детальный отчет:';
    title.style.cssText = `
        color: #2c3e50;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ecf0f1;
        text-align: center;
    `;
    reportContainer.appendChild(title);
    
    // Если нет ответов
    if (userAnswers.every(a => a === null)) {
        const message = document.createElement('p');
        message.textContent = 'Вы не ответили ни на один вопрос.';
        message.style.cssText = 'text-align: center; color: #7f8c8d; padding: 40px;';
        reportContainer.appendChild(message);
        return;
    }
    
    // Создаем отчет для каждого вопроса
    questions.forEach((question, index) => {
        const answer = userAnswers[index];
        if (answer === null) return;
        
        const isCorrect = answer.isCorrect;
        
        // Блок отчета
        const reportItem = document.createElement('div');
        reportItem.className = `report-item ${isCorrect ? 'correct' : 'incorrect'}`;
        reportItem.style.cssText = `
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: ${isCorrect ? '#f0fff4' : '#fff5f5'};
            border-left: 6px solid ${isCorrect ? '#2ecc71' : '#e74c3c'};
        `;
        
        // Вопрос
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `<strong>Вопрос ${index + 1}:</strong> ${question.question}`;
        questionDiv.style.cssText = 'font-weight: bold; margin-bottom: 15px; color: #2c3e50;';
        
        // Ответ пользователя
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.innerHTML = `
            <span style="color: ${isCorrect ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                Ваш ответ:
            </span> 
            ${answer.text} 
            ${isCorrect ? '✅' : '❌'}
        `;
        userAnswerDiv.style.cssText = `
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 2px solid ${isCorrect ? '#d4edda' : '#f8d7da'};
        `;
        
        reportItem.appendChild(questionDiv);
        reportItem.appendChild(userAnswerDiv);
        
        // Если неправильно - показываем правильный
        if (!isCorrect) {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (correctAnswer) {
                const correctDiv = document.createElement('div');
                correctDiv.innerHTML = `
                    <span style="color: #27ae60; font-weight: bold;">
                        Правильный ответ:
                    </span> 
                    ${correctAnswer.text} ✅
                `;
                correctDiv.style.cssText = `
                    margin-top: 10px;
                    padding: 10px;
                    background: #e8f5e9;
                    border-radius: 6px;
                    border: 2px solid #c8e6c9;
                `;
                reportItem.appendChild(correctDiv);
            }
        }
        
        // Статус
        const statusDiv = document.createElement('div');
        statusDiv.textContent = isCorrect ? '✓ Правильно' : '✗ Неправильно';
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
        
        reportItem.appendChild(statusDiv);
        reportContainer.appendChild(reportItem);
    });
    
    console.log('✅ Отчет создан');
}

// ===============================================
// 7. ПЕРЕЗАПУСК
// ===============================================
function restartTest() {
    console.log('🔄 Перезапускаю...');
    
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    updateClassButtons();
}

// ===============================================
// 8. ФУНКЦИИ ДЛЯ ОТЛАДКИ
// ===============================================
window.showFinishButton = function() {
    // Принудительно показываем кнопку "Завершить"
    const finishBtn = document.getElementById('finish-button');
    if (finishBtn) {
        finishBtn.style.display = 'block !important';
        finishBtn.style.visibility = 'visible !important';
        console.log('🚀 Кнопка "Завершить" принудительно показана');
    }
};

window.checkElements = function() {
    console.log('🔍 Проверка элементов:');
    console.log('1. Кнопка "Завершить":', document.getElementById('finish-button'));
    console.log('2. CSS класс .show-finish:', document.querySelector('.show-finish'));
    console.log('3. Контейнер отчета:', document.getElementById('report-container'));
};

window.testResults = function() {
    // Тестовый показ результатов
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    document.getElementById('score').textContent = '3 из 5';
    
    // Тестовый отчет
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
};
