const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Quiz schema
const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model('Quiz', QuizSchema);

// Pre-populate database with default quizzes
async function seedDatabase() {
  const count = await Quiz.countDocuments();
  if (count === 0) {
    const defaultQuizzes = [
      {
        title: "General Knowledge Trivia",
        questions: [
          {
            text: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Madrid"],
            correctAnswer: "Paris"
          },
          {
            text: "Which planet is known as the Red Planet?",
            options: ["Mars", "Jupiter", "Venus", "Mercury"],
            correctAnswer: "Mars"
          }
        ]
      },
      {
        title: "Basic Math Quiz",
        questions: [
          {
            text: "What is 5 + 7?",
            options: ["10", "11", "12", "13"],
            correctAnswer: "12"
          },
          {
            text: "What is the square root of 16?",
            options: ["2", "4", "6", "8"],
            correctAnswer: "4"
          }
        ]
      },
      {
        title: "Science Basics",
        questions: [
          {
            text: "What gas do plants absorb from the atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
            correctAnswer: "Carbon Dioxide"
          },
          {
            text: "What is the chemical symbol for water?",
            options: ["H2O", "CO2", "O2", "N2"],
            correctAnswer: "H2O"
          }
        ]
      }
    ];
    await Quiz.insertMany(defaultQuizzes);
    console.log('Default quizzes inserted');
  }
}

// API endpoints
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.post('/api/quizzes', async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }
    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        return res.status(400).json({ error: 'Invalid question format' });
      }
    }
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create quiz' });
  }
});

app.put('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update quiz' });
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
