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
  Asset.findAll({
    where: {
      name: {
        $like: `${args.name.value ? args.name.value : ''}%`
      },
      path: {
        $like: `${args.path.value ? args.path.value : ''}%`
      }
    }
  }).then(function(assets) {
    ret['application/json'] = assets.map((d) => ({
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "type": null2Undefined(d.get('type')),
      "attribute": JSON.parse(d.get('attribute'))
    }));
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
  var ret = {};

  Asset.destroy({
    where: {
      id: args.id.value
    }
  });

  ret['application/json'] = { "code": 200 };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
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
      Errors.emitHttpError(res, { code: 404, message: 'Cannot find id.' });
      return;
    }
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "type": null2Undefined(d.get('type')),
      "attribute": JSON.parse(d.get('attribute'))
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
  var ret = {};

  Asset.create({
    name: args.body.value.name,
    path: args.body.value.path,
    type: args.body.value.type,
    attribute: JSON.stringify(args.body.value.attribute)
  }).then((d) => {
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "type": null2Undefined(d.get('type')),
      "attribute": JSON.parse(d.get('attribute'))
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

exports.assetsPUT = function(args, res, next) {
  /**
   * Edits an asset.
   *
   * body Body_6 Asset with given ID to be updated
   * returns String
   **/
  var ret = {};

  Asset.update({
    name: args.body.value.name,
    path: args.body.value.path,
    type: args.body.value.type,
    attribute: JSON.stringify(args.body.value.attribute)
  }, {
    where: {
      id: args.body.value.id
    }
  }).then((d) => {
    ret['application/json'] = {
      "id": null2Undefined(d.get('id')),
      "name": null2Undefined(d.get('name')),
      "path": null2Undefined(d.get('path')),
      "type": null2Undefined(d.get('type')),
      "attribute": JSON.parse(d.get('attribute'))
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
}

let null2Undefined = function(v) {
  if (v === null) {
    return undefined;
  }
  return v;
}
