
const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  questions: [{
    text: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
