
function Home({ navigate }) {
  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-xl outline outline-1 outline-gray-200 max-w-2xl mx-auto text-center animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Quiz Maker</h1>
      <p className="text-gray-600 mb-6">Create, take, and share quizzes with ease!</p>
      <div className="flex gap-4 justify-center">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate('quizList')}
        >
          View Quizzes
        </button>
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate('createQuiz')}
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
}

export default Home;
