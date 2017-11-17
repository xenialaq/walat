const gulp = require('gulp');
const rseq = require('run-sequence');
const fs = require('fs-extra');
const path = require('path');
const rstr = require('randomstring');
const unzip = require('gulp-decompress');
const astsvc = require('./AssetsService');
const edtsvc = require('./EditorService');

module.exports = (filename, dest) => {
  const xtask = rstr.generate();

  gulp.task(xtask, () => gulp.src(filename).pipe(unzip()).pipe(gulp.dest(dest)));
  rseq(xtask, () => {
    let db = fs.readFileSync(path.join(dest, 'db.wson'), { encoding: 'utf8' });
    db = db.split('\n').filter(e => e.length > 0);
    const lessons = [];
    const exercises = [];
    const pages = [];
    db.forEach((line) => {
      if (line.endsWith(' L')) {
        lessons.push(JSON.parse(line.replace(/ L$/, '')));
      } else if (line.endsWith(' E')) {
        exercises.push(JSON.parse(line.replace(/ E$/, '')));
      } else if (line.endsWith(' P')) {
        pages.push(JSON.parse(line.replace(/ P$/, '')));
      }
    });

    lessons.forEach((l) => {
      edtsvc.createLesson({
        id: l.id,
        name: l.name,
        path: l.path,
        description: l.description,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      });
    });

    exercises.forEach((e) => {
      edtsvc.createExercise({
        id: e.id,
        name: e.name,
        path: e.path,
        description: e.description,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        lessonId: e.lessonId,
      });
    });

    pages.forEach((p) => {
      edtsvc.createPage({
        id: p.id,
        name: p.name,
        path: p.path,
        description: p.description,
        fields: p.fields,
        script: p.script,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        exerciseId: p.exerciseId,
      });
    });
  });
};
