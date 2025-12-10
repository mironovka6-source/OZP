// --- База данных вопросов (примеры) ---
// Вы можете легко заменить вопросы на свои
const quizData = {
    5: [
        {
            question: "Какой инструмент используется для резки бумаги?",
            answers: ["Молоток", "Ножницы", "Пила", "Отвертка"],
            correct: 1 // Индекс правильного ответа (начинается с 0)
        },
        {
            question: "Что относится к природным материалам?",
            answers: ["Пластик", "Железо", "Шишки", "Стекло"],
            correct: 2
        },
        {
            question: "Основной цвет в живописи - это...",
            answers: ["Оранжевый", "Красный", "Фиолетовый", "Зеленый"],
            correct: 1
        }
    ],
    6: [
        {
            question: "Что такое натюрморт?",
            answers: ["Изображение человека", "Изображение природы", "Изображение неодушевленных предметов", "Изображение зданий"],
            correct: 2
        },
        {
            question: "Какой материал получают из древесины?",
            answers: ["Металл", "Бумага", "Бетон", "Керамика"],
            correct: 1
        },
        {
            question: "Инструмент для выпиливания из фанеры:",
            answers: ["Лобзик", "Рубанок", "Стамеска", "Топор"],
            correct: 0
        }
    ],
    7: [
        {
            question: "Вид декоративно-прикладного искусства, роспись по ткани:",
            answers: ["Гравюра", "Батик", "Мозаика", "Фреска"],
            correct: 1
        },
        {
            question: "Какой металл обладает магнитными свойствами?",
            answers: ["Алюминий", "Медь", "Железо", "Золото"],
            correct: 2
        },
        {
            question: "Что такое перспектива в рисунке?",
            answers: ["Толщина линий", "Изображение пространства", "Выбор красок", "Размер холста"],
            correct: 1
        }
    ],
    8: [
        {
            question: "Стиль в архитектуре, отличающийся стрельчатыми арками:",
            answers: ["Барокко", "Классицизм", "Готика", "Модерн"],
            correct: 2
        },
        {
            question: "Устройство для преобразования переменного тока:",
            answers: ["Трансформатор", "Резистор", "Конденсатор", "Диод"],
            correct: 0
        },
        {
            question: "Какое волокно является искусственным?",
            answers: ["Хлопок", "Вискоза", "Шерсть", "Лен"],
            correct: 1
        }
    ],
    9: [
        {
            question: "Что такое эргономика?",
            answers: ["Наука о красоте", "Наука об удобстве и безопасности", "Наука о цвете", "Наука о материалах"],
            correct: 1
        },
        {
            question: "Авангардизм - это...",
            answers: ["Стремление к старине", "Отказ от классических канонов", "Религиозное искусство", "Народное творчество"],
            correct: 1
        },
        {
            question: "Маркетинг в технологии нужен для:",
            answers: ["Создания чертежа", "Изучения спроса и продвижения", "Распила материала", "Покраски изделия"],
            correct: 1
        }
    ]
};

// --- Переменные состояния ---
let currentClass = null;
let currentQuestions = [];
let userAnswers = []; // Массив для хранения ответов пользователя
let currentQuestionIndex = 0;

// --- DOM Элементы ---
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const resultsScreen = document.getElementById('results-screen');
const classButtons = document.querySelectorAll('#class-selection button');

const questionText = document.getElementById('question-text');
const answersArea = document.getElementById('answers-area');
const navigationPanel = document.getElementById('navigation-panel');
const progressCounter = document.getElementById('progress-counter');
const selectedClassSpan = document.getElementById('selected-class');

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const finishButton = document.getElementById('finish-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const reportContainer = document.getElementById('report-container');

// --- Инициализация ---
classButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-class');
        startQuiz(selected);
    });
});

restartButton.addEventListener('click', () => {
    resultsScreen.style.display = 'none';
    startScreen.style.display = 'block';
});

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
});

finishButton.addEventListener('click', showResults);

// --- Логика Теста ---

function startQuiz(classNum) {
    currentClass = classNum;
    
    // Проверка, есть ли вопросы для выбранного класса
    if (!quizData[classNum]) {
        alert("Вопросы для этого класса еще не добавлены!");
        return;
    }

    currentQuestions = quizData[classNum];
    userAnswers = new Array(currentQuestions.length).fill(null); // Сброс ответов
    currentQuestionIndex = 0;

    // Обновление UI
    selectedClassSpan.textContent = classNum;
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';

    createNavigationPanel();
    renderQuestion();
}

function createNavigationPanel() {
    navigationPanel.innerHTML = '';
    currentQuestions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        dot.textContent = index + 1;
        dot.onclick = () => {
            currentQuestionIndex = index;
            renderQuestion();
        };
        navigationPanel.appendChild(dot);
    });
}

function renderQuestion() {
    const questionData = currentQuestions[currentQuestionIndex];
    
    // 1. Отображение текста вопроса
    questionText.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;

    // 2. Отображение вариантов ответов
    answersArea.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.classList.add('answer-option');
        btn.textContent = answer;
        
        // Если этот ответ был выбран ранее, подсвечиваем его
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }

        btn.onclick = () => selectAnswer(index);
        answersArea.appendChild(btn);
    });

    // 3. Обновление кнопок навигации
    updateControls();
    
    // 4. Обновление панели навигации (точки)
    updateNavigationDots();

    // 5. Счетчик
    const answeredCount = userAnswers.filter(a => a !== null).length;
    progressCounter.textContent = `Отвечено: ${answeredCount} из ${currentQuestions.length}`;
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    renderQuestion(); // Перерисовываем, чтобы показать выделение
}

function updateControls() {
    // Кнопка "Назад"
    prevButton.disabled = currentQuestionIndex === 0;

    // Логика для кнопки "Вперед" и "Завершить"
    // Разрешаем идти дальше только если дан ответ (опционально)
    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    
    // Кнопка "Вперед"
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextButton.style.display = 'none';
        finishButton.style.display = 'inline-block';
        finishButton.disabled = !isAnswered; // Блокируем финиш, если не ответил на последний
    } else {
        nextButton.style.display = 'inline-block';
        finishButton.style.display = 'none';
        nextButton.disabled = !isAnswered; // Блокируем, пока не ответит
    }
}

function updateNavigationDots() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'answered');
        if (index === currentQuestionIndex) {
            dot.classList.add('active');
        }
        if (userAnswers[index] !== null) {
            dot.classList.add('answered');
        }
    });
}

function showResults() {
    let score = 0;
    let reportHTML = '';

    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) score++;

        // Формируем детальный отчет (для интереса)
        // Можно убрать этот блок, если отчет не нужен
        /*
        reportHTML += `
            <div class="result-item ${isCorrect ? 'correct' : 'wrong'}">
                <strong>Вопрос ${index + 1}:</strong> ${q.question}<br>
                Ваш ответ: ${q.answers[userAnswer] || 'Нет ответа'} <br>
                ${!isCorrect ? `Правильный ответ: ${q.answers[q.correct]}` : ''}
            </div>
        `;
        */
    });

    // Отображение
    scoreDisplay.textContent = `${score} из ${currentQuestions.length}`;
    reportContainer.innerHTML = reportHTML;

    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
}
