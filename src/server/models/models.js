'use strict';

const path = require('path');

const dbPath = path.join(__dirname, '../../../dist/assets/db.sqlite');

const Sequelize = require('sequelize');

const sequelize = new Sequelize('', '', '', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: dbPath
});

const Question = sequelize.define('question', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  description: Sequelize.TEXT('medium'),
  events_t: Sequelize.STRING,
  events_options: Sequelize.TEXT('medium'),
  content_t: Sequelize.STRING,
  content_options: Sequelize.TEXT('medium'),
  directions: Sequelize.TEXT('medium'),
  notes: Sequelize.TEXT('medium'),
  script: Sequelize.TEXT('long')
});

const Exercise = sequelize.define('exercise', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  description: Sequelize.TEXT('medium')
});


const Lesson = sequelize.define('lesson', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  description: Sequelize.TEXT('medium')
});



const Asset = sequelize.define('asset', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  type: Sequelize.STRING,
  attribute: Sequelize.TEXT('medium')
});

Exercise.hasMany(Question);
Lesson.hasMany(Exercise);

exports.DataSource = sequelize;
exports.Question = Question;
exports.Exercise = Exercise;
exports.Lesson = Lesson;
exports.Asset = Asset;
