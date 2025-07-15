
import { useState, useEffect } from 'react';
import axios from 'axios';

function QuizList({ navigate, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/quizzes', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('Fetched quizzes:', response.data);
        setQuizzes(response.data);
        setError('');
      })
      .catch((err) => {
        setError('Failed to load quizzes. Please try again.');
        console.error('Error fetching quizzes:', err.message);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/quizzes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setQuizzes(quizzes.filter((quiz) => quiz._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete quiz. Please try again.');
      console.error('Error deleting quiz:', err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {error && <p className="text-red-500 col-span-full text-center">{error}</p>}
      {quizzes.length === 0 && !error && (
        <p className="text-gray-600 col-span-full text-center">No quizzes available. Create one!</p>
      )}
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 outline outline-1 outline-gray-200 animate-fade-in"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
          <p className="text-gray-600 mb-4">Questions: {quiz.questions.length}</p>
          <div className="flex gap-4 justify-center">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              onClick={() => navigate('/takeQuiz', quiz, [])}
            >
              Take Quiz
            </button>
            {user.role === 'admin' && (
              <>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/editQuiz/${quiz._id}`, quiz)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  onClick={() => handleDelete(quiz._id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizList;
