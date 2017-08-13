'use strict';

const gulp = require('gulp');
const file = require('gulp-file');
const template = require('gulp-template');
const rename = require("gulp-rename");
const rseq = require('run-sequence');
const merge = require('merge-stream');
const zip = require('gulp-zip');

const render = require('render-quill');
const fs = require('fs');
const path = require('path');
const Errors = require('./Errors');

var Model = require('../models/models.js');

var DataSource = Model.DataSource;
var Page = Model.Page;
var Exercise = Model.Exercise;
var Lesson = Model.Lesson;

const _ = require('lodash');
const rstr = require("randomstring");

DataSource.sync();

let tempDir = path.join(__dirname, '../../../tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

tempDir = fs.mkdtempSync(path.join(tempDir, 'walat-'));

let assetDir = path.join(__dirname, '../../../dist/assets/templates');

if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir);
}

module.exports = function(app) {
  app.get('/generator', function(req, res, next) {
    var ret = {};

    var jobId = rstr.generate();
    var jobDir = path.join(tempDir, 'job-' + jobId);
    fs.mkdirSync(jobDir);

    Lesson.find({
      where: {
        id: req.query.lid
      }
    }).then(function(l) {
      if (l === null) {
        Errors.emitHttpError(res, { code: 404, message: 'Cannot find id.' });
        return;
      }

      var bakPath = path.join(jobDir, l.name + '.bak');
      var bak = fs.createWriteStream(bakPath);

      // write lesson line
      bak.write(`Lesson ${l.name}\n`);

      Exercise.findAll({
        where: {
          lessonId: l.id
        }
      }).then(function(exercises) {
        let exerciseCounter = 0;

        exercises.map((e) => {
          // write exercise line
          bak.write(
            `(start of exercise ${e.name.replace(' ', '_')})\n`
          );

          Page.findAll({
            where: {
              exerciseId: e.id
            }
          }).then(function(pages) {
            let pageCounter = 0;

            let cbPage = (script) => {
              pageCounter++;
              if (pageCounter === pages.length) {
                exerciseCounter++;
              }

              if (exerciseCounter === exercises.length) {
                // complete lesson generation
                bak.end(script, () => {
                  let ziptask = rstr.generate();
                  gulp.task(ziptask, () =>
                    gulp.src(jobDir + '/**/*')
                    .pipe(zip(ziptask + '.zip'))
                    .pipe(gulp.dest(tempDir))
                  );

                  rseq(ziptask, () => {
                    // trigger download
                    res.download(path.join(
                        tempDir, ziptask +
                        '.zip'), l.name +
                      '.zip');
                  });
                });
              }
            }
            pages.map((p) => {
              // write page line
              bak.write(
                `\\${p.name}\n`
              );

              transScript({
                lesson: l,
                exercise: e,
                page: p
              }, jobDir, cbPage);
            });
          }, function(reason) {
            Errors.emitDbError(res, reason);
          });
        });

      }, function(reason) {
        Errors.emitDbError(res, reason);
      });
    }, function(reason) {
      Errors.emitDbError(res, reason);
    });
  });
}

const transScript = (collection, outputDir, cbPage) => {
  let script = collection.page.script;
  let data = JSON.parse(collection.page.fields);

  let s = script.split('\n');
  let qnaTags = [];

  let lineCounter = 0;
  let resultLines = [];

  const cbLine = (newLine) => {
    lineCounter++;
    resultLines.push(newLine);
    if (lineCounter === s.length) {
      // complete page generation
      cbPage(resultLines.join('\n'));
    }
  }

  s.forEach((line) => {
    const matches = line.match(/@\w+\s*$/g);
    let tag = '';
    if (!_.isNull(matches)) {
      tag = matches[0].replace(/^@/g, '').trim();
      if (/^expect Q&A submission/.test(line)) {
        qnaTags.push(tag);
      }
    }

    if (_.isNull(matches)) {
      cbLine(line);
    } else {
      transLine(
        collection, line, data, tag, outputDir, qnaTags[qnaTags.length -
          1], cbLine
      );
    }
  });
}

const transLine = (collection, line, data, tag, outputDir, qnaTag, cbLine) => {
  let cmd = '';
  if (/^show text/.test(line)) {
    cmd = 'show text';
  } else if (/^show directions/.test(line)) {
    cmd = 'show directions';
  } else if (/^hide/.test(line)) {
    cmd = 'hide';
  } else if (/^pause/.test(line)) {
    cmd = 'pause';
  } else if (/^wait/.test(line)) {
    cmd = 'wait';
  } else if (/^play/.test(line)) {
    cmd = 'play';
  } else if (/^record/.test(line)) {
    cmd = 'record';
  } else if (/^expect Q&A submission/.test(line)) {
    cmd = 'expect Q&A submission';
  }

  const pageTextDir = path.join(
    outputDir,
    'texts',
    collection.lesson.name,
    collection.exercise.name.replace(' ', '_')
  );

  const pageMediaDir = path.join(
    outputDir,
    'media',
    collection.lesson.name,
    collection.exercise.name.replace(' ', '_')
  );

  switch (cmd) {
    case 'show text':
      generateText(collection, data, tag, pageTextDir, qnaTag, cbLine);
      break;
    case 'show directions':
      cbLine('show directions ' + data[tag]['directions']);
      break;
    case 'hide':
      cbLine('hide ' + data[tag]['element']);
      break;
    case 'pause':
      cbLine('pause ' + data[tag]['length']);
      break;
    case 'play':
      generateMedia(collection, data, tag, pageMediaDir, cbLine);
      break;
    case 'record':
      cbLine('record ' + (data[tag]['isFixed'] ?
        data[tag]['length'] :
        data[tag]['length-var']) + ' * ' + data[tag][
        'length-multiplier'
      ]);
      break;
    case 'expect Q&A submission':
      generateQna(collection, data, tag, pageTextDir, cbLine);
      break;
    default:
      cbLine();
      return cmd;
  }
}

const generateText = (collection, data, tag, outputDir, qnaTag, cb) => {
  const taskNames = [rstr.generate(), rstr.generate(), rstr.generate(), rstr.generate()];
  let textHtml = '';
  gulp.task(taskNames[0], (cb) => {
    const html = gulp.src(
        `dist/assets/templates/text${qnaTag ? '.q': ''}.html`)
      .pipe(
        template({
          qnaName: collection.page.name + '.' + qnaTag + '.html',
          content: textHtml
        }))
      .pipe(rename(`${collection.page.name}.${tag}.html`))
      .pipe(gulp.dest(outputDir));
    const commons = undefined;
    const assets = undefined;
    return merge(html);
  });

  gulp.task(taskNames[1], (cb) => {
    const videoName = data[tag].video.path.split('/').pop();

    const html = gulp.src(
        `dist/assets/templates/waveform${qnaTag ? '.q': ''}.html`)
      .pipe(
        template({
          qnaName: collection.page.name + '.' + qnaTag + '.html',
          videoName: videoName
        }))
      .pipe(rename(`${collection.page.name}.${tag}.html`))
      .pipe(gulp.dest(outputDir));
    const commons = gulp.src('dist/assets/templates/waveform/**/*')
      .pipe(gulp.dest(outputDir));
    const assets = gulp.src('dist/assets/uploads/' + videoName)
      .pipe(gulp.dest(outputDir));
    return merge(html, commons, assets);
  });

  gulp.task(taskNames[2], (cb) => {
    const videoName = data[tag].video.path.split('/').pop();

    const html = gulp.src(
        `dist/assets/templates/video${qnaTag ? '.q': ''}.html`)
      .pipe(
        template({
          qnaName: collection.page.name + '.' + qnaTag + '.html',
          videoName: videoName
        }))
      .pipe(rename(`${collection.page.name}.${tag}.html`))
      .pipe(gulp.dest(outputDir));
    const commons = gulp.src('dist/assets/templates/video/**/*')
      .pipe(gulp.dest(outputDir));
    const assets = gulp.src('dist/assets/uploads/' + videoName)
      .pipe(gulp.dest(outputDir));
    return merge(html, commons, assets);
  });

  gulp.task(taskNames[3], (cb) => {
    const imageName = data[tag].image.path.split('/').pop();

    const html = gulp.src(
        `dist/assets/templates/image${qnaTag ? '.q': ''}.html`)
      .pipe(
        template({
          qnaName: collection.page.name + '.' + qnaTag + '.html',
          imageName: imageName
        }))
      .pipe(rename(`${collection.page.name}.${tag}.html`))
      .pipe(gulp.dest(outputDir));
    const commons = undefined;
    const assets = gulp.src('dist/assets/uploads/' + imageName)
      .pipe(gulp.dest(outputDir));
    return merge(html, assets);
  });

  if (data[tag].mode === 'text') {
    render(data[tag].text, (err, output) => {
      textHtml = output;
      rseq(taskNames[0], () => {
        cb(
          `show text ${collection.page.name}/${collection.page.name}.${tag}.html`
        );
      });
    });
  } else if (data[tag].mode === 'video') {
    if (data[tag].video.isWaveform) {
      rseq(taskNames[1], () => {
        cb(
          `show text ${collection.page.name}/${collection.page.name}.${tag}.html`
        );
      });
    } else {
      rseq(taskNames[2], () => {
        cb(
          `show text ${collection.page.name}/${collection.page.name}.${tag}.html`
        );
      });
    }
  } else if (data[tag].mode === 'image') {
    rseq(taskNames[3], () => {
      cb(
        `show text ${collection.page.name}/${collection.page.name}.${tag}.html`
      );
    });
  }
}

const generateQna = (collection, data, tag, outputDir, cb) => {
  const taskName = rstr.generate();
  let qnaQuestion = '';
  let qnaAnswer = '';
  let qnaChoices = [];
  let qnaCorrectness = [];

  gulp.task(taskName, () => {
    const html = gulp.src('dist/assets/templates/qna.html')
      .pipe(
        template({
          qnaQuestion,
          qnaAnswer,
          qnaChoices,
          qnaCorrectness
        }))
      .pipe(rename(`${collection.page.name}.${tag}.html`))
      .pipe(gulp.dest(outputDir));
    const commons = undefined;
    const assets = undefined;
    return merge(html);
  });

  if (data[tag].type === 0) {
    // Short answer
    qnaQuestion = data[tag].question;
    qnaAnswer = data[tag].answer;
    rseq(taskName, () => {
      cb('expect Q&A submission');
    });
  } else if (data[tag].type === 1) {
    // Filling blanks
    qnaQuestion = data[tag].question;
    qnaAnswer = data[tag].answer;
    rseq(taskName, () => {
      cb('expect Q&A submission');
    });
  } else if (data[tag].type === 2) {
    // Multiple choice
    qnaQuestion = data[tag].question;
    qnaChoices = JSON.stringify(data[tag].choices.map((c) => c.value));
    qnaCorrectness = JSON.stringify(data[tag].choices.map((c) => c.isCorrect ?
      'Correct' : 'Incorrect'));
    rseq(taskName, () => {
      cb('expect Q&A submission');
    });
  }
}

const generateMedia = (collection, data, tag, outputDir, cb) => {
  const taskName = rstr.generate();

  gulp.task(taskName, () => {
    const sound = gulp.src('dist/assets/uploads/' + data[tag].path.split(
        '/').pop())
      .pipe(rename(`${collection.page.name}.mp3`))
      .pipe(gulp.dest(outputDir));
    return sound;
  });

  rseq(taskName, () => {
    cb('play');
  });
}
