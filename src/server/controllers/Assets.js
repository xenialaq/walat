const Assets = require('./AssetsService');

module.exports.assetsGET = function assetsGET(req, res, next) {
  Assets.assetsGET(req.swagger.params, res, next);
};

module.exports.assetsIdDELETE = function assetsIdDELETE(req, res, next) {
  Assets.assetsIdDELETE(req.swagger.params, res, next);
};

module.exports.assetsIdGET = function assetsIdGET(req, res, next) {
  Assets.assetsIdGET(req.swagger.params, res, next);
};

module.exports.assetsPOST = function assetsPOST(req, res, next) {
  Assets.assetsPOST(req.swagger.params, res, next);
};

module.exports.assetsPUT = function assetsPUT(req, res, next) {
  Assets.assetsPUT(req.swagger.params, res, next);
};
