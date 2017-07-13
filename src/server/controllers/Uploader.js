const multer = require('multer');
const fs = require('fs');
const path = require('path');
const hash = require('object-hash');
const astsvc = require('./AssetsService');
const Errors = require('./Errors');

let tempDir = path.join(__dirname, '../../../tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

tempDir = fs.mkdtempSync(path.join(tempDir, 'walat-'));

let assetDir = path.join(__dirname, '../../../dist/assets/uploads');

if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, tempDir)
  },
  filename: function(req, file, cb) {
    let sha1 = hash([Date.now(), file]);
    cb(null, sha1)
  }
});

const fileFilter = (req, file, cb) => {
  if (mimetypes.hasOwnProperty(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const limits = {
  fieldNameSize: 100,
  fieldSize: 1000000,
  fields: 10,
  fileSize: 500000000,
  files: 50,
  parts: 60,
  headerPairs: 50
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

const mimetypes = {
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/png': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'audio/wave': 'sound',
  'audio/wav': 'sound',
  'audio/x-wav': 'sound',
  'audio/x-pn-wav': 'sound',
  'audio/mp3': 'sound',
  'audio/mpeg': 'sound',
  'audio/webm': 'sound',
  'audio/ogg': 'sound',
  'application/ogg': 'sound'
};

module.exports = function(app) {
  app.post('/uploader', upload.single('file-upload'), function(req, res, next) {
    if (!req.file) {
      Errors.emitHttpError(res, { code: 400, message: 'Uploaded file has forbidden MIME type.' });
      return;
    }

    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    fs.renameSync(req.file.path, path.join(assetDir, req.file.filename));
    let filePath = req.body['file-path'] || '';
    let fullPath =
      `${filePath === '' ? '' : filePath + '/'}${req.file.filename}`;
    astsvc.assetsPOST({
      body: {
        value: {
          name: req.file.originalname,
          path: fullPath,
          type: mimetypes[req.file.mimetype],
          attribute: {
            size: req.file.size,
            thumb: 'http://via.placeholder.com/350x150',
            mimetype: req.file.mimetype
          }
        }
      }
    }, res, next);
  });

  // // max 10 files
  // app.post('/bulk-uploader', upload.array('file-upload', 10), function(req,
  //   res,
  //   next) {
  //   // req.files is array of `photos` files
  //   // req.body will contain the text fields, if there were any
  //   console.log(req.files[0].originalname);
  // });
}
