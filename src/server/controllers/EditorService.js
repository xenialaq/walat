'use strict';

var Model = require('../models/models.js');

var DataSource = Model.DataSource;
var Question = Model.Question;
var Exercise = Model.Exercise;
var Lesson = Model.Lesson;

DataSource.sync();

var Errors = require('./Errors');

exports.exercisesGET = function(args, res, next) {
  /**
   * Returns information about exercises at a given lesson.
   *
   * lesson_id Integer Lesson to list exercises
   * returns List
   **/
  var ret = {};

  Exercise.findAll({
    where: {
      lessonId: args.lesson_id.value
    }
  }).then(function(exercises) {
    ret['application/json'] = exercises.map((d) => d.get('id'));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.exercisesIdDELETE = function(args, res, next) {
  /**
   * Deletes an exercise.
   *
   * id Integer ID of exercise
   * returns String
   **/
  Exercise.destroy({
    where: {
      id: args.id.value
    }
  });
}

exports.exercisesIdGET = function(args, res, next) {
  /**
   * Returns information about the exercise of a specified ID.
   *
   * id Integer ID of exercise
   * returns inline_response_200_1
   **/
  var ret = {};

  Exercise.find({
    where: {
      id: args.id.value
    }
  }).then(function(d) {
    if (d === null) {
      Errors.emitHttpError(404, res, 'Cannot find id.');
      return;
    }
    ret['application/json'] = {
      "id": d.get('id'),
      "name": d.get('name'),
      "path": d.get('path'),
      "lesson": d.get('lessonId')
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.exercisesPOST = function(args, res, next) {
  /**
   * Adds a new exercise to a given lesson.
   *
   * body Body_3 Exercise with default ID to be added
   * returns String
   **/
  Exercise.create({
    name: args.body.value.name,
    path: args.body.value.path,
    lessonId: args.body.value.lesson
  });
  res.end();
}

exports.exercisesPUT = function(args, res, next) {
  /**
   * Edits an exercise.
   *
   * body Body_2 Exercise with given ID to be updated
   * returns String
   **/
  Exercise.update({
    name: args.body.value.name,
    path: args.body.value.path,
    lessonId: args.body.value.lesson
  }, {
    where: {
      id: args.body.value.id
    }
  });
  res.end();
}

exports.lessonsGET = function(args, res, next) {
  /**
   * Returns information about lessons.
   *
   * returns List
   **/
  var ret = {};

  Lesson.findAll().then(function(lessons) {
    ret['application/json'] = lessons.map((d) => d.get('id'));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.lessonsIdDELETE = function(args, res, next) {
  /**
   * Deletes a lesson.
   *
   * id Integer ID of lesson
   * returns String
   **/
  Lesson.destroy({
    where: {
      id: args.id.value
    }
  });
}

exports.lessonsIdGET = function(args, res, next) {
  /**
   * Returns information about the lesson of a specified ID.
   *
   * id Integer ID of lesson
   * returns inline_response_200_2
   **/
  var ret = {};

  Lesson.find({
    where: {
      id: args.id.value
    }
  }).then(function(d) {
    if (d === null) {
      Errors.emitHttpError(404, res, 'Cannot find id.');
      return;
    }
    ret['application/json'] = {
      "id": d.get('id'),
      "name": d.get('name'),
      "path": d.get('path')
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.lessonsPOST = function(args, res, next) {
  /**
   * Adds a new lesson.
   *
   * body Body_5 Lesson with default ID to be added
   * returns String
   **/
  Lesson.create({
    name: args.body.value.name,
    path: args.body.value.path
  });
  res.end();
}

exports.lessonsPUT = function(args, res, next) {
  /**
   * Edits a lesson.
   *
   * body Body_4 Lesson with given ID to be updated
   * returns String
   **/
  Lesson.update({
    name: args.body.value.name,
    path: args.body.value.path
  }, {
    where: {
      id: args.body.value.id
    }
  });
  res.end();
}

exports.questionsGET = function(args, res, next) {
  /**
   * Returns information about questions at a given exercise.
   *
   * exercise_id Integer Exercise to list questions
   * returns List
   **/
  var ret = {};

  Question.findAll({
    where: {
      exerciseId: args.exercise_id.value
    }
  }).then(function(questions) {
    ret['application/json'] = questions.map((d) => d.get('id'));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.questionsIdDELETE = function(args, res, next) {
  /**
   * Deletes a question.
   *
   * id Integer ID of question
   * returns String
   **/
  Question.destroy({
    where: {
      id: args.id.value
    }
  });
}

exports.questionsIdGET = function(args, res, next) {
  /**
   * Returns information about the question of a specified ID.
   *
   * id Integer ID of question
   * returns inline_response_200
   **/
  var ret = {};

  Question.find({
    where: {
      id: args.id.value
    }
  }).then(function(d) {
    if (d === null) {
      Errors.emitHttpError(404, res, 'Cannot find id.');
      return;
    }
    ret['application/json'] = {
      "id": d.get('id'),
      "name": d.get('name'),
      "path": d.get('path'),
      "exercise": d.get('exerciseId')
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.questionsPOST = function(args, res, next) {
  /**
   * Adds a new question to a given exercise.
   *
   * body Body_1 Question with default ID to be added
   * returns String
   **/
  Question.create({
    name: args.body.value.name,
    path: args.body.value.path,
    exerciseId: args.body.value.exercise
  });
  res.end();
}

exports.questionsPUT = function(args, res, next) {
  /**
   * Edits a question.
   *
   * body Body Question with given ID to be updated
   * returns String
   **/
  Question.update({
    name: args.body.value.name,
    path: args.body.value.path,
    exerciseId: args.body.value.exercise
  }, {
    where: {
      id: args.body.value.id
    }
  });
  res.end();
}
