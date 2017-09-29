const Model = require('../models/models.js');

const {
  DataSource,
  Asset,
} = Model;

DataSource.sync();

const Errors = require('./Errors');

const null2Undefined = (v) => {
  if (v === null) {
    return undefined;
  }
  return v;
};

exports.assetsGET = (args, res) => {
  /* *
   * Returns information about assets.
   *
   * returns List
   * */
  const ret = {};
  Asset.findAll({
    where: {
      name: {
        $like: `${args.name.value ? args.name.value : ''}%`,
      },
      path: {
        $like: `${args.path.value ? args.path.value : ''}%`,
      },
    },
  }).then((assets) => {
    ret['application/json'] = assets.map(d => ({
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      type: null2Undefined(d.get('type')),
      attribute: JSON.parse(d.get('attribute')),
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.assetsIdDELETE = (args, res) => {
  /* *
   * Deletes an asset.
   *
   * id Integer ID of asset
   * returns String
   * */
  const ret = {};

  Asset.destroy({
    where: {
      id: args.id.value,
    },
  });

  ret['application/json'] = {
    code: 200,
  };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
};

exports.assetsIdGET = (args, res) => {
  /* *
   * Returns information about the asset of a specified ID.
   *
   * id Integer ID of asset
   * returns inline_response_200_3
   * */
  const ret = {};

  Asset.find({
    where: {
      id: args.id.value,
    },
  }).then((d) => {
    if (d === null) {
      Errors.emitHttpError(res, {
        code: 404,
        message: 'Cannot find id.',
      });
      return;
    }
    ret['application/json'] = {
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      type: null2Undefined(d.get('type')),
      attribute: JSON.parse(d.get('attribute')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.assetsPOST = (args, res) => {
  /* *
   * Adds a new asset.
   *
   * body Body_7 Asset with default ID to be added
   * returns String
   * */
  const ret = {};

  this.createAsset({
    name: args.body.value.name,
    path: args.body.value.path,
    type: args.body.value.type,
    attribute: JSON.stringify(args.body.value.attribute),
  }).then((d) => {
    ret['application/json'] = {
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      type: null2Undefined(d.get('type')),
      attribute: JSON.parse(d.get('attribute')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
};

exports.assetsPUT = (args, res, next) => {
  /* *
   * Edits an asset.
   *
   * body Body_6 Asset with given ID to be updated
   * returns String
   * */
  Asset.update({
    name: args.body.value.name,
    path: args.body.value.path,
    type: args.body.value.type,
    attribute: JSON.stringify(args.body.value.attribute),
  }, {
    where: {
      id: args.body.value.id,
    },
  }).then((rows) => {
    const d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Cannot update asset.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.body.value.id,
      },
    };
    this.assetsIdGET(retArgs, res, next);
  });
};

exports.createAsset = v => Asset.create(v);
