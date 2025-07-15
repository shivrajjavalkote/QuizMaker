
function Results({ navigate, quiz, userAnswers = [] }) {
  console.log('Results render - quiz:', quiz, 'userAnswers:', userAnswers);

  if (!quiz || !quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="quiz-card">
        <h2 className="text-2xl font-bold mb-6">Error</h2>
        <p className="error-message mb-4">Quiz not found or invalid. Please select a valid quiz.</p>
        <button
          className="quiz-button"
          onClick={() => navigate('/quizList')}
        >
          Back to Quiz List
        </button>
      </div>
    );
  }

  const score = userAnswers.reduce((acc, answer) => {
    return answer.selectedAnswer && answer.selectedAnswer === answer.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="quiz-card">
      <h2 className="text-2xl font-bold mb-6">{quiz.title} - Results</h2>
      <p className="text-xl font-semibold mb-4">
        Your Score: {score} / {quiz.questions.length}
      </p>
      <div className="flex flex-col gap-4 mb-6">
        {userAnswers.map((answer, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4">
            <p className="text-gray-800 font-medium">Question {index + 1}: {answer.question}</p>
            <p className={`text-gray-600 ${answer.selectedAnswer ? '' : 'text-red-500'}`}>
              Your Answer: {answer.selectedAnswer || 'Not answered'}
            </p>
            <p className="text-gray-600">
              Correct Answer: {answer.correctAnswer}
            </p>
            <p className={answer.selectedAnswer === answer.correctAnswer ? 'text-green-500' : 'text-red-500'}>
              {answer.selectedAnswer === answer.correctAnswer ? 'Correct' : 'Incorrect'}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          className="quiz-button"
          onClick={() => navigate('/quizList')}
        >
          Back to Quiz List
        </button>
      </div>
    </div>
  );
}

export default Results;
