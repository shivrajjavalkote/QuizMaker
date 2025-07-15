
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import QuizList from './components/QuizList';
import CreateQuiz from './components/CreateQuiz';
import TakeQuiz from './components/TakeQuiz';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, username: payload.username, role: payload.role });
      } catch (err) {
        console.error('Invalid token:', err.message);
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleNavigate = (path, quiz = null, answers = []) => {
    console.log('Navigating to:', path, 'with quiz:', quiz, 'answers:', answers);
    setCurrentQuiz(quiz);
    setUserAnswers(answers);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentQuiz(null);
    setUserAnswers([]);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-blue-800 bg-opacity-80 backdrop-blur-sm p-4 flex justify-between items-center shadow-lg z-10 animate-slide-down">
        <h1 className="text-2xl font-bold text-white">Quiz Maker</h1>
        <nav className="flex gap-4">
          {user ? (
            <>
              <span className="text-white">{user.username} ({user.role})</span>
              <button
                className="text-white hover:text-blue-200 transition-transform duration-300 hover:scale-110"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="text-white hover:text-blue-200 transition-transform duration-300 hover:scale-110"
                onClick={() => handleNavigate('/login')}
              >
                Login
              </button>
              <button
                className="text-white hover:text-blue-200 transition-transform duration-300 hover:scale-110"
                onClick={() => handleNavigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="container max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/home" /> : <Register setUser={setUser} />} />
            <Route
              path="/home"
              element={user ? <Home navigate={handleNavigate} /> : <Navigate to="/login" />}
            />
            <Route
              path="/quizList"
              element={user ? <QuizList navigate={handleNavigate} user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/createQuiz"
              element={user ? <CreateQuiz navigate={handleNavigate} editingQuizId={null} user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/editQuiz/:id"
              element={user ? <CreateQuiz navigate={handleNavigate} editingQuizId={null} user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/takeQuiz"
              element={user ? <TakeQuiz navigate={handleNavigate} quiz={currentQuiz} userAnswers={userAnswers} /> : <Navigate to="/login" />}
            />
            <Route
              path="/results"
              element={user ? <Results navigate={handleNavigate} quiz={currentQuiz} userAnswers={userAnswers} /> : <Navigate to="/login" />}
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </main>
      <footer className="bg-blue-800 bg-opacity-80 backdrop-blur-sm p-4 text-center text-white shadow-inner animate-slide-up">
        <p>© 2025 <b>Shivraj</b>. All rights reserved. | <a href="mailto:support@quizmaker.com" className="hover:text-blue-200 transition-colors">Contact Us <b>javalkoteshivraj@gmail.com</b></a></p>
      </footer>
    </div>
  );
}

export default App;
