module.exports.emitDbError = function emitDbError(res, err) {
  res.end(err ? err.message : 'Error');
};

module.exports.emitHttpError = function emitHttpError(res, err) {
  res.status(err.code || 400);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    code: err ? err.code : 400,
    message: err ? err.message : 'Error',
  }));
};
