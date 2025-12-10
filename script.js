// В функции displayQuestion заменяем создание кнопок:
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    questionTextElement.textContent = `${currentQuestionIndex + 1}. ${currentQ.question}`;
    answersArea.innerHTML = ''; 
    nextButton.disabled = true;
    prevButton.disabled = (currentQuestionIndex === 0);

    // Буквы для вариантов ответов
    const answerLetters = ['А', 'Б', 'В', 'Г', 'Д'];
    
    // Перемешиваем ответы
    const shuffledAnswers = [...currentQ.answers];
    shuffleArray(shufferedAnswers);
    
    shuffledAnswers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.innerHTML = `
            <span class="answer-letter">${answerLetters[index]}</span>
            <span class="answer-text">${answer.text}</span>
        `;
        answerElement.dataset.answerText = answer.text;
        answerElement.dataset.isCorrect = answer.isCorrect;
        
        // Если уже есть ответ на этот вопрос
        const userAnswer = answerHistory[currentQuestionIndex];
        if (userAnswer && answer.text === userAnswer.userAnswer) {
            answerElement.classList.add('selected');
            if (userAnswer.isCorrect) {
                answerElement.classList.add('correct');
            } else {
                answerElement.classList.add('wrong');
            }
            
            // Показываем правильный ответ, если выбран неправильный
            if (!userAnswer.isCorrect && answer.isCorrect) {
                answerElement.classList.add('correct');
            }
        }
        
        answerElement.addEventListener('click', handleAnswerSelect);
        answersArea.appendChild(answerElement);
    });
    
    updateNavigationButtons();
    updateProgress();
    updateButtonStates();
}

// Обновляем функцию handleAnswerSelect:
function handleAnswerSelect(event) {
    const selectedElement = event.currentTarget;
    const selectedAnswerText = selectedElement.dataset.answerText;
    const isCorrect = selectedElement.dataset.isCorrect === 'true';
    
    // Снимаем выделение со всех вариантов
    Array.from(answersArea.children).forEach(option => {
        option.classList.remove('selected', 'correct', 'wrong');
        option.style.pointerEvents = 'none'; // Блокируем дальнейшие клики
    });
    
    // Выделяем выбранный вариант
    selectedElement.classList.add('selected');
    
    // Показываем правильность
    if (isCorrect) {
        selectedElement.classList.add('correct');
    } else {
        selectedElement.classList.add('wrong');
        
        // Подсвечиваем правильный ответ
        const correctOption = Array.from(answersArea.children)
            .find(option => option.dataset.isCorrect === 'true');
        if (correctOption) {
            correctOption.classList.add('correct');
        }
    }
    
    // Активируем кнопку "Следующий"
    nextButton.disabled = false;
    
    // Сохраняем в историю
    const currentQ = questions[currentQuestionIndex];
    answerHistory[currentQuestionIndex] = {
        id: currentQ.id,
        question: currentQ.question,
        userAnswer: selectedAnswerText,
        correctAnswer: currentQ.answers.find(a => a.isCorrect).text,
        isCorrect: isCorrect
    };
    
    updateNavigationButtons();
    updateProgress();
}
