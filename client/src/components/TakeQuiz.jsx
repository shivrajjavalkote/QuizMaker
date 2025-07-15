
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function TakeQuiz({ navigate, quiz, userAnswers = [] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState(userAnswers);
  const [localQuiz, setLocalQuiz] = useState(quiz);
  const [error, setError] = useState('');
  const { id } = useParams(); // Get quiz ID from route if available

  // Debug: Log props and params
  console.log('TakeQuiz render - quiz:', quiz, 'userAnswers:', userAnswers, 'quizId:', id);

  // Fetch quiz if prop is invalid
  useEffect(() => {
    if (!quiz || !quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      if (id) {
        const token = localStorage.getItem('token');
        axios.get(`/api/quizzes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          .then((response) => {
            console.log('Fetched quiz:', response.data);
            setLocalQuiz(response.data);
            setError('');
          })
          .catch((err) => {
            console.error('Error fetching quiz:', err.message);
            setError('Failed to load quiz. Please try again.');
          });
      } else {
        console.error('Invalid quiz data and no quiz ID provided:', quiz);
        setError('Quiz not found or invalid. Please select a valid quiz.');
      }
    } else {
      setLocalQuiz(quiz);
      setError('');
    }
  }, [quiz, id]);

  // Use localQuiz for rendering
  if (error || !localQuiz || !localQuiz.title || !Array.isArray(localQuiz.questions) || localQuiz.questions.length === 0) {
    return (
      <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-xl outline outline-1 outline-gray-200 max-w-2xl mx-auto text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Error</h2>
        <p className="text-red-500 mb-4">{error || 'Quiz not found or invalid. Please select a valid quiz.'}</p>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate('/quizList')}
        >
          Back to Quiz List
        </button>
      </div>
    );
  }

  const currentQuestion = localQuiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    console.log('Selected answer:', answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      alert('Please select an answer before proceeding.');
      console.log('No answer selected');
      return;
    }
    const newAnswer = { question: currentQuestion.text, selectedAnswer, correctAnswer: currentQuestion.correctAnswer };
    console.log('Adding answer:', newAnswer);
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedAnswer('');
    if (currentQuestionIndex < localQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log('Navigating to results with quiz:', localQuiz, 'answers:', updatedAnswers);
      navigate('/results', localQuiz, updatedAnswers);
    }
  };

  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-xl outline outline-1 outline-gray-200 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{localQuiz.title}</h2>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Question {currentQuestionIndex + 1} of {localQuiz.questions.length}: {currentQuestion.text}
      </h3>
      <div className="flex flex-col gap-4 mb-6">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`p-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-blue-100 hover:border-blue-500 transition-all duration-300 ${
              selectedAnswer === option ? 'bg-blue-200 border-blue-500' : ''
            }`}
            onClick={() => handleAnswerSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {currentQuestionIndex < localQuiz.questions.length - 1 ? 'Next' : 'Submit'}
        </button>
        <button
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate('/quizList')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TakeQuiz;
