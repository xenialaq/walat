/* eslint-disable */

const path = require('path');

const dbPath = path.join(
  __dirname,
  '..', '..', '..', 'dist', 'assets',
  'db.sqlite'
);

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

const Page = sequelize.define('page', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  description: Sequelize.TEXT('medium'),
  fields: Sequelize.TEXT('long'),
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

const Template = sequelize.define('template', {
  name: Sequelize.STRING,
  content: Sequelize.TEXT('script'),
  description: Sequelize.TEXT('medium')
});

Exercise.hasMany(Page);
Lesson.hasMany(Exercise);

exports.DataSource = sequelize;
exports.Page = Page;
exports.Exercise = Exercise;
exports.Lesson = Lesson;
exports.Asset = Asset;
exports.Template = Template;
