
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, username: payload.username, role: payload.role });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Registration error:', err.message);
    }
  };

  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-xl outline outline-1 outline-gray-200 max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
            placeholder="Enter username"
            aria-required="true"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 bg-opacity-50 bg-white hover:bg-opacity-70 transition-all duration-300"
            placeholder="Enter password"
            aria-required="true"
          />
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          onClick={handleSubmit}
        >
          Register
        </button>
        <button
          className="text-blue-500 hover:text-blue-700 transition-colors"
          onClick={() => navigate('/login')}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

export default Register;
