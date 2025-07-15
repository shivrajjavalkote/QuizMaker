
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Log environment variables for debugging
console.log('MONGO_URI:', process.env.MONGO_URI || 'undefined');

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  console.log('GET / requested');
  res.status(200).send('Server is running');
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Seed Admin User
async function seedAdmin() {
  const adminExists = await User.findOne({ username: 'shivraj' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({ username: 'shivraj', password: hashedPassword, role: 'admin' });
    console.log('Admin user created: shivraj / Admin@123');
  }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('POST /api/auth/register requested:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: 'user' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Error in POST /api/auth/register:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('POST /api/auth/login requested:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error in POST /api/auth/login:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Quiz Routes
app.get('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/quizzes requested');
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    console.error('Error in GET /api/quizzes:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/quizzes/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`GET /api/quizzes/${req.params.id} requested`);
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      console.log(`Quiz ${req.params.id} not found`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error(`Error in GET /api/quizzes/${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/quizzes requested:', req.body);
    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      console.log('Invalid quiz data:', req.body);
      return res.status(400).json({ error: 'Title and questions required' });
    }
    const quiz = new Quiz({ title, questions });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Error in POST /api/quizzes:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/quizzes/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log(`PUT /api/quizzes/${req.params.id} requested:`, req.body);
    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      console.log('Invalid quiz data:', req.body);
      return res.status(400).json({ error: 'Title and questions required' });
    }
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, { title, questions }, { new: true });
    if (!quiz) {
      console.log(`Quiz ${req.params.id} not found`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error(`Error in PUT /api/quizzes/${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/quizzes/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log(`DELETE /api/quizzes/${req.params.id} requested`);
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      console.log(`Quiz ${req.params.id} not found`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error(`Error in DELETE /api/quizzes/${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_quiz_platform';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    await seedAdmin();
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });