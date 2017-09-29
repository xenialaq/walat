const Model = require('../models/models.js');

const {
  DataSource,
  Page,
  Exercise,
  Lesson,
} = Model;

const _ = require('lodash');
const rstr = require('randomstring');

DataSource.sync();

const Errors = require('./Errors');

const null2Undefined = (v) => {
  if (v === null) {
    return undefined;
  }
  return v;
};

exports.exercisesGET = (args, res) => {
  /* *
   * Returns information about exercises at a given lesson.
   *
   * lesson_id Integer Lesson to list exercises
   * returns List
   * */
  const ret = {};

  Exercise.findAll({
    where: {
      lessonId: args.lesson_id.value,
    },
    order: [
      ['createdAt'],
    ],
  }).then((exercises) => {
    ret['application/json'] = exercises.map(d => ({
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
      lesson: null2Undefined(d.get('lessonId')),
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.exercisesIdDELETE = (args, res) => {
  /* *
   * Deletes an exercise.
   *
   * id Integer ID of exercise
   * returns String
   * */
  const ret = {};

  Exercise.destroy({
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

exports.exercisesIdGET = (args, res) => {
  /* *
   * Returns information about the exercise of a specified ID.
   *
   * id Integer ID of exercise
   * returns inline_response_200_1
   * */
  const ret = {};

  Exercise.find({
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
      description: null2Undefined(d.get('description')),
      lesson: null2Undefined(d.get('lessonId')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.exercisesIdReorderPOST = (args, res, next) => {
  /* *
   * Reorders an exercise.
   *
   * id Integer ID of exercise
   * body List List of ordered page IDs
   * returns String
   * */
  let newDate = Date.now();

  let promisePage = Page.update({
    createdAt: newDate,
    updatedAt: newDate,
  }, {
    where: {
      id: args.body.value[0],
    },
  });


  const chainPromise = (promise, arg, cb) => {
    promise.then((d) => {
      if (d === null) {
        Errors.emitHttpError(res, {
          code: 404,
          message: 'Cannot find id.',
        });
        return;
      }

      newDate += 100;

      cb(Page.update({
        createdAt: newDate,
        updatedAt: newDate,
      }, {
        where: {
          id: arg,
        },
      }));
    });
  };

  args.body.value.forEach((id) => {
    chainPromise(promisePage, id, (nextP) => {
      promisePage = nextP;
    });
  });

  promisePage.then((d) => {
    if (d === null) {
      Errors.emitHttpError(res, {
        code: 404,
        message: 'Cannot find id.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.id.value,
      },
    };
    this.exercisesIdGET(retArgs, res, next);
  });
};

exports.exercisesPOST = (args, res) => {
  /* *
   * Adds a new exercise to a given lesson.
   *
   * body Body_3 Exercise with default ID to be added
   * returns String
   * */
  const ret = {};

  this.createExercise({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson,
  }).then((d) => {
    ret['application/json'] = {
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
      lesson: null2Undefined(d.get('lessonId')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
};

exports.exercisesPUT = (args, res, next) => {
  /* *
   * Edits an exercise.
   *
   * body Body_2 Exercise with given ID to be updated
   * returns String
   * */
  Exercise.update({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    lessonId: args.body.value.lesson,
  }, {
    where: {
      id: args.body.value.id,
    },
  }).then((rows) => {
    const d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Cannot update exercise.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.body.value.id,
      },
    };
    this.exercisesIdGET(retArgs, res, next);
  });
};

exports.lessonsGET = (args, res) => {
  /* *
   * Returns information about lessons.
   *
   * returns List
   * */
  const ret = {};

  Lesson.findAll().then((lessons) => {
    ret['application/json'] = lessons.map(d => ({
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.lessonsIdDELETE = (args, res) => {
  /* *
   * Deletes a lesson.
   *
   * id Integer ID of lesson
   * returns String
   * */
  const ret = {};

  Lesson.destroy({
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

exports.lessonsIdGET = (args, res) => {
  /* *
   * Returns information about the lesson of a specified ID.
   *
   * id Integer ID of lesson
   * returns inline_response_200_2
   * */
  const ret = {};

  Lesson.find({
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
      description: null2Undefined(d.get('description')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.lessonsIdReorderPOST = (args, res, next) => {
  /* *
   * Reorders a lesson.
   *
   * id Integer ID of lesson
   * body List List of ordered exercise IDs
   * returns String
   * */
  let newDate = Date.now();

  let promiseExercise = Exercise.update({
    createdAt: newDate,
    updatedAt: newDate,
  }, {
    where: {
      id: args.body.value[0],
    },
  });


  const chainPromise = (promise, arg, cb) => {
    promise.then((d) => {
      if (d === null) {
        Errors.emitHttpError(res, {
          code: 404,
          message: 'Cannot find id.',
        });
        return;
      }

      newDate += 100;

      cb(Exercise.update({
        createdAt: newDate,
        updatedAt: newDate,
      }, {
        where: {
          id: arg,
        },
      }));
    });
  };

  args.body.value.forEach((id) => {
    chainPromise(promiseExercise, id, (nextE) => {
      promiseExercise = nextE;
    });
  });

  promiseExercise.then((d) => {
    if (d === null) {
      Errors.emitHttpError(res, {
        code: 404,
        message: 'Cannot find id.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.id.value,
      },
    };
    this.lessonsIdGET(retArgs, res, next);
  });
};

exports.lessonsPOST = (args, res) => {
  /* *
   * Adds a new lesson.
   *
   * body Body_5 Lesson with default ID to be added
   * returns String
   * */
  const ret = {};

  this.createLesson({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
  }).then((d) => {
    ret['application/json'] = {
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
};

exports.lessonsPUT = (args, res, next) => {
  /* *
   * Edits a lesson.
   *
   * body Body_4 Lesson with given ID to be updated
   * returns String
   * */
  Lesson.update({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
  }, {
    where: {
      id: args.body.value.id,
    },
  }).then((rows) => {
    const d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Cannot update lesson.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.body.value.id,
      },
    };
    this.lessonsIdGET(retArgs, res, next);
  });
};

exports.pagesGET = (args, res) => {
  /* *
   * Returns information about pages at a given exercise.
   *
   * exercise_id Integer Exercise to list pages
   * returns List
   * */
  const ret = {};

  Page.findAll({
    where: {
      exerciseId: args.exercise_id.value,
    },
    order: [
      ['createdAt'],
    ],
  }).then((pages) => {
    ret['application/json'] = pages.map(d => ({
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
      fields: JSON.parse(d.get('fields')),
      script: null2Undefined(d.get('script')),
      exercise: null2Undefined(d.get('exerciseId')),
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.pagesIdDELETE = (args, res) => {
  /* *
   * Deletes a page.
   *
   * id Integer ID of page
   * returns String
   * */
  const ret = {};

  Page.destroy({
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

exports.pagesIdGET = (args, res) => {
  /* *
   * Returns information about the page of a specified ID.
   *
   * id Integer ID of page
   * returns inline_response_200
   * */
  const ret = {};

  Page.find({
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
      description: null2Undefined(d.get('description')),
      fields: JSON.parse(d.get('fields')),
      script: null2Undefined(d.get('script')),
      exercise: null2Undefined(d.get('exerciseId')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  }, (reason) => {
    Errors.emitDbError(res, reason);
  });
};

exports.pagesPOST = (args, res) => {
  /* *
   * Adds a new page to a given exercise.
   *
   * body Body_1 Page with default ID to be added
   * returns String
   * */
  const ret = {};

  this.createPage({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    fields: args.body.value.fields || '{}',
    script: args.body.value.script,
    exerciseId: args.body.value.exercise,
  }).then((d) => {
    ret['application/json'] = {
      id: null2Undefined(d.get('id')),
      name: null2Undefined(d.get('name')),
      path: null2Undefined(d.get('path')),
      description: null2Undefined(d.get('description')),
      fields: JSON.parse(d.get('fields')),
      script: null2Undefined(d.get('script')),
      exercise: null2Undefined(d.get('exerciseId')),
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ret[Object.keys(ret)[0]] || {}, null, 2));
  });
};

exports.pagesPUT = (args, res, next) => {
  /* *
   * Edits a page.
   *
   * body Body Page with given ID to be updated
   * returns String
   * */
  Page.update({
    name: args.body.value.name,
    path: _.isEmpty(args.body.value.path) ? rstr.generate() : args.body.value
      .path,
    description: args.body.value.description,
    fields: args.body.value.fields,
    script: args.body.value.script,
    exerciseId: args.body.value.exercise,
  }, {
    where: {
      id: args.body.value.id,
    },
  }).then((rows) => {
    const d = rows[0];
    if (_.isUndefined(d)) {
      Errors.emitHttpError(res, {
        code: 400,
        message: 'Cannot update page.',
      });
      return;
    }

    const retArgs = {
      id: {
        value: args.body.value.id,
      },
    };
    this.pagesIdGET(retArgs, res, next);
  });
};

exports.createLesson = v => Lesson.create(v);
exports.createExercise = v => Exercise.create(v);
exports.createPage = v => Page.create(v);
