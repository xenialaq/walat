'use strict';

module.exports.emitDbError = function emitDbError(res, err) {
  res.end(err ? err.message : "Error");
};

module.exports.emitHttpError = function emitHttpError(code, res, err) {
  res.status(code).end(err ? err.message : "Error");
};
