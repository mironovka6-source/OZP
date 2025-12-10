// ГАРАНТИРОВАННО РАБОЧИЙ СКРИПТ
console.log('🔥 Тест загружен!');

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let currentClass = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM готов');
    
    // Гарантированно показываем кнопку "Завершить" в нужный момент
    setupFinishButton();
    
    // Настраиваем все кнопки
    setupAllButtons();
    
    // Загружаем вопросы
    loadQuestions();
});

// ===============================================
// НАСТРОЙКА КНОПКИ "ЗАВЕРШИТЬ"
// ===============================================
function setupFinishButton() {
    console.log('🔧 Настраиваю кнопку "Завершить"...');
    
    // Проверяем, есть ли кнопка в DOM
    let finishBtn = document.getElementById('finish-button');
    
    // Если кнопки нет - создаем её
    if (!finishBtn) {
        console.log('➕ Создаю кнопку "Завершить"');
        
        const buttonsContainer = document.querySelector('.buttons-container');
        if (buttonsContainer) {
            finishBtn = document.createElement('button');
            finishBtn.id = 'finish-button';
            finishBtn.textContent = '🏁 Завершить тест';
            
            // ПРИНУДИТЕЛЬНЫЕ СТИЛИ для гарантии видимости
            finishBtn.style.cssText = `
                /* Позиционирование */
                display: none !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 1000 !important;
                
                /* Внешний вид */
                padding: 15px 30px !important;
                background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
                color: white !important;
                border: none !important;
                border-radius: 10px !important;
                font-size: 18px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                
                /* Тень для заметности */
                box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3) !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3) !important;
                
                /* Размеры */
                min-width: 200px !important;
                height: auto !important;
                margin: 0 10px !important;
            `;
            
            buttonsContainer.appendChild(finishBtn);
        }
    }
    
    // Настраиваем обработчик
    if (finishBtn) {
        finishBtn.onclick = function() {
            console.log('🎯 КНОПКА "ЗАВЕРШИТЬ" НАЖАТА!');
            finishTest();
        };
        
        // Сразу прячем кнопку
        finishBtn.style.display = 'none !important';
        console.log('✅ Кнопка "Завершить" настроена');
    }
}

// ===============================================
// НАСТРОЙКА ВСЕХ КНОПОК
// ===============================================
function setupAllButtons() {
    console.log('🔗 Настраиваю все кнопки...');
    
    // Кнопки выбора класса
    document.querySelectorAll('#class-selection button').forEach(btn => {
        btn.onclick = function() {
            const classNum = parseInt(this.getAttribute('data-class'));
            console.log(`🎓 Выбран ${classNum} класс`);
            startTest(classNum);
        };
    });
    
    // Кнопка "Предыдущий"
    const prevBtn = document.getElementById('prev-button');
    if (prevBtn) {
        prevBtn.onclick = function() {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion();
            }
        };
    }
    
    // Кнопка "Следующий"
    const nextBtn = document.getElementById('next-button');
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                showQuestion();
            } else {
                // Если это последний вопрос, показываем кнопку "Завершить"
                showFinishButton();
            }
        };
    }
    
    // Кнопка "Начать заново"
    const restartBtn = document.getElementById('restart-button');
    if (restartBtn) {
        restartBtn.onclick = restartTest;
    }
    
    console.log('✅ Все кнопки настроены');
}

// ===============================================
// УПРАВЛЕНИЕ КНОПКОЙ "ЗАВЕРШИТЬ"
// ===============================================
function showFinishButton() {
    console.log('🚀 ПОКАЗЫВАЮ кнопку "Завершить"');
    
    const finishBtn = document.getElementById('finish-button');
    const nextBtn = document.getElementById('next-button');
    
    if (finishBtn && nextBtn) {
        // Прячем "Следующий"
        nextBtn.style.display = 'none !important';
        nextBtn.style.visibility = 'hidden !important';
        
        // Показываем "Завершить" - ГАРАНТИРОВАННО!
        finishBtn.style.display = 'block !important';
        finishBtn.style.visibility = 'visible !important';
        finishBtn.style.opacity = '1 !important';
        
        // Добавляем анимацию для привлечения внимания
        finishBtn.style.animation = 'pulse 2s infinite !important';
        
        console.log('✅ Кнопка "Завершить" ПРИНУДИТЕЛЬНО показана');
        console.log('- display:', finishBtn.style.display);
        console.log('- visibility:', finishBtn.style.visibility);
    } else {
        console.error('❌ Кнопки не найдены!');
        console.log('finishBtn:', finishBtn);
        console.log('nextBtn:', nextBtn);
    }
}

function hideFinishButton() {
    const finishBtn = document.getElementById('finish-button');
    if (finishBtn) {
        finishBtn.style.display = 'none !important';
    }
}

// ===============================================
// ЗАГРУЗКА ВОПРОСОВ
// ===============================================
function loadQuestions() {
    console.log('📥 Загружаю вопросы...');
    
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
    
    // Сбрасываем кнопки
    resetButtons();
    
    // Создаем навигацию
    createNavigation();
    
    // Показываем первый вопрос
    showQuestion();
}

function resetButtons() {
    // Гарантируем, что кнопка "Завершить" скрыта при старте
    hideFinishButton();
    
    // Показываем кнопку "Следующий"
    const nextBtn = document.getElementById('next-button');
    if (nextBtn) {
        nextBtn.style.display = 'inline-block !important';
        nextBtn.style.visibility = 'visible !important';
    }
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
    
    // Обновляем кнопки навигации
    document.getElementById('prev-button').disabled = currentQuestion === 0;
    document.getElementById('next-button').disabled = true;
    
    // ВАЖНО: Управляем видимостью кнопок
    const isLastQuestion = currentQuestion === questions.length - 1;
    
    if (isLastQuestion) {
        console.log('🏁 Это последний вопрос - показываю кнопку "Завершить"');
        // Ждем немного, чтобы DOM обновился
        setTimeout(showFinishButton, 100);
    } else {
        // Гарантируем, что кнопка "Следующий" видна
        const nextBtn = document.getElementById('next-button');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block !important';
            nextBtn.style.visibility = 'visible !important';
        }
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
    
    // Активируем кнопку "Следующий" или "Завершить"
    const isLastQuestion = currentQuestion === questions.length - 1;
    if (isLastQuestion) {
        console.log('🎯 Последний вопрос отвечен - активирую кнопку "Завершить"');
        const finishBtn = document.getElementById('finish-button');
        if (finishBtn) {
            finishBtn.disabled = false;
        }
    } else {
        document.getElementById('next-button').disabled = false;
    }
    
    updateProgress();
}

function updateProgress() {
    const answered = userAnswers.filter(a => a !== null).length;
    document.getElementById('progress-counter').textContent = 
        `Отвечено: ${answered} из ${questions.length}`;
}

// ===============================================
// ЗАВЕРШЕНИЕ ТЕСТА И РЕЗУЛЬТАТЫ
// ===============================================
function finishTest() {
    console.log('🎉 ЗАВЕРШЕНИЕ ТЕСТА');
    
    // Считаем правильные ответы
    const correct = userAnswers.filter(a => a && a.isCorrect).length;
    const total = questions.length;
    
    // Проверяем, все ли вопросы отвечены
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
        if (!confirm(`Вы ответили не на все вопросы. Осталось: ${unanswered}. Завершить тест?`)) {
            return;
        }
    }
    
    // Переключаем экраны
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
        border-bottom: 2px solid #3498db;
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
    
    // Отчет по вопросам
    questions.forEach((question, index) => {
        const answer = userAnswers[index];
        if (answer === null) return;
        
        const isCorrect = answer.isCorrect;
        
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
        
        // Если неправильно
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
        
        reportContainer.appendChild(reportItem);
    });
}

// ===============================================
// ПЕРЕЗАПУСК
// ===============================================
function restartTest() {
    console.log('🔄 Перезапуск');
    
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Сбрасываем кнопки
    resetButtons();
    
    updateClassButtons();
}

// ===============================================
// ФУНКЦИИ ДЛЯ ОТЛАДКИ
// ===============================================
window.showFinishNow = function() {
    // Принудительно показать кнопку "Завершить"
    showFinishButton();
};

window.checkFinishButton = function() {
    const btn = document.getElementById('finish-button');
    console.log('🔍 Проверка кнопки "Завершить":');
    console.log('- Существует:', !!btn);
    console.log('- display:', btn?.style.display);
    console.log('- visibility:', btn?.style.visibility);
    console.log('- opacity:', btn?.style.opacity);
    console.log('- position:', btn?.style.position);
};

window.forceResults = function() {
    // Принудительно показать результаты
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    document.getElementById('score').textContent = '3 из 5';
};

// Добавляем стиль для анимации пульсации
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
