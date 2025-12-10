// ===============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ===============================================
let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answerHistory = [];
let currentClass = null;

// Буквы для вариантов ответов
const answerLetters = ['А', 'Б', 'В', 'Г'];

// ===============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Приложение инициализировано');
    
    // Загружаем вопросы из JSON файла
    loadQuestionsFromJSON();
});

// ===============================================
// ЗАГРУЗКА ВОПРОСОВ ИЗ JSON ФАЙЛА
// ===============================================
async function loadQuestionsFromJSON() {
    try {
        console.log('📥 Загрузка вопросов из questions.json...');
        
        const response = await fetch('questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allQuestions = await response.json();
        console.log(`✅ Успешно загружено ${allQuestions.length} вопросов`);
        
        // Настраиваем кнопки классов
        setupClassButtons();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки вопросов:', error);
        
        // Показываем сообщение об ошибке
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.style.marginTop = '20px';
            errorDiv.style.border = '1px solid red';
            errorDiv.style.borderRadius = '8px';
            errorDiv.innerHTML = `
                <h4>⚠️ Ошибка загрузки вопросов</h4>
                <p>${error.message}</p>
                <p>Проверьте наличие файла questions.json в той же папке</p>
            `;
            startScreen.appendChild(errorDiv);
        }
    }
}

// ===============================================
// НАСТРОЙКА КНОПОК КЛАССОВ
// ===============================================
function setupClassButtons() {
    console.log('🔘 Настройка кнопок классов...');
    
    const classSelection = document.getElementById('class-selection');
    if (!classSelection) {
        console.error('❌ Не найден элемент #class-selection');
        return;
    }
    
    // Очищаем все старые обработчики
    const buttons = classSelection.querySelectorAll('button');
    buttons.forEach(button => {
        // Клонируем кнопку чтобы сбросить все обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Получаем обновленные кнопки
    const updatedButtons = classSelection.querySelectorAll('button');
    
    updatedButtons.forEach(button => {
        const classNum = parseInt(button.getAttribute('data-class'));
        
        // Проверяем, есть ли вопросы для этого класса
        const classQuestions = allQuestions.filter(q => q.class === classNum);
        
        if (classQuestions.length > 0) {
            // Кнопка активна
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            
            // Добавляем счетчик вопросов
            const countSpan = document.createElement('span');
            countSpan.className = 'question-count';
            countSpan.textContent = ` (${classQuestions.length})`;
            countSpan.style.fontSize = '0.8em';
            countSpan.style.opacity = '0.7';
            button.appendChild(countSpan);
            
            // Добавляем обработчик с правильным binding
            button.addEventListener('click', function(event) {
                event.preventDefault();
                console.log(`🎯 Выбран класс: ${classNum}`);
                startTest(classNum);
            });
            
            console.log(`✅ Кнопка ${classNum} класса активна (${classQuestions.length} вопросов)`);
        } else {
            // Кнопка неактивна
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Нет вопросов для этого класса';
            
            console.log(`❌ Кнопка ${classNum} класса неактивна`);
        }
    });
}

// ===============================================
// ЗАПУСК ТЕСТА
// ===============================================
function startTest(classNum) {
    console.log(`🚀 Запуск теста для ${classNum} класса`);
    
    currentClass = classNum;
    
    // Фильтруем вопросы по классу
    questions = allQuestions.filter(q => q.class === classNum);
    
    console.log(`📊 Найдено вопросов: ${questions.length}`);
    
    if (questions.length === 0) {
        alert(`Для ${classNum} класса нет вопросов!`);
        return;
    }
    
    // Перемешиваем вопросы
    shuffleArray(questions);
    
    // Сбрасываем состояние
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = new Array(questions.length).fill(null);
    
    // Переключаем экраны
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    // Обновляем информацию о классе
    document.getElementById('selected-class').textContent = classNum;
    
    // Создаем навигационные кнопки
    createNavigationButtons();
    
    // Показываем первый вопрос
    displayQuestion();
    
    // Настраиваем обработчики навигации (если еще не настроены)
    setupNavigationHandlers();
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
    navigationPanel.innerHTML = '';
    
    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.className = 'nav-btn';
        button.textContent = index + 1;
        button.dataset.index = index;
        
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            goToQuestion(index);
        });
        
        navigationPanel.appendChild(button);
    });
    
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
    displayQuestion();
    updateNavigationButtons();
    updateProgress();
}

function updateProgress() {
    const answeredCount = answerHistory.filter(answer => answer !== null).length;
    document.getElementById('progress-counter').textContent = 
        `Отвечено: ${answeredCount} из ${questions.length}`;
}

// ===============================================
// ОТОБРАЖЕНИЕ ВОПРОСА
// ===============================================
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
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
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('next-button').style.display = 'none';
        document.getElementById('finish-button').style.display = 'inline-block';
    } else {
        document.getElementById('next-button').style.display = 'inline-block';
        document.getElementById('finish-button').style.display = 'none';
    }
    
    // Создаем варианты ответов
    currentQ.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        
        // Добавляем букву и текст
        answerElement.innerHTML = `
            <span class="answer-letter">${answerLetters[index]}</span>
            <span class="answer-text">${answer.text}</span>
        `;
        
        answerElement.dataset.answerIndex = index;
        answerElement.dataset.isCorrect = answer.isCorrect;
        
        // Если уже есть ответ на этот вопрос, отмечаем его
        const userAnswer = answerHistory[currentQuestionIndex];
        if (userAnswer && userAnswer.answerIndex === index) {
            answerElement.classList.add('selected');
            if (userAnswer.isCorrect) {
                answerElement.classList.add('correct');
            } else {
                answerElement.classList.add('wrong');
            }
        }
        
        // Добавляем обработчик клика
        answerElement.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(answerElement);
    });
    
    updateNavigationButtons();
    updateProgress();
}

// ===============================================
// ОБРАБОТКА ВЫБОРА ОТВЕТА
// ===============================================
function handleAnswerSelect(event) {
    const answerElement = event.currentTarget;
    const answerIndex = parseInt(answerElement.dataset.answerIndex);
    const isCorrect = answerElement.dataset.isCorrect === 'true';
    
    // Блокируем все варианты ответов
    document.querySelectorAll('.answer-option').forEach(option => {
        option.style.pointerEvents = 'none';
        option.classList.remove('selected');
    });
    
    // Отмечаем выбранный вариант
    answerElement.classList.add('selected');
    
    // Показываем правильность ответа
    if (isCorrect) {
        answerElement.classList.add('correct');
    } else {
        answerElement.classList.add('wrong');
        
        // Показываем правильный ответ
        const correctOption = document.querySelector('.answer-option[data-is-correct="true"]');
        if (correctOption) {
            correctOption.classList.add('correct');
        }
    }
    
    // Сохраняем ответ в историю
    answerHistory[currentQuestionIndex] = {
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        answerText: answerElement.querySelector('.answer-text').textContent
    };
    
    // Активируем кнопку "Следующий"
    document.getElementById('next-button').disabled = false;
    
    updateNavigationButtons();
    updateProgress();
}

// ===============================================
// НАСТРОЙКА ОБРАБОТЧИКОВ НАВИГАЦИИ
// ===============================================
function setupNavigationHandlers() {
    // Кнопка "Предыдущий"
    document.getElementById('prev-button').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    });
    
    // Кнопка "Следующий"
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                displayQuestion();
            }
        });
    }
    
    // Кнопка "Завершить"
    const finishButton = document.getElementById('finish-button');
    if (finishButton) {
        finishButton.addEventListener('click', function() {
            showResults();
        });
    }
    
    // Кнопка "Начать заново"
    const restartButton = document.getElementById('restart-button');
    if (!restartButton) {
        // Создаем кнопку если её нет
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            const newRestartButton = document.createElement('button');
            newRestartButton.id = 'restart-button';
            newRestartButton.textContent = '🔄 Начать заново';
            newRestartButton.addEventListener('click', restartTest);
            resultsScreen.appendChild(newRestartButton);
        }
    } else {
        restartButton.addEventListener('click', restartTest);
    }
}

// ===============================================
// ПОКАЗ РЕЗУЛЬТАТОВ
// ===============================================
function showResults() {
    // Подсчитываем правильные ответы
    score = answerHistory.filter(answer => answer && answer.isCorrect).length;
    
    // Переключаем экраны
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // Обновляем счет
    document.getElementById('score').textContent = `${score} из ${questions.length}`;
    
    // Генерируем детальный отчет
    generateDetailedReport();
}

// ===============================================
// ГЕНЕРАЦИЯ ДЕТАЛЬНОГО ОТЧЕТА
// ===============================================
function generateDetailedReport() {
    const reportContainer = document.getElementById('report-container');
    reportContainer.innerHTML = '<h3>Детальный отчет:</h3>';
    
    answerHistory.forEach((answer, index) => {
        if (answer === null) return;
        
        const question = questions[index];
        const isCorrect = answer.isCorrect;
        
        const reportItem = document.createElement('div');
        reportItem.className = `report-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        reportItem.innerHTML = `
            <div class="report-question">
                <strong>Вопрос ${index + 1}:</strong> ${question.question}
            </div>
            <div class="report-answer">
                <span class="user-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    Ваш ответ: ${answer.answerText} ${isCorrect ? '✅' : '❌'}
                </span>
            </div>
        `;
        
        // Если ответ неправильный, показываем правильный ответ
        if (!isCorrect) {
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (correctAnswer) {
                const correctDiv = document.createElement('div');
                correctDiv.className = 'correct-answer';
                correctDiv.innerHTML = `Правильный ответ: ${correctAnswer.text} ✅`;
                reportItem.appendChild(correctDiv);
            }
        }
        
        reportContainer.appendChild(reportItem);
    });
}

// ===============================================
// ПЕРЕЗАПУСК ТЕСТА
// ===============================================
function restartTest() {
    // Переключаем экраны
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    
    // Сбрасываем состояние
    currentQuestionIndex = 0;
    score = 0;
    answerHistory = [];
    currentClass = null;
    questions = [];
    
    // Обновляем кнопки классов
    setupClassButtons();
}
