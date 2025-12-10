function showResults() {
    let score = 0;
    // Убрана внешняя стилизация, чтобы отчет выглядел чище
    let reportHTML = '<div style="text-align:left; max-height: 300px; overflow-y: auto; padding: 10px;">';
    const totalQuestions = currentQuestions.length;

    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isAnswered = userAnswer !== null; // Проверяем, был ли дан ответ
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) score++;

        let feedbackText = '';
        let resultClass = 'result-item';
        let answerText = isAnswered ? q.answers[userAnswer] : 'Нет ответа';
        
        if (isCorrect) {
            feedbackText = '✅';
            resultClass += ' correct';
        } else if (isAnswered && !isCorrect) {
            // Пользователь ответил, но ошибся - показываем правильный ответ
            feedbackText = `❌ (Правильно: ${q.answers[q.correct]})`;
            resultClass += ' wrong';
        } else {
            // Пользователь не ответил - не показываем правильный ответ
            feedbackText = '— Пропущен';
            resultClass += ' skipped';
        }

        reportHTML += `
            <div class="${resultClass}" style="margin-bottom: 10px; padding: 10px; background: #f9f9f9; border: 1px solid #eee; border-left: 5px solid ${isCorrect ? '#27ae60' : (isAnswered ? '#c0392b' : '#bdc3c7')};">
                <strong>${index + 1}. ${q.question}</strong><br>
                Ваш ответ: <span style="font-weight: 500;">${answerText}</span> 
                <span style="float: right; color: ${isCorrect ? 'green' : (isAnswered ? 'red' : 'gray')};">${feedbackText}</span>
            </div>
        `;
    });
    reportHTML += '</div>';
    
    // Расчет процентов
    let percentage = 0;
    if (totalQuestions > 0) {
        percentage = ((score / totalQuestions) * 100).toFixed(0);
        scoreDisplay.textContent = `${score} из ${totalQuestions} (${percentage}%)`;
    } else {
        scoreDisplay.textContent = `0 из 0`;
    }

    reportContainer.innerHTML = reportHTML;

    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';
}

// *** ОСТАЛЬНАЯ ЧАСТЬ КОДА script.js ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ ***
