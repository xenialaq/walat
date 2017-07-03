'use strict';

var Model = require('../models/models.js');

var DataSource = Model.DataSource;
var Asset = Model.Asset;

DataSource.sync();

var Errors = require('./Errors');

exports.assetsGET = function(args, res, next) {
  /**
   * Returns information about assets.
   *
   * returns List
   **/
  var ret = {};

  Asset.findAll().then(function(assets) {
    ret['application/json'] = assets.map((d) => d.get('id'));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, function(reason) {
    Errors.emitDbError(res, reason);
  });
}

exports.assetsIdDELETE = function(args, res, next) {
  /**
   * Deletes an asset.
   *
   * id Integer ID of asset
   * returns String
   **/
  Asset.destroy({
    where: {
      id: args.id.value
    }
  });
}

exports.assetsIdGET = function(args, res, next) {
  /**
   * Returns information about the asset of a specified ID.
   *
   * id Integer ID of asset
   * returns inline_response_200_3
   **/
  var ret = {};

  Asset.find({
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

exports.assetsPOST = function(args, res, next) {
  /**
   * Adds a new asset.
   *
   * body Body_7 Asset with default ID to be added
   * returns String
   **/
  Asset.create({
    name: args.body.value.name,
    path: args.body.value.path
  });
  res.end();
}

exports.assetsPUT = function(args, res, next) {
  /**
   * Edits an asset.
   *
   * body Body_6 Asset with given ID to be updated
   * returns String
   **/
  Asset.update({
    name: args.body.value.name,
    path: args.body.value.path
  }, {
    where: {
      id: args.body.value.id
    }
  });
  res.end();
}
