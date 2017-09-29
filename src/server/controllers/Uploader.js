const gulp = require('gulp');
const rseq = require('run-sequence');
const unzip = require('gulp-decompress');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const hash = require('object-hash');
const astsvc = require('./AssetsService');
const edtsvc = require('./EditorService');
const Errors = require('./Errors');

const rstr = require('randomstring');
const dirt = require('directory-tree');

const null2Undefined = (v) => {
  if (v === null) {
    return undefined;
  }
  return v;
};

let tempDir = path.join(__dirname, '..', '..', '..', 'tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

tempDir = fs.mkdtempSync(path.join(tempDir, 'walat-'));

const assetDir = path.join(__dirname, '..', '..', '..', 'dist', 'assets', 'uploads');

if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const sha1 = hash([Date.now(), file]);
    cb(null, sha1);
  },
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
  'application/ogg': 'sound',
};

const fileFilter = (req, file, cb) => {
  if (mimetypes[file.mimetype] === req.body['file-type']) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const limits = {
  fieldNameSize: 100,
  fieldSize: 1000000,
  fields: 50,
  fileSize: 500000000,
  files: 50,
  parts: 100,
  headerPairs: 20,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

const zipupload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits,
});

const extract = (filename, dest, cb) => {
  const xtask = rstr.generate();

  gulp.task(xtask, () =>
    gulp.src(filename).pipe(unzip()).pipe(gulp.dest(dest)));
  rseq(xtask, () => {
    const tree = dirt(dest, {
      extensions: /\.mp3/,
    });

    // values to POST
    const assets = [];
    const lessons = [];

    const lessonName = tree.name.replace(/.[^.]*$/, '');
    const lessonPath = rstr.generate();
    const lesson = {
      name: lessonName,
      path: lessonPath,
      exercises: [],
    };
    lessons.push(lesson);

    tree.children.forEach((edir) => {
      if (edir.type === 'directory') {
        const exerciseName = edir.name;
        const exercisePath = rstr.generate();
        const exercise = {
          name: exerciseName,
          path: exercisePath,
          pages: [],
        };
        lesson.exercises.push(exercise);

        edir.children.forEach((pfile) => {
          if (pfile.type === 'file') {
            const pageName = pfile.name;
            const pagePath = rstr.generate();
            exercise.pages.push({
              name: pageName.replace(/.[^.]*$/, ''),
              path: pagePath,
            });

            const mediaPath = rstr.generate();

            const fullPath = path.join(...[
              lessonPath, exercisePath,
              pagePath, mediaPath,
            ]);

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
                  mimetype: 'audio/mpeg',
                },
              },
            });
          }
        });
      }
    });

    cb(assets, lessons);
  });
};

module.exports = (app) => {
  app.post('/uploader', upload.array('file-upload', 50), (req, res) => {
    const ret = {
      'application/json': [],
    };
    if (req.files.length === 0) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Uploaded file has forbidden MIME type.',
      });
      return;
    }

    let counter = 0;

    req.files.forEach((file) => {
      // file is the `avatar` file
      // req.body will hold the text fields, if there were any
      fs.renameSync(file.path, path.join(assetDir, file.filename));
      const filePath = req.body['file-path'] || '';
      const fullPath =
        `${filePath === '' ? '' : `${filePath}/`}${file.filename}`;
      astsvc.createAsset({
        name: file.originalname,
        path: fullPath,
        type: mimetypes[file.mimetype],
        attribute: JSON.stringify({
          size: file.size,
          thumb: 'http://via.placeholder.com/350x150',
          mimetype: file.mimetype,
        }),
      }).then((d) => {
        ret['application/json'].push({
          id: null2Undefined(d.get('id')),
          name: null2Undefined(d.get('name')),
          path: null2Undefined(d.get('path')),
          type: null2Undefined(d.get('type')),
          attribute: JSON.parse(d.get('attribute')),
        });

        counter += 1;
        if (counter === req.files.length) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
        }
      });
    });
  });

  app.post('/zipuploader', zipupload.single('file-upload'), (req, res) => {
    if (!req.file) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Uploaded file has forbidden MIME type.',
      });
      return;
    }

    extract(req.file.path, path.join(tempDir, req.file.originalname), (assets, lessons) => {
      assets.forEach((a) => {
        fs.renameSync(a.tmpPath, a.destPath);

        astsvc.createAsset({
          name: a.value.name,
          path: a.value.path,
          type: a.value.type,
          attribute: JSON.stringify(a.value.attribute),
        });
      });

      lessons.forEach((l) => {
        edtsvc.createLesson({
          name: l.name,
          path: l.path,
          description: '',
        }).then((lessonData) => {
          const ret = {};

          ret['application/json'] = {
            id: null2Undefined(lessonData.get('id')),
            name: null2Undefined(lessonData.get('name')),
            path: null2Undefined(lessonData.get('path')),
            description: null2Undefined(lessonData.get('description')),
          };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));

          const lid = lessonData.id;

          l.exercises.forEach((e) => {
            edtsvc.createExercise({
              name: e.name,
              path: e.path,
              description: '',
              lessonId: lid,
            }).then((exerciseData) => {
              const eid = exerciseData.id;

              e.pages.forEach((p) => {
                edtsvc.createPage({
                  name: p.name,
                  path: p.path,
                  description: '',
                  fields: '{}',
                  exerciseId: eid,
                });
              });
            });
          });
        });
      });
    });
  });
};
