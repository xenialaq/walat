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
    ret['application/json'] = exercises.map((d) => ({
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "lesson": null2Undefined(d.get('lessonId'))
    }));
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
  var ret = {};

  Exercise.destroy({
    where: {
      id: args.id.value
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
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
      Errors.emitHttpError(res, { code: 404, message: 'Cannot find id.' });
      return;
    }
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "lesson": null2Undefined(d.get('lessonId'))
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
  var ret = {};

  Exercise.create({
    name: args.body.value.name,
    path: args.body.value.path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson
  }).then((d) => {
    ret['application/json'] = d.get('id');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

exports.exercisesPUT = function(args, res, next) {
  /**
   * Edits an exercise.
   *
   * body Body_2 Exercise with given ID to be updated
   * returns String
   **/
  var ret = {};

  Exercise.update({
    name: args.body.value.name,
    path: args.body.value.path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson
  }, {
    where: {
      id: args.body.value.id
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
}

exports.lessonsGET = function(args, res, next) {
  /**
   * Returns information about lessons.
   *
   * returns List
   **/
  var ret = {};

  Lesson.findAll().then(function(lessons) {
    ret['application/json'] = lessons.map((d) => ({
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description'))
    }));
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
  var ret = {};

  Lesson.destroy({
    where: {
      id: args.id.value
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
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
      Errors.emitHttpError(res, { code: 404, message: 'Cannot find id.' });
      return;
    }
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description'))
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
  var ret = {};

  Lesson.create({
    name: args.body.value.name,
    path: args.body.value.path
  }).then((d) => {
    ret['application/json'] = d.get('id');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

exports.lessonsPUT = function(args, res, next) {
  /**
   * Edits a lesson.
   *
   * body Body_4 Lesson with given ID to be updated
   * returns String
   **/
  var ret = {};

  Lesson.update({
    name: args.body.value.name,
    path: args.body.value.path
  }, {
    where: {
      id: args.body.value.id
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
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
    ret['application/json'] = questions.map((d) => ({
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "events_t": null2Undefined(d.get('events_t')),
      "events_options": null2Undefined(d.get('events_options')),
      "content_t": null2Undefined(d.get('content_t')),
      "content_options": null2Undefined(d.get('content_options')),
      "directions": null2Undefined(d.get('directions')),
      "notes": null2Undefined(d.get('notes')),
      "script": null2Undefined(d.get('script')),
      "exercise": null2Undefined(d.get('exerciseId'))
    }));
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
  var ret = {};

  Question.destroy({
    where: {
      id: args.id.value
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
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
      Errors.emitHttpError(res, { code: 404, message: 'Cannot find id.' });
      return;
    }
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "events_t": null2Undefined(d.get('events_t')),
      "events_options": null2Undefined(d.get('events_options')),
      "content_t": null2Undefined(d.get('content_t')),
      "content_options": null2Undefined(d.get('content_options')),
      "directions": null2Undefined(d.get('directions')),
      "notes": null2Undefined(d.get('notes')),
      "script": null2Undefined(d.get('script')),
      "exercise": null2Undefined(d.get('exerciseId'))
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
  var ret = {};

  Question.create({
    name: args.body.value.name,
    path: args.body.value.path,
    description: args.body.value.description,
    events_t: args.body.value.events_t,
    events_options: args.body.value.events_options,
    content_t: args.body.value.content_t,
    content_options: args.body.value.content_options,
    directions: args.body.value.directions,
    notes: args.body.value.notes,
    script: args.body.value.script,
    exerciseId: args.body.value.exercise
  }).then((d) => {
    ret['application/json'] = d.get('id');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

exports.questionsPUT = function(args, res, next) {
  /**
   * Edits a question.
   *
   * body Body Question with given ID to be updated
   * returns String
   **/
  var ret = {};

  Question.update({
    name: args.body.value.name,
    path: args.body.value.path,
    description: args.body.value.description,
    events_t: args.body.value.events_t,
    events_options: args.body.value.events_options,
    content_t: args.body.value.content_t,
    content_options: args.body.value.content_options,
    directions: args.body.value.directions,
    notes: args.body.value.notes,
    script: args.body.value.script,
    exerciseId: args.body.value.exercise
  }, {
    where: {
      id: args.body.value.id
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
}

let null2Undefined = function(v) {
  if (v === null) {
    return undefined;
  }
  return v;
}
