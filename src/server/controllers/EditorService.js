'use strict';

var Model = require('../models/models.js');

var DataSource = Model.DataSource;
var Page = Model.Page;
var Exercise = Model.Exercise;
var Lesson = Model.Lesson;

const _ = require('lodash');
const rstr = require("randomstring");

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
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson
  }).then((d) => {
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "lesson": null2Undefined(d.get('lessonId'))
    };
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
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson
  }, {
    where: {
      id: args.body.value.id
    }
  }).then((rows) => {
    let d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, { code: 400, message: 'Cannot update exercise.' });
      return;
    }

    args.id = {
      value: args.body.value.id
    };
    this.exercisesIdGET(args, res, next);
  });
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
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
  }).then((d) => {
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description'))
    };
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
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description
  }, {
    where: {
      id: args.body.value.id
    }
  }).then((rows) => {
    let d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, { code: 400, message: 'Cannot update lesson.' });
      return;
    }

    args.id = {
      value: args.body.value.id
    };
    this.lessonsIdGET(args, res, next);
  });
}

exports.pagesGET = function(args, res, next) {
  /**
   * Returns information about pages at a given exercise.
   *
   * exercise_id Integer Exercise to list pages
   * returns List
   **/
  var ret = {};

  Page.findAll({
    where: {
      exerciseId: args.exercise_id.value
    }
  }).then(function(pages) {
    ret['application/json'] = pages.map((d) => ({
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "fields": JSON.parse(d.get('fields')),
      "script": null2Undefined(d.get('script')),
      "exercise": null2Undefined(d.get('exerciseId'))
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.pagesIdDELETE = function(args, res, next) {
  /**
   * Deletes a page.
   *
   * id Integer ID of page
   * returns String
   **/
  var ret = {};

  Page.destroy({
    where: {
      id: args.id.value
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
}

exports.pagesIdGET = function(args, res, next) {
  /**
   * Returns information about the page of a specified ID.
   *
   * id Integer ID of page
   * returns inline_response_200
   **/
  var ret = {};

  Page.find({
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
      "fields": JSON.parse(d.get('fields')),
      "script": null2Undefined(d.get('script')),
      "exercise": null2Undefined(d.get('exerciseId'))
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.pagesPOST = function(args, res, next) {
  /**
   * Adds a new page to a given exercise.
   *
   * body Body_1 Page with default ID to be added
   * returns String
   **/
  var ret = {};

  Page.create({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    fields: args.body.value.fields || '{}',
    script: args.body.value.script,
    exerciseId: args.body.value.exercise
  }).then((d) => {
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "description": null2Undefined(d.get('description')),
      "fields": JSON.parse(d.get('fields')),
      "script": null2Undefined(d.get('script')),
      "exercise": null2Undefined(d.get('exerciseId'))
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

exports.pagesPUT = function(args, res, next) {
  /**
   * Edits a page.
   *
   * body Body Page with given ID to be updated
   * returns String
   **/
  var ret = {};

  Page.update({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    fields: args.body.value.fields,
    script: args.body.value.script,
    exerciseId: args.body.value.exercise
  }, {
    where: {
      id: args.body.value.id
    }
  }).then((rows) => {
    let d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, { code: 400, message: 'Cannot update page.' });
      return;
    }

    args.id = {
      value: args.body.value.id
    };
    this.pagesIdGET(args, res, next);
  });
}

let null2Undefined = function(v) {
  if (v === null) {
    return undefined;
  }
  return v;
}
