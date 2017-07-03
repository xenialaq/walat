'use strict';

var url = require('url');

var Editor = require('./EditorService');

module.exports.exercisesGET = function exercisesGET(req, res, next) {
  Editor.exercisesGET(req.swagger.params, res, next);
};

module.exports.exercisesIdDELETE = function exercisesIdDELETE(req, res, next) {
  Editor.exercisesIdDELETE(req.swagger.params, res, next);
};

module.exports.exercisesIdGET = function exercisesIdGET(req, res, next) {
  Editor.exercisesIdGET(req.swagger.params, res, next);
};

module.exports.exercisesPOST = function exercisesPOST(req, res, next) {
  Editor.exercisesPOST(req.swagger.params, res, next);
};

module.exports.exercisesPUT = function exercisesPUT(req, res, next) {
  Editor.exercisesPUT(req.swagger.params, res, next);
};

module.exports.lessonsGET = function lessonsGET(req, res, next) {
  Editor.lessonsGET(req.swagger.params, res, next);
};

module.exports.lessonsIdDELETE = function lessonsIdDELETE(req, res, next) {
  Editor.lessonsIdDELETE(req.swagger.params, res, next);
};

module.exports.lessonsIdGET = function lessonsIdGET(req, res, next) {
  Editor.lessonsIdGET(req.swagger.params, res, next);
};

module.exports.lessonsPOST = function lessonsPOST(req, res, next) {
  Editor.lessonsPOST(req.swagger.params, res, next);
};

module.exports.lessonsPUT = function lessonsPUT(req, res, next) {
  Editor.lessonsPUT(req.swagger.params, res, next);
};

module.exports.questionsGET = function questionsGET(req, res, next) {
  Editor.questionsGET(req.swagger.params, res, next);
};

module.exports.questionsIdDELETE = function questionsIdDELETE(req, res, next) {
  Editor.questionsIdDELETE(req.swagger.params, res, next);
};

module.exports.questionsIdGET = function questionsIdGET(req, res, next) {
  Editor.questionsIdGET(req.swagger.params, res, next);
};

module.exports.questionsPOST = function questionsPOST(req, res, next) {
  Editor.questionsPOST(req.swagger.params, res, next);
};

module.exports.questionsPUT = function questionsPUT(req, res, next) {
  Editor.questionsPUT(req.swagger.params, res, next);
};
