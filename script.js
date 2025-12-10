// --- ВАШИ ДАННЫЕ (Вопросы) ---
// Я вставил сюда весь список, который вы прислали.
const rawData = [
  {
    "id": 1,
    "class": 5,
    "topic": "Бумага и Оригами",
    "question": "Какой материал традиционно используется для создания фигурок в технике оригами?",
    "answers": [
      {"text": "Картон", "isCorrect": false},
      {"text": "Пластилин", "isCorrect": false},
      {"text": "Бумага", "isCorrect": true},
      {"text": "Фольга", "isCorrect": false}
    ]
  },
  {
    "id": 2,
    "class": 6,
    "topic": "Изобразительное искусство",
    "question": "Как называется художественный прием, когда художник передает объем предмета с помощью света и тени?",
    "answers": [
      {"text": "Перса", "isCorrect": false},
      {"text": "Колор", "isCorrect": false},
      {"text": "Штрих", "isCorrect": false},
      {"text": "Свет", "isCorrect": true}
    ]
  },
  {
    "id": 2,
    "class": 6,
    "topic": "Изобразительное искусство",
    "question": "Как называется художественный прием, когда художник передает объем предмета с помощью света и тени?",
    "answers": [
      {"text": "Перспектива", "isCorrect": false},
      {"text": "Колорит", "isCorrect": false},
      {"text": "Штриховка", "isCorrect": false},
      {"text": "Светотень", "isCorrect": true}
    ]
  },
  {
    "id": 3,
    "class": 7,
    "topic": "Декоративно-прикладное искусство",
    "question": "Какой вид росписи по ткани включает использование резервирующего (непропускающего краску) состава, чаще всего на основе воска?",
    "answers": [
      {"text": "Гуашь", "isCorrect": false},
      {"text": "Акварель", "isCorrect": false},
      {"text": "Батик", "isCorrect": true},
      {"text": "Фреска", "isCorrect": false}
    ]
  },
  {
    "id": 3,
    "class": 8,
    "topic": "Декоративно-прикладное искусство",
    "question": "Что является основным языком живописи?",
    "answers": [
      {"text": "Линия", "isCorrect": false},
      {"text": "Объем", "isCorrect": false},
      {"text": "Цвет", "isCorrect": true},
      {"text": "Фактура", "isCorrect": false}
    ]
  },
  {
    "id": 4,
    "class": 9,
    "topic": "Графика и Дизайн",
    "question": "Что в графическом дизайне означает аббревиатура 'CMYK'?",
    "answers": [
      {"text": "Цвет, Металл, Желтый, Кварц", "isCorrect": false},
      {"text": "Голубой, Пурпурный, Желтый, Черный", "isCorrect": true},
      {"text": "Хром, Магний, Желтый, Кадмий", "isCorrect": false},
      {"text": "Циан, Маджента, Йеллоу, Ки", "isCorrect": false}
    ]
  },
  {
    "id": 1,
    "class": 5,
    "topic": "Бумага и Оригами",
    "question": "Что является основным языком живописи?",
    "answers": [
      {"text": "Линия", "isCorrect": false},
      {"text": "Объем", "isCorrect": false},
      {"text": "Цвет", "isCorrect": true},
      {"text": "Фактура", "isCorrect": false}
    ]
  },
  {
    "id": 1,
    "class": 5,
    "topic": "Декоративно-прикладное искусство",
    "question": "Как называется вид пластического искусства, где художественные произведения создаются путем резьбы, лепки или отливки?",
    "answers": [
      {"text": "Живопись", "isCorrect": false},
      {"text": "Графика", "isCorrect": false},
      {"text": "Скульптура", "isCorrect": true},
      {"text": "Архитектура", "isCorrect": false}
    ]
  },
  {
    "id": 1,
    "class": 5,
    "topic": "Изобразительное искусство",
    "question": "Что означает термин Графика?",
    "answers": [
      {"text": "Произведение, выполненное красками", "isCorrect": false},
      {"text": "Искусство проектировать здания", "isCorrect": false},
      {"text": "Создание художественных изделий в быту", "isCorrect": false},
      {"text": "Рисунок, основанный на сочетании черного и белого", "isCorrect": true}
    ]
  },
  {
    "id": 1,
    "class": 5,
    "topic": "Декоративно-прикладное искусство",
    "question": "Какой жанр изобразительного искусства отражает повседневную жизнь людей?",
    "answers": [
      {"text": "Исторический", "isCorrect": false},
      {"text": "Батальный", "isCorrect": false},
      {"text": "Бытовой (Жанровая картина)", "isCorrect": true},
      {"text": "Мифологический", "isCorrect": false}
    ]
  },
  {
    "id": 1,
    "class": 5,
    "topic": "Графика и Дизайн",
    "question": "Что такое Пейзаж?",
    "answers": [
      {"text": "Изображение человека", "isCorrect": false},
      {"text": "Изображение природы", "isCorrect": true},
      {"text": "Изображение неодушевленных предметов", "isCorrect": false},
      {"text": "Изображение битв", "isCorrect": false}
    ]
  },
  // Остальные вопросы-заполнители из вашего списка также включены для примера:
  {
    "id": 1,
    "class": 5,
    "topic": "Тест",
    "question": "Пример вопроса №12",
    "answers": [
      {"text": "Ответ 1", "isCorrect": false},
      {"text": "Правильный ответ", "isCorrect": true},
      {"text": "Ответ 3", "isCorrect": false},
      {"text": "Ответ 4", "isCorrect": false}
    ]
  }
];

// --- АВТОМАТИЧЕСКАЯ ОБРАБОТКА ДАННЫХ ---
// Эта функция превращает ваш JSON в структуру, понятную игре
const quizData = {};

rawData.forEach(item => {
    // 1. Создаем массив для класса, если его еще нет
    if (!quizData[item.class]) {
        quizData[item.class] = [];
    }

    // 2. Находим индекс правильного ответа
    const correctIndex = item.answers.findIndex(answer => answer.isCorrect === true);

    // 3. Формируем массив текстов ответов
    const answersList = item.answers.map(answer => answer.text);

    // 4. Добавляем в итоговую базу
    quizData[item.class].push({
        question: item.question,
        answers: answersList,
        correct: correctIndex,
        topic: item.topic // Сохраняем тему на будущее
    });
});


// --- ЛОГИКА ИГРЫ (Осталась прежней) ---

let currentClass = null;
let currentQuestions = [];
let userAnswers = [];
let currentQuestionIndex = 0;

// DOM Элементы
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

// Инициализация кнопок классов
classButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = parseInt(btn.getAttribute('data-class'));
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

// Функции логики

function startQuiz(classNum) {
    currentClass = classNum;
    
    if (!quizData[classNum] || quizData[classNum].length === 0) {
        alert("Для этого класса вопросов пока нет в базе!");
        return;
    }

    currentQuestions = quizData[classNum];
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;

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
    
    // Добавил отображение темы вопроса, если она есть
    let questionTitle = `${currentQuestionIndex + 1}. ${questionData.question}`;
    if(questionData.topic) {
        questionTitle = `<small style="color: #7f8c8d;">Тема: ${questionData.topic}</small><br>` + questionTitle;
    }

    questionText.innerHTML = questionTitle;

    answersArea.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.classList.add('answer-option');
        btn.textContent = answer;
        
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }

        btn.onclick = () => selectAnswer(index);
        answersArea.appendChild(btn);
    });

    updateControls();
    updateNavigationDots();

    const answeredCount = userAnswers.filter(a => a !== null).length;
    progressCounter.textContent = `Отвечено: ${answeredCount} из ${currentQuestions.length}`;
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    renderQuestion();
}

function updateControls() {
    prevButton.disabled = currentQuestionIndex === 0;

    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextButton.style.display = 'none';
        finishButton.style.display = 'inline-block';
        finishButton.disabled = !isAnswered;
    } else {
        nextButton.style.display = 'inline-block';
        finishButton.style.display = 'none';
        nextButton.disabled = !isAnswered;
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
    let reportHTML = '<div style="text-align:left; max-height: 300px; overflow-y: auto;">';

    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) score++;

        // Формируем отчет о результатах
        reportHTML += `
            <div class="result-item ${isCorrect ? 'correct' : 'wrong'}" style="margin-bottom: 10px; padding: 10px; background: #fff; border: 1px solid #eee;">
                <strong>${index + 1}. ${q.question}</strong><br>
                Ваш ответ: ${userAnswer !== null ? q.answers[userAnswer] : 'Нет ответа'} 
                ${isCorrect ? '✅' : '❌'}<br>
                ${!isCorrect ? `<span style="color:green">Правильно: ${q.answers[q.correct]}</span>` : ''}
            </div>
        `;
    });
    reportHTML += '</div>';

    scoreDisplay.textContent = `${score} из ${currentQuestions.length}`;
    reportContainer.innerHTML = reportHTML; // Вставляем детальный отчет

    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
}
