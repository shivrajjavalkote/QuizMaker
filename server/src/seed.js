
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');

async function seedDatabase() {
  try {
    const count = await Quiz.countDocuments();
    if (count === 0) {
      await Quiz.insertMany([
        {
          title: 'General Knowledge Trivia',
          questions: [
            {
              text: 'What is the capital of France?',
              options: ['Paris', 'London', 'Berlin', 'Madrid'],
              correctAnswer: 'Paris'
            },
            {
              text: 'Which planet is known as the Red Planet?',
              options: ['Mars', 'Jupiter', 'Venus', 'Mercury'],
              correctAnswer: 'Mars'
            }
          ]
        },
        {
          title: 'Basic Math Quiz',
          questions: [
            {
              text: 'What is 5 + 7?',
              options: ['10', '11', '12', '13'],
              correctAnswer: '12'
            },
            {
              text: 'What is the square root of 16?',
              options: ['2', '4', '6', '8'],
              correctAnswer: '4'
            }
          ]
        },
        {
          title: 'Science Basics',
          questions: [
            {
              text: 'What gas do plants absorb from the atmosphere?',
              options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'],
              correctAnswer: 'Carbon Dioxide'
            },
            {
              text: 'What is the chemical symbol for water?',
              options: ['H2O', 'CO2', 'O2', 'N2'],
              correctAnswer: 'H2O'
            }
          ]
        }
      ]);
      console.log('Database seeded with default quizzes');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

module.exports = seedDatabase;