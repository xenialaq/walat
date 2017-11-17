const gulp = require('gulp');
const rseq = require('run-sequence');
const zip = require('gulp-zip');

const fs = require('fs-extra');
const path = require('path');
const Errors = require('./Errors');

const Model = require('../models/models.js');

const {
  DataSource,
  Page,
  Exercise,
  Lesson,
  Asset,
} = Model;

const rstr = require('randomstring');

DataSource.sync();

let tempDir = path.join(__dirname, '..', '..', '..', 'tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

tempDir = fs.mkdtempSync(path.join(tempDir, 'walat-'));

const assetDir = path.join(__dirname, '..', '..', '..', 'dist', 'assets', 'templates');

if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir);
}

module.exports = (app) => {
  app.get('/exportor', (req, res) => {
    const jobId = rstr.generate();
    const jobDir = path.join(tempDir, `job-${jobId}`);
    fs.mkdirSync(jobDir);

    Lesson.find({
      where: {
        id: req.query.lid,
      },
    }).then((l) => {
      if (l === null) {
        Errors.emitHttpError(res, {
          code: 404,
          message: 'Cannot find id.',
        });
        return;
      }

      const walatPath = path.join(jobDir, 'db.wson');
      const walat = fs.createWriteStream(walatPath);

      // write lesson row
      walat.write(JSON.stringify(l));
      walat.write('L \n');

      let partExercisesComplete = false;
      let partAssetsComplete = false;

      const cbLesson = (part) => {
        if (part === 'exercises') {
          partExercisesComplete = true;
        }

        if (part === 'assets') {
          partAssetsComplete = true;
        }

        if (!partExercisesComplete || !partAssetsComplete) {
          return;
        }

        // complete lesson generation
        walat.end(() => {
          // generate zip for download
          const ziptask = rstr.generate();
          gulp.task(ziptask, () => gulp.src(`${jobDir}/**/*`)
            .pipe(zip(`${ziptask}.walat`)).pipe(gulp.dest(tempDir)));

          rseq(ziptask, () => {
            // trigger download
            res.download(path.join(tempDir, `${ziptask}.walat`), `${l.name}.walat`);
          });
        });
      };

      Asset.findAll({
        where: {
          path: {
            $like: `${l.path}%`,
          },
        },
      }).then((assets) => {
        const cbAsset = (aIdx) => {
          if (aIdx >= assets.length) {
            cbLesson('assets');
            return;
          }

          const a = assets[aIdx];

          // write asset row
          walat.write(JSON.stringify(a));
          walat.write('A \n');

          const assetName = a.path.split('/').pop();

          try {
            fs.copySync(`dist/assets/uploads/${assetName}`, path.join(jobDir, 'assets', assetName));
          } catch (err) {
            console.error(err);
          }

          cbAsset(aIdx + 1);
        };

        cbAsset(0);
      });

      Exercise.findAll({
        where: {
          lessonId: l.id,
        },
      }).then((exercises) => {
        const cbExercise = (eIdx) => {
          if (eIdx >= exercises.length) {
            cbLesson('exercises');
            return;
          }

          const e = exercises[eIdx];

          // write exercise row
          walat.write(JSON.stringify(e));
          walat.write('E \n');

          Page.findAll({
            where: {
              exerciseId: e.id,
            },
          }).then((pages) => {
            const cbPage = (pIdx) => {
              if (pIdx >= pages.length) {
                cbExercise(eIdx + 1);
                return;
              }

              const p = pages[pIdx];

              // write page row
              walat.write(JSON.stringify(p));
              walat.write('P \n');
              cbPage(pIdx + 1);
            };

            cbPage(0);
          }, (reason) => {
            Errors.emitDbError(res, reason);
          });
        };

        cbExercise(0);
      }, (reason) => {
        Errors.emitDbError(res, reason);
      });
    }, (reason) => {
      Errors.emitDbError(res, reason);
    });
  });
};
