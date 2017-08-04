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

module.exports.pagesGET = function pagesGET(req, res, next) {
  Editor.pagesGET(req.swagger.params, res, next);
};

module.exports.pagesIdDELETE = function pagesIdDELETE(req, res, next) {
  Editor.pagesIdDELETE(req.swagger.params, res, next);
};

module.exports.pagesIdGET = function pagesIdGET(req, res, next) {
  Editor.pagesIdGET(req.swagger.params, res, next);
};

module.exports.pagesPOST = function pagesPOST(req, res, next) {
  Editor.pagesPOST(req.swagger.params, res, next);
};

module.exports.pagesPUT = function pagesPUT(req, res, next) {
  Editor.pagesPUT(req.swagger.params, res, next);
};
