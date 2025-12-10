// ===============================================
// УЛЬТРА-ПРОСТОЙ РАБОЧИЙ ТЕСТ
// ===============================================

// Глобальные переменные
let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;

// Главная функция - запускается при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Тест загружен');
    
    // 1. СРАЗУ создаем все необходимые элементы
    createEssentialElements();
    
    // 2. Настраиваем все кнопки
    setupAllButtons();
    
    // 3. Загружаем тестовые вопросы
    loadTestQuestions();
});

// ===============================================
// 1. СОЗДАНИЕ ОБЯЗАТЕЛЬНЫХ ЭЛЕМЕНТОВ
// ===============================================
function createEssentialElements() {
    console.log('🛠️ Создаю обязательные элементы...');
    
    // ===== КНОПКА "ЗАВЕРШИТЬ" =====
    if (!document.getElementById('finish-button')) {
        console.log('➕ Создаю кнопку "Завершить"');
        
        // Ищем контейнер для кнопок
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            // Создаем кнопку
            const finishBtn = document.createElement('button');
            finishBtn.id = 'finish-button';
            finishBtn.textContent = '🏁 Завершить тест';
            
            // Стили для кнопки (inline стили для гарантии)
            finishBtn.style.cssText = `
                display: none;
                padding: 12px 24px;
                background: linear-gradient(135deg, #2ecc71, #27ae60);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2);
                margin-left: 10px;
                min-width: 160px;
            `;
            
            // Эффекты при наведении
            finishBtn.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 12px rgba(46, 204, 113, 0.3)';
            };
            finishBtn.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 6px rgba(46, 204, 113, 0.2)';
            };
            
            // Добавляем в контейнер
            buttonsContainer.appendChild(finishBtn);
            console.log('✅ Кнопка "Завершить" создана');
        } else {
            console.error('❌ Не найден .buttons-container');
        }
    } else {
        console.log('✅ Кнопка "Завершить" уже существует');
    }
    
    // ===== КОНТЕЙНЕР ДЛЯ ОТЧЕТА =====
    if (!document.getElementById('report-container')) {
        console.log('➕ Создаю контейнер для отчета');
        
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const reportDiv = document.createElement('div');
            reportDiv.id = 'report-container';
            
            // Стили для контейнера отчета
            reportDiv.style.cssText = `
                margin: 25px 0;
                padding: 25px;
                background: white;
                border-radius: 12px;
                border: 2px solid #e0e0e0;
                max-height: 500px;
                overflow-y: auto;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            `;
            
            // Добавляем перед кнопкой "Начать заново"
            const restartBtn = resultsScreen.querySelector('button');
            if (restartBtn) {
                resultsScreen.insertBefore(reportDiv, restartBtn);
            } else {
                resultsScreen.appendChild(reportDiv);
            }
            
            console.log('✅ Контейнер отчета создан');
        } else {
            console.error('❌ Не найден results-screen');
        }
    } else {
        console.log('✅ Контейнер отчета уже существует');
    }
    
    // ===== КНОПКА "НАЧАТЬ ЗАНОВО" =====
    if (!document.getElementById('restart-button')) {
        console.log('➕ Создаю кнопку "Начать заново"');
        
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            // Проверяем, есть ли уже кнопка без ID
            const existingBtn = resultsScreen.querySelector('button');
            if (existingBtn && !existingBtn.id) {
                existingBtn.id = 'restart-button';
                console.log('✅ Назначил ID существующей кнопке');
            } else {
                // Создаем новую кнопку
                const restartBtn = document.createElement('button');
                restartBtn.id = 'restart-button';
                restartBtn.textContent = '🔄 Начать заново';
                
                restartBtn.style.cssText = `
                    padding: 15px 40px;
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: all 0.3s;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    min-width: 200px;
                `;
                
                resultsScreen.appendChild(restartBtn);
                console.log('✅ Кнопка "Начать заново" создана');
            }
        }
    } else {
        console.log('✅ Кнопка "Начать заново" уже существует');
    }
}

// ===============================================
// 2. НАСТРОЙКА ВСЕХ КНОПОК
// ===============================================
function setupAllButtons() {
    console.log('🔗 Настраиваю кнопки...');
    
    // ===== КНОПКИ КЛАССОВ =====
    const classButtons = document.querySelectorAll('#class-selection button');
    classButtons.forEach(btn => {
        // Очищаем старые обработчики
        btn.onclick = null;
        
        // Добавляем новый обработчик
        btn.addEventListener('click', function() {
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎓 Выбран ${classNum} класс`);
            startTestForClass(classNum);
        });
    });
    
    // ===== КНОПКА "ПРЕДЫДУЩИЙ" =====
    const prevBtn = document.getElementById('prev-button');
    if (prevBtn) {
        prevBtn.onclick = function() {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion();
            }
        };
    }
    
    // ===== КНОПКА "СЛЕДУЮЩИЙ" =====
    const nextBtn = document.getElementById('next-button');
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                showQuestion();
            }
        };
    }
    
    // ===== КНОПКА "ЗАВЕРШИТЬ" =====
    const finishBtn = document.getElementById('finish-button');
    if (finishBtn) {
        finishBtn.onclick = function() {
            console.log('🏁 Завершаю тест...');
            finishTest();
        };
        console.log('✅ Кнопка "Завершить" настроена');
    }
    
    // ===== КНОПКА "НАЧАТЬ ЗАНОВО" =====
    const restartBtn = document.getElementById('restart-button');
    if (restartBtn) {
        restartBtn.onclick = function() {
            console.log('🔄 Начинаю заново...');
            restartTest();
        };
    }
    
    console.log('✅ Все кнопки настроены');
}

// ===============================================
// 3. ЗАГРУЗКА ВОПРОСОВ
// ===============================================
function loadTestQuestions() {
    // Сначала пробуем загрузить из questions.json
    fetch('questions.json')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Файл не найден');
        })
        .then(data => {
            questions = data;
            console.log(`✅ Загружено ${questions.length} вопросов из JSON`);
            updateClassButtons();
        })
        .catch(error => {
            console.log('📋 Использую тестовые вопросы');
            
            // Тестовые вопросы на случай отсутствия файла
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
        });
}

function updateClassButtons() {
    const buttons = document.querySelectorAll('#class-selection button');
    
    buttons.forEach(btn => {
        const classNum = parseInt(btn.getAttribute('data-class'));
        const count = questions.filter(q => q.class === classNum).length;
        
        if (count > 0) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = `${classNum} класс <span style="font-size:0.8em">(${count})</span>`;
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.innerHTML = `${classNum} класс`;
        }
    });
}

// ===============================================
// 4. ЗАПУСК ТЕСТА
// ===============================================
function startTestForClass(classNum) {
    console.log(`🚀 Начинаю тест для ${classNum} класса`);
    
    // Фильтруем вопросы по классу
    const classQuestions = questions.filter(q => q.class === classNum);
    
    if (classQuestions.length === 0) {
        alert('Для этого класса пока нет вопросов');
        return;
    }
    
    // Сохраняем вопросы для теста
    questions = classQuestions;
    currentQuestion = 0;
    userAnswers = new Array(questions.length).fill(null);
    score = 0;
    
    // Показываем экран теста
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-screen').style.display = 'none';
    
    // Обновляем заголовок
    document.getElementById('selected-class').textContent = classNum;
    
    // Создаем кнопки навигации
    createNavButtons();
    
    // Показываем первый вопрос
    showQuestion();
}

function createNavButtons() {
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
    
    updateNavButtons();
}

function updateNavButtons() {
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
    console.log(`📝 Показываю вопрос ${currentQuestion + 1} из ${questions.length}`);
    
    const question = questions[currentQuestion];
    
    // Текст вопроса
    document.getElementById('question-text').textContent = 
        `Вопрос ${currentQuestion + 1}: ${question.question}`;
    
    // Очищаем старые ответы
    const answersArea = document.getElementById('answers-area');
    answersArea.innerHTML = '';
    
    // Обновляем кнопки навигации
    document.getElementById('prev-button').disabled = currentQuestion === 0;
    document.getElementById('next-button').disabled = true;
    
    // ===== ВАЖНО: КНОПКА "ЗАВЕРШИТЬ" =====
    const nextBtn = document.getElementById('next-button');
    const finishBtn = document.getElementById('finish-button');
    
    // Проверяем последний ли это вопрос
    const isLastQuestion = currentQuestion === questions.length - 1;
    
    if (nextBtn) nextBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
    if (finishBtn) {
        finishBtn.style.display = isLastQuestion ? 'inline-block' : 'none';
        console.log(`🏁 Кнопка "Завершить" видима: ${finishBtn.style.display}`);
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
        
        // Обработчик клика
        answerDiv.onclick = function() {
            selectAnswer(index, answer.isCorrect, this);
        };
        
        answersArea.appendChild(answerDiv);
    });
    
    updateProgress();
    updateNavButtons();
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
    console.log('🎉 Завершаю тест, показываю результаты!');
    
    // Считаем правильные ответы
    const correct = userAnswers.filter(a => a && a.isCorrect).length;
    const total = questions.length;
    
    // Показываем экран результатов
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // Обновляем счет
    document.getElementById('score').textContent = `${correct} из ${total}`;
    
    // ===== ВАЖНО: СОЗДАЕМ ОТЧЕТ =====
    createReport();
}

function createReport() {
    console.log('📊 Создаю подробный отчет...');
    
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        console.error('❌ Контейнер отчета не найден!');
        return;
    }
    
    // Очищаем контейнер
    reportContainer.innerHTML = '';
    
    // Заголовок отчета
    const title = document.createElement('h3');
    title.textContent = '📋 Подробный отчет по тесту';
    title.style.cssText = `
        color: #2c3e50;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 3px solid #3498db;
        text-align: center;
        font-size: 22px;
    `;
    reportContainer.appendChild(title);
    
    // Если нет ответов
    if (userAnswers.every(a => a === null)) {
        const message = document.createElement('div');
        message.innerHTML = `
            <p style="text-align: center; color: #7f8c8d; padding: 40px;">
                Вы не ответили ни на один вопрос.<br>
                Пройдите тест заново и дайте ответы!
            </p>
        `;
        reportContainer.appendChild(message);
        return;
    }
    
    // Создаем отчет для каждого вопроса
    questions.forEach((question, index) => {
        const answer = userAnswers[index];
        if (answer === null) return; // Пропускаем неотвеченные
        
        const isCorrect = answer.isCorrect;
        
        // Создаем блок отчета
        const reportBlock = document.createElement('div');
        reportBlock.className = 'report-block';
        reportBlock.style.cssText = `
            background: ${isCorrect ? '#e8f5e9' : '#ffebee'};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 6px solid ${isCorrect ? '#4CAF50' : '#f44336'};
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            transition: transform 0.3s;
        `;
        
        // Эффект при наведении
        reportBlock.onmouseover = function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        };
        reportBlock.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
        };
        
        // Номер вопроса
        const questionNum = document.createElement('div');
        questionNum.innerHTML = `<strong style="color: #3498db;">Вопрос ${index + 1}:</strong>`;
        questionNum.style.fontSize = '14px';
        questionNum.style.marginBottom = '5px';
        questionNum.style.color = '#7f8c8d';
        
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
            <span style="margin-left: 10px;">${isCorrect ? '✅' : '❌'}</span>
        `;
        
        // Правильный ответ (если неправильно)
        let correctAnswerDiv = '';
        if (!isCorrect) {
            const correct = question.answers.find(a => a.isCorrect);
            if (correct) {
                correctAnswerDiv = `
                    <div style="
                        background: #f1f8e9;
                        padding: 12px 15px;
                        border-radius: 8px;
                        margin-top: 10px;
                        border: 2px solid #dcedc8;
                    ">
                        <span style="color: #689f38; font-weight: bold;">
                            Правильный ответ:
                        </span> 
                        ${correct.text} 
                        <span style="margin-left: 10px;">✅</span>
                    </div>
                `;
            }
        }
        
        // Статус
        const statusDiv = document.createElement('div');
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
        statusDiv.textContent = isCorrect ? '✓ ПРАВИЛЬНО' : '✗ НЕПРАВИЛЬНО';
        
        // Собираем всё вместе
        reportBlock.appendChild(questionNum);
        reportBlock.appendChild(questionText);
        reportBlock.appendChild(userAnswerDiv);
        if (correctAnswerDiv) {
            reportBlock.innerHTML += correctAnswerDiv;
        }
        reportBlock.appendChild(statusDiv);
        
        reportContainer.appendChild(reportBlock);
    });
    
    // Итоговая статистика
    const correctCount = userAnswers.filter(a => a && a.isCorrect).length;
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    const summary = document.createElement('div');
    summary.style.cssText = `
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 20px;
        border-radius: 12px;
        margin-top: 20px;
        text-align: center;
    `;
    summary.innerHTML = `
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
            ${correctCount} из ${totalCount}
        </div>
        <div style="font-size: 18px; margin-bottom: 5px;">
            Правильных ответов: ${percentage}%
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
            ${percentage >= 80 ? 'Отличный результат! 🎉' : 
              percentage >= 60 ? 'Хороший результат! 👍' : 
              'Попробуйте еще раз! 💪'}
        </div>
    `;
    
    reportContainer.appendChild(summary);
    
    console.log(`✅ Отчет создан: ${correctCount}/${totalCount} правильных ответов`);
}

// ===============================================
// 7. ПЕРЕЗАПУСК
// ===============================================
function restartTest() {
    console.log('🔄 Перезапускаю тест...');
    
    // Сбрасываем всё
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    
    // Показываем стартовый экран
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Обновляем кнопки классов
    updateClassButtons();
}

// ===============================================
// 8. ФУНКЦИИ ДЛЯ ОТЛАДКИ (вызываются из консоли)
// ===============================================

// Проверить все элементы
window.checkAll = function() {
    console.log('🔍 Проверяю все элементы:');
    console.log('1. Кнопка "Завершить":', document.getElementById('finish-button'));
    console.log('2. Контейнер отчета:', document.getElementById('report-container'));
    console.log('3. Кнопка "Начать заново":', document.getElementById('restart-button'));
    console.log('4. Экран теста:', document.getElementById('quiz-container'));
    console.log('5. Экран результатов:', document.getElementById('results-screen'));
    console.log('6. Кнопки классов:', document.querySelectorAll('#class-selection button').length);
};

// Принудительно показать результаты (для теста)
window.showTestResults = function() {
    console.log('🎯 Принудительно показываю результаты');
    
    // Создаем тестовые данные
    questions = [
        {
            id: 1,
            class: 5,
            question: "Тестовый вопрос 1?",
            answers: [
                {text: "Правильный ответ", isCorrect: true},
                {text: "Неправильный 1", isCorrect: false},
                {text: "Неправильный 2", isCorrect: false},
                {text: "Неправильный 3", isCorrect: false}
            ]
        },
        {
            id: 2,
            class: 5,
            question: "Тестовый вопрос 2?",
            answers: [
                {text: "Неправильный 1", isCorrect: false},
                {text: "Правильный ответ", isCorrect: true},
                {text: "Неправильный 2", isCorrect: false},
                {text: "Неправильный 3", isCorrect: false}
            ]
        }
    ];
    
    userAnswers = [
        {index: 0, isCorrect: true, text: "Правильный ответ"},
        {index: 0, isCorrect: false, text: "Неправильный 1"}
    ];
    
    // Показываем результаты
    finishTest();
};

// Перезапустить тест
window.restartApp = restartTest;

// Проверить видимость кнопки "Завершить"
window.checkFinishButton = function() {
    const btn = document.getElementById('finish-button');
    if (btn) {
        console.log('✅ Кнопка найдена');
        console.log('- display:', btn.style.display);
        console.log('- visibility:', btn.style.visibility);
        console.log('- opacity:', btn.style.opacity);
        console.log('- position:', btn.style.position);
        console.log('- z-index:', btn.style.zIndex);
        
        // Принудительно показываем кнопку
        btn.style.display = 'block !important';
        btn.style.visibility = 'visible !important';
        btn.style.opacity = '1 !important';
        btn.style.position = 'relative !important';
        btn.style.zIndex = '1000 !important';
        console.log('🚀 Кнопка принудительно показана!');
    } else {
        console.error('❌ Кнопка не найдена!');
    }
};
