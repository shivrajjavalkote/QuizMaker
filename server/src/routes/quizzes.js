
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title _id');
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !Array.isArray(quiz.questions)) {
      return res.status(404).json({ error: 'Quiz not found or invalid' });
    }
    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question required' });
    }
    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        return res.status(400).json({ error: 'Invalid question format' });
      }
    }
    const quiz = new Quiz({ title, questions });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(400).json({ error: 'Failed to create quiz' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question required' });
    }
    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        return res.status(400).json({ error: 'Invalid question format' });
      }
    }
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, { title, questions }, { new: true });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(400).json({ error: 'Failed to update quiz' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

module.exports = router;
