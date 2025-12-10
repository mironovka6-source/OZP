// УПРОЩЕННЫЙ И РАБОЧИЙ СКРИПТ
console.log('🔥 Тест загружен!');

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let currentClass = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM готов');
    
    // Создаем кнопку "Завершить" если её нет
    createFinishButton();
    
    // Создаем контейнер отчета если его нет
    createReportContainer();
    
    // Настраиваем кнопки
    setupButtons();
    
    // Загружаем вопросы
    loadQuestions();
});

// ===============================================
// СОЗДАНИЕ ОБЯЗАТЕЛЬНЫХ ЭЛЕМЕНТОВ
// ===============================================
function createFinishButton() {
    if (!document.getElementById('finish-button')) {
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            const finishBtn = document.createElement('button');
            finishBtn.id = 'finish-button';
            finishBtn.textContent = '🏁 Завершить тест';
            finishBtn.style.cssText = 'display: none;';
            buttonsContainer.appendChild(finishBtn);
        }
    }
}

function createReportContainer() {
    if (!document.getElementById('report-container')) {
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const reportDiv = document.createElement('div');
            reportDiv.id = 'report-container';
            reportDiv.style.cssText = `
                margin: 30px 0;
                padding: 25px;
                background: #f8f9fa;
                border-radius: 12px;
                border: 2px solid #e9ecef;
            `;
            
            // Вставляем перед кнопкой "Начать заново"
            const restartBtn = resultsScreen.querySelector('button');
            if (restartBtn) {
                resultsScreen.insertBefore(reportDiv, restartBtn);
            } else {
                resultsScreen.appendChild(reportDiv);
            }
        }
    }
}

// ===============================================
// НАСТРОЙКА КНОПОК
// ===============================================
function setupButtons() {
    // Кнопки классов
    document.querySelectorAll('#class-selection button').forEach(btn => {
        btn.onclick = function() {
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎓 Выбран ${classNum} класс`);
            startTest(classNum);
        };
    });
    
    // Кнопка "Предыдущий"
    document.getElementById('prev-button').onclick = function() {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }
    };
    
    // Кнопка "Следующий"
    document.getElementById('next-button').onclick = function() {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion();
        }
    };
    
    // Кнопка "Завершить"
    const finishBtn = document.getElementById('finish-button');
    if (finishBtn) {
        finishBtn.onclick = function() {
            console.log('🎯 КНОПКА "ЗАВЕРШИТЬ" НАЖАТА!');
            finishTest();
        };
    }
    
    // Кнопка "Начать заново"
    const restartBtn = document.getElementById('restart-button');
    if (restartBtn) {
        restartBtn.onclick = restartTest;
    }
}

// ===============================================
// ЗАГРУЗКА ВОПРОСОВ
// ===============================================
function loadQuestions() {
    fetch('questions.json')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
            questions = data;
            console.log(`✅ Загружено ${questions.length} вопросов`);
            updateClassButtons();
        })
        .catch(error => {
            console.log('📋 Использую тестовые вопросы');
            questions = getTestQuestions();
            updateClassButtons();
        });
}

function getTestQuestions() {
    return [
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
// ЗАПУСК ТЕСТА
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
    currentClass = classNum;
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
// ПОКАЗ ВОПРОСОВ
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
    
    // Управляем кнопкой "Завершить"
    const isLastQuestion = currentQuestion === questions.length - 1;
    document.getElementById('next-button').style.display = isLastQuestion ? 'none' : 'inline-block';
    document.getElementById('finish-button').style.display = isLastQuestion ? 'inline-block' : 'none';
    
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
// ЗАВЕРШЕНИЕ ТЕСТА И РЕЗУЛЬТАТЫ - ВАЖНАЯ ЧАСТЬ!
// ===============================================
function finishTest() {
    console.log('🎉 ЗАВЕРШЕНИЕ ТЕСТА - НАЧАЛО');
    
    // 1. Считаем правильные ответы
    const correctAnswers = userAnswers.filter(answer => answer && answer.isCorrect).length;
    const totalQuestions = questions.length;
    score = correctAnswers;
    
    console.log(`📊 Результат: ${score}/${totalQuestions}`);
    
    // 2. ПРОВЕРЯЕМ - Все ли вопросы отвечены?
    const unanswered = userAnswers.filter(answer => answer === null).length;
    console.log(`❓ Неотвеченных вопросов: ${unanswered}`);
    
    if (unanswered > 0) {
        const confirmFinish = confirm(`Вы ответили не на все вопросы. Осталось: ${unanswered}. Завершить тест?`);
        if (!confirmFinish) {
            return; // Отменяем завершение
        }
    }
    
    // 3. Переключаем экраны ГАРАНТИРОВАННО
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    console.log('✅ Экран результатов показан');
    
    // 4. Обновляем счет ГАРАНТИРОВАННО
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `${score} из ${totalQuestions}`;
        console.log('✅ Счет обновлен');
    } else {
        console.error('❌ Элемент #score не найден!');
        // Создаем элемент если его нет
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const newScore = document.createElement('p');
            newScore.id = 'score';
            newScore.textContent = `${score} из ${totalQuestions}`;
            newScore.style.cssText = 'font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0;';
            resultsScreen.insertBefore(newScore, resultsScreen.firstChild.nextSibling);
        }
    }
    
    // 5. Создаем отчет ГАРАНТИРОВАННО
    createReport();
    
    console.log('🎉 ТЕСТ УСПЕШНО ЗАВЕРШЕН');
}

function createReport() {
    console.log('📊 СОЗДАНИЕ ОТЧЕТА - НАЧАЛО');
    
    // Ищем контейнер отчета
    let reportContainer = document.getElementById('report-container');
    
    // Если контейнера нет - создаем
    if (!reportContainer) {
        console.log('➕ Создаю контейнер для отчета');
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'report-container';
            reportContainer.style.cssText = `
                margin: 30px 0;
                padding: 25px;
                background: #f8f9fa;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                max-height: 500px;
                overflow-y: auto;
            `;
            
            // Вставляем перед кнопкой "Начать заново"
            const restartBtn = resultsScreen.querySelector('button');
            if (restartBtn) {
                resultsScreen.insertBefore(reportContainer, restartBtn);
            } else {
                resultsScreen.appendChild(reportContainer);
            }
        }
    }
    
    if (!reportContainer) {
        console.error('❌ Не удалось создать контейнер отчета!');
        return;
    }
    
    // Очищаем контейнер
    reportContainer.innerHTML = '';
    
    // Добавляем заголовок отчета
    const reportTitle = document.createElement('h3');
    reportTitle.textContent = '📋 Подробный отчет по тесту:';
    reportTitle.style.cssText = `
        color: #2c3e50;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 3px solid #3498db;
        text-align: center;
        font-size: 22px;
    `;
    reportContainer.appendChild(reportTitle);
    
    // Проверяем, есть ли ответы
    const answeredQuestions = userAnswers.filter(answer => answer !== null);
    
    if (answeredQuestions.length === 0) {
        const noAnswersMsg = document.createElement('p');
        noAnswersMsg.textContent = 'Вы не ответили ни на один вопрос.';
        noAnswersMsg.style.cssText = `
            text-align: center;
            color: #7f8c8d;
            padding: 40px;
            font-style: italic;
            font-size: 18px;
        `;
        reportContainer.appendChild(noAnswersMsg);
        console.log('📭 Нет ответов для отчета');
        return;
    }
    
    console.log(`📝 Создаю отчет для ${answeredQuestions.length} вопросов`);
    
    // Создаем отчет для каждого вопроса
    questions.forEach((question, index) => {
        const answer = userAnswers[index];
        if (answer === null) return; // Пропускаем неотвеченные
        
        const isCorrect = answer.isCorrect;
        
        // Создаем блок отчета
        const reportBlock = document.createElement('div');
        reportBlock.className = `report-item ${isCorrect ? 'correct' : 'incorrect'}`;
        reportBlock.style.cssText = `
            background: ${isCorrect ? '#e8f5e9' : '#ffebee'};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 6px solid ${isCorrect ? '#4CAF50' : '#f44336'};
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        `;
        
        // Номер вопроса
        const questionNum = document.createElement('div');
        questionNum.innerHTML = `<strong style="color: #3498db;">Вопрос ${index + 1}:</strong>`;
        questionNum.style.cssText = `
            font-size: 14px;
            margin-bottom: 5px;
            color: #7f8c8d;
        `;
        
        // Текст вопроса
        const questionText = document.createElement('div');
        questionText.textContent = question.question;
        questionText.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
            color: #2c3e50;
            line-height: 1.5;
        `;
        
        // Ответ пользователя
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.style.cssText = `
            background: white;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 2px solid ${isCorrect ? '#c8e6c9' : '#ffcdd2'};
        `;
        userAnswerDiv.innerHTML = `
            <span style="color: ${isCorrect ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                Ваш ответ:
            </span> 
            ${answer.text} 
            <span style="margin-left: 10px; font-size: 18px;">${isCorrect ? '✅' : '❌'}</span>
        `;
        
        // Собираем блок
        reportBlock.appendChild(questionNum);
        reportBlock.appendChild(questionText);
        reportBlock.appendChild(userAnswerDiv);
        
        // Если ответ неправильный - добавляем правильный ответ
        if (!isCorrect) {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (correctAnswer) {
                const correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.style.cssText = `
                    background: #f1f8e9;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    border: 2px solid #dcedc8;
                `;
                correctAnswerDiv.innerHTML = `
                    <span style="color: #689f38; font-weight: bold;">
                        Правильный ответ:
                    </span> 
                    ${correctAnswer.text} 
                    <span style="margin-left: 10px; font-size: 18px;">✅</span>
                `;
                reportBlock.appendChild(correctAnswerDiv);
            }
        }
        
        // Статус ответа
        const statusDiv = document.createElement('div');
        statusDiv.textContent = isCorrect ? '✓ ПРАВИЛЬНО' : '✗ НЕПРАВИЛЬНО';
        statusDiv.style.cssText = `
            margin-top: 15px;
            padding: 8px 16px;
            background: ${isCorrect ? '#d4edda' : '#f8d7da'};
            color: ${isCorrect ? '#155724' : '#721c24'};
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            font-size: 14px;
        `;
        
        reportBlock.appendChild(statusDiv);
        reportContainer.appendChild(reportBlock);
    });
    
    // Добавляем итоговую статистику
    const correctCount = userAnswers.filter(a => a && a.isCorrect).length;
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    const summaryDiv = document.createElement('div');
    summaryDiv.style.cssText = `
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 25px;
        border-radius: 12px;
        margin-top: 25px;
        text-align: center;
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
    `;
    
    summaryDiv.innerHTML = `
        <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">
            ${correctCount} из ${totalCount}
        </div>
        <div style="font-size: 20px; margin-bottom: 8px;">
            Правильных ответов: ${percentage}%
        </div>
        <div style="font-size: 16px; opacity: 0.9; margin-top: 15px;">
            ${percentage >= 80 ? '🎉 Отличный результат! Вы молодец!' : 
              percentage >= 60 ? '👍 Хороший результат! Так держать!' : 
              '💪 Есть куда стремиться! Попробуйте еще раз!'}
        </div>
    `;
    
    reportContainer.appendChild(summaryDiv);
    
    console.log('✅ ОТЧЕТ УСПЕШНО СОЗДАН');
}

// ===============================================
// ПЕРЕЗАПУСК ТЕСТА
// ===============================================
function restartTest() {
    console.log('🔄 Перезапуск теста');
    
    // Сбрасываем всё
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    currentClass = null;
    
    // Показываем стартовый экран
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Сбрасываем кнопку "Завершить"
    document.getElementById('finish-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'inline-block';
    
    // Обновляем кнопки классов
    updateClassButtons();
}

// ===============================================
// ФУНКЦИИ ДЛЯ ОТЛАДКИ
// ===============================================
window.debugTest = function() {
    console.log('=== СОСТОЯНИЕ ТЕСТА ===');
    console.log('Текущий класс:', currentClass);
    console.log('Количество вопросов:', questions.length);
    console.log('Текущий вопрос:', currentQuestion);
    console.log('Ответы пользователя:', userAnswers);
    console.log('Счет:', score);
    console.log('Кнопка "Завершить":', document.getElementById('finish-button'));
    console.log('Контейнер отчета:', document.getElementById('report-container'));
    console.log('========================');
};

window.forceShowResults = function() {
    console.log('🎯 ПРИНУДИТЕЛЬНЫЙ ПОКАЗ РЕЗУЛЬТАТОВ');
    
    // Тестовые данные
    questions = [
        {
            "id": 1,
            "class": 5,
            "question": "Тестовый вопрос 1?",
            "answers": [
                {"text": "Правильный ответ", "isCorrect": true},
                {"text": "Неправильный 1", "isCorrect": false},
                {"text": "Неправильный 2", "isCorrect": false},
                {"text": "Неправильный 3", "isCorrect": false}
            ]
        },
        {
            "id": 2,
            "class": 5,
            "question": "Тестовый вопрос 2?",
            "answers": [
                {"text": "Неправильный 1", "isCorrect": false},
                {"text": "Правильный ответ", "isCorrect": true},
                {"text": "Неправильный 2", "isCorrect": false},
                {"text": "Неправильный 3", "isCorrect": false}
            ]
        }
    ];
    
    userAnswers = [
        {index: 0, isCorrect: true, text: "Правильный ответ"},
        {index: 0, isCorrect: false, text: "Неправильный 1"}
    ];
    
    // Вызываем завершение теста
    finishTest();
};

window.checkReport = function() {
    console.log('🔍 Проверка отчета:');
    console.log('1. Контейнер существует?', !!document.getElementById('report-container'));
    console.log('2. Контейнер видим?', document.getElementById('report-container')?.offsetParent !== null);
    console.log('3. Содержимое контейнера:', document.getElementById('report-container')?.innerHTML);
};
