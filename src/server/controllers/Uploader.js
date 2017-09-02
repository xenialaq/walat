const gulp = require('gulp');
const file = require('gulp-file');
const template = require('gulp-template');
const rename = require("gulp-rename");
const rseq = require('run-sequence');
const merge = require('merge-stream');
const unzip = require('gulp-decompress');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const hash = require('object-hash');
const astsvc = require('./AssetsService');
const edtsvc = require('./EditorService');
const Errors = require('./Errors');

const _ = require('lodash');
const rstr = require("randomstring");
const dirt = require('directory-tree');

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
  fields: 50,
  fileSize: 500000000,
  files: 50,
  parts: 100,
  headerPairs: 20
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

var zipupload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if ({ 'application/zip': 'zip' }.hasOwnProperty(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
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
  app.post('/uploader', upload.array('file-upload', 50), function(req, res,
    next) {
    let ret = { 'application/json': [] };
    if (req.files.length === 0) {
      Errors.emitHttpError(res, { code: 400, message: 'Uploaded file has forbidden MIME type.' });
      return;
    }

    let counter = 0;

    req.files.forEach((file) => {
      // file is the `avatar` file
      // req.body will hold the text fields, if there were any
      fs.renameSync(file.path, path.join(assetDir, file.filename));
      let filePath = req.body['file-path'] || '';
      let fullPath =
        `${filePath === '' ? '' : filePath + '/'}${file.filename}`;
      astsvc.createAsset({
        name: file.originalname,
        path: fullPath,
        type: mimetypes[file.mimetype],
        attribute: JSON.stringify({
          size: file.size,
          thumb: 'http://via.placeholder.com/350x150',
          mimetype: file.mimetype
        })
      }).then((d) => {
        ret['application/json'].push({
          "id": null2Undefined(d.get('id')),
          "name": null2Undefined(d.get('name')),
          "path": null2Undefined(d.get('path')),
          "type": null2Undefined(d.get('type')),
          "attribute": JSON.parse(d.get('attribute'))
        });

        counter++;
        if (counter === req.files.length) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {},
            null, 2));
        }
      });
    });
  });

  app.post('/zipuploader', zipupload.single('file-upload'), function(req, res,
    next) {
    if (!req.file) {
      Errors.emitHttpError(res, { code: 400, message: 'Uploaded file has forbidden MIME type.' });
      return;
    }

    extract(req.file.path, path.join(tempDir, req.file.originalname), (
      assets, lessons) => {
      assets.forEach((a) => {
        fs.renameSync(a.tmpPath, a.destPath);

        astsvc.createAsset({
          name: a.value.name,
          path: a.value.path,
          type: a.value.type,
          attribute: JSON.stringify(a.value.attribute)
        });
      });

      lessons.forEach((l) => {
        edtsvc.createLesson({
          name: l.name,
          path: l.path,
          description: '',
        }).then((d) => {
          let ret = {};

          ret['application/json'] = {
            "id": null2Undefined(d.get('id')),
            "name": null2Undefined(d.get('name')),
            "path": null2Undefined(d.get('path')),
            "description": null2Undefined(d.get(
              'description'))
          };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ret[Object.keys(ret)[0]] ||
            {}, null, 2));

          let lid = d.id;

          l.exercises.forEach((e) => {
            edtsvc.createExercise({
              name: e.name,
              path: e.path,
              description: '',
              lessonId: lid
            }).then((d) => {
              let eid = d.id;

              e.pages.forEach((p) => {
                edtsvc.createPage({
                  name: p.name,
                  path: p.path,
                  description: '',
                  fields: '{}',
                  exerciseId: eid
                });
              });
            });
          });
        });
      });

    });

  });

  const extract = (filename, dest, cb) => {
    var xtask = rstr.generate();

    gulp.task(xtask, () => {
      return gulp.src(filename)
        .pipe(unzip())
        .pipe(gulp.dest(dest));
    });
    rseq(xtask, () => {
      const tree = dirt(dest, { extensions: /\.mp3/ });

      // values to POST
      let assets = [];
      let lessons = [];

      const lessonName = tree.name.replace(/.[^.]*$/, '');
      const lessonPath = rstr.generate();
      let lesson = { name: lessonName, path: lessonPath, exercises: [] };
      lessons.push(lesson);

      tree.children.forEach((edir) => {
        if (edir.type === 'directory') {
          const exerciseName = edir.name;
          const exercisePath = rstr.generate();
          let exercise = {
            name: exerciseName,
            path: exercisePath,
            pages: []
          };
          lesson.exercises.push(exercise);

          edir.children.forEach((pfile) => {
            if (pfile.type === 'file') {
              const pageName = pfile.name;
              const pagePath = rstr.generate();
              exercise.pages.push({
                name: pageName.replace(
                  /.[^.]*$/, ''),
                path: pagePath
              });

              const mediaPath = rstr.generate();

              let fullPath = path.join(lessonPath, exercisePath,
                pagePath, mediaPath);

              assets.push({
                tmpPath: pfile.path,
                destPath: path.join(assetDir, mediaPath),
                value: {
                  name: pageName,
                  path: fullPath,
                  type: 'sound',
                  attribute: {
                    size: pfile.size,
                    thumb: 'http://via.placeholder.com/350x150',
                    mimetype: 'audio/mpeg'
                  }
                }
              });
            }
          });
        }
      });


      cb(assets, lessons);
    });
  }
}

let null2Undefined = function(v) {
  if (v === null) {
    return undefined;
  }
  return v;
}
