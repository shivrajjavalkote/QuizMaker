
import { useState, useEffect } from 'react';
import axios from 'axios';

function CreateQuiz({ navigate, editingQuizId, user }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log state and props
  console.log('CreateQuiz render - editingQuizId:', editingQuizId, 'title:', title, 'questions:', questions, 'user:', user);

  useEffect(() => {
    if (!editingQuizId) {
      setTitle('');
      setQuestions([]);
      setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '' });
      setError('');
      setIsLoading(false);
      return;
    }

    if (user.role !== 'admin') {
      setError('Only admins can edit quizzes.');
      navigate('/quizList');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`/api/quizzes/${editingQuizId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const data = response.data;
        console.log('Fetched quiz:', data);
        if (!data || !data.title || !data.questions || !Array.isArray(data.questions)) {
          setError('Invalid quiz data received. Using empty quiz.');
          setTitle('');
          setQuestions([]);
          setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '' });
          setIsLoading(false);
          return;
        }
        setTitle(data.title || '');
        setQuestions(data.questions || []);
        setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '' });
        setError('');
        setIsLoading(false);
      })
      .catch((err) => {
        setError('Failed to load quiz. Please check your connection or try again.');
        console.error('Error fetching quiz:', err.message, err.response?.data);
        setQuestions([]);
        setTitle('');
        setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '' });
        setIsLoading(false);
      });
  }, [editingQuizId, user, navigate]);

  const handleAddQuestion = () => {
    const { text, options, correctAnswer } = newQuestion;
    if (!text.trim() || !options.every((opt) => opt.trim()) || !correctAnswer.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!options.includes(correctAnswer)) {
      setError('Correct answer must be one of the options.');
      return;
    }
    console.log('Adding question:', newQuestion);
    setQuestions([...questions, { text, options, correctAnswer }]);
    setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '' });
    setError('');
    alert('Question added!');
  };

  const handleSubmit = async () => {
    console.log('Submitting - title:', title, 'questions:', questions);
    if (!title.trim() || !Array.isArray(questions) || questions.length === 0) {
      setError('Please provide a title and at least one question.');
      console.error('Invalid data on submit - title:', title, 'questions:', questions);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = { title, questions };
      const url = editingQuizId ? `/api/quizzes/${editingQuizId}` : '/api/quizzes';
      const method = editingQuizId ? 'put' : 'post';
      const response = await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Quiz saved:', response.data);
      navigate('/quizList');
      setError('');
    } catch (err) {
      setError('Failed to save quiz. Please ensure the backend is running.');
      console.error('Error saving quiz:', err.message, err.response?.data);
    }
  };

  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-xl outline outline-1 outline-gray-200 w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingQuizId ? 'Edit Quiz' : 'Create Quiz'}</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {isLoading && <p className="text-gray-500 mb-4 text-center">Loading quiz...</p>}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="quizTitle">Quiz Title</label>
        <input
          id="quizTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
          placeholder="Enter quiz title"
          aria-required="true"
          disabled={isLoading}
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Question</h3>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="questionText">Question Text</label>
        <input
          id="questionText"
          type="text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
          placeholder="Enter question text"
          aria-required="true"
          disabled={isLoading}
        />
      </div>
      {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((label, i) => (
        <div key={i} className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`option${i}`}>{label}</label>
          <input
            id={`option${i}`}
            type="text"
            value={newQuestion.options[i]}
            onChange={(e) => {
              const newOptions = [...newQuestion.options];
              newOptions[i] = e.target.value;
              setNewQuestion({ ...newQuestion, options: newOptions });
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
            placeholder={`Enter option ${i + 1}`}
            aria-required="true"
            disabled={isLoading}
          />
        </div>
      ))}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="correctAnswer">Correct Answer</label>
        <input
          id="correctAnswer"
          type="text"
          value={newQuestion.correctAnswer}
          onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
          placeholder="Enter correct answer"
          aria-required="true"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddQuestion}
          disabled={isLoading}
        >
          Add Question
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !questions.length}
        >
          Submit Quiz
        </button>
        <button
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => navigate('/quizList')}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CreateQuiz;
