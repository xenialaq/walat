import { Component, Injectable, ElementRef } from '@angular/core';

import { Page, Exercise, Lesson, Asset } from '../models/models';

import * as PEdit from '../components/pedit';

@Injectable()
export class AppService {
  public qna: any;
  public flask: any;

  public lessons: { [i: number]: Lesson } = {};
  // public lesson: Lesson;
  public exercises: { [i: number]: Exercise } = {};
  // public exercise: Exercise;
  public pages: { [i: number]: Page } = {};
  // public page: Page;
  public assets: { [i: number]: Asset } = {};

  public readonly templates = [
    `show text @text \nshow directions @directions \nplay @sound \nhide text \nshow directions @directions \nwait`,
    `show text @text \nshow directions @directions \nwait \nrecord @duration \nhide text \nshow directions @directions \nwait`,
    `show text @content \nshow directions @dir \nplay @sound \nwait \nrecord @duration \nhide @element \nshow directions @directions \nwait`,
    ``
  ];

  public readonly eventsFieldsMapping = {
    'listen': ['sound-id', 'sound-name'],
    'record': ['isFixed', 'length', 'length-multiplier'],
    'listen, record': ['sound-id', 'sound-name', 'isFixed', 'length', 'length-multiplier']
  };

  public readonly contentFieldsMapping = {
    'text': ['text'],
    'slide': ['slide-id', 'slide-name'],
    'video': ['video-id', 'video-name'],
    'page': ['qna-type', 'qna-page', 'qna-mc', 'qna-key'],
    'video, page': ['qna-type', 'qna-page', 'qna-mc', 'qna-key'],
    'video, waveform': ['video-id', 'video-name']
  };

  public editor = {
    name: 'editor',
    lesson: { id: 0, data: {} },
    exercise: { id: 0, data: {} },
    page: { id: 0, data: { /* field: value */ } },
    line: {
      i: 0,
      cmd: '',
      tag: null,
      data: {} /* field: value */
    }
  };

  public activeItem = {
    value: { name: '', path: '', description: '' },
    action: '',
    type: '',
    openModal: false
  };

  public library = {
    name: 'library',
    lesson: { id: 0, data: {} },
    exercise: { id: 0, data: {} },
    page: { id: 0, data: { /* field: value */ } }
  };

  public dashboard = {
    name: 'dashboard',
    lesson: { id: 0, data: {} },
    exercise: { id: 0, data: {} },
    page: { id: 0, data: { /* field: value */ } }
  };

  public activeView;

  constructor() {
    this.initLessons();

    setInterval(() => {
      console.log('lessons', this.lessons);
      console.log('exercises', this.exercises);
      console.log('pages', this.pages);
      console.log('activeView', this.activeView);
      console.log('activeItem', this.activeItem);
    }, 12000);
  }

  initLessons = () => {
    $.api({
      action: 'get lessons',
      on: 'now',
      onResponse: (response) => {
        _.values(response).forEach((d) => {
          this.lessons[d.id] = (
            new Lesson(d.id, d.name, d.path, d.description)
          );

          this.initExercises(d.id);
          this.initAssets(d.id);
        });

        let uri = new URI(window.location.href);
        let queryObj = uri.search(true);
        let lessonId = parseInt(queryObj.lid, 10);

        if (_.isNaN(lessonId)) {
          lessonId = 0;
        }

        this.activeView.lesson.id = lessonId;
      }
    });
  }

  initExercises = (lessonId) => {
    $.api({
      action: 'get exercises',
      urlData: {
        id: lessonId
      },
      on: 'now',
      onResponse: (response) => {
        _.values(response).forEach((d) => {
          this.exercises[d.id] = (
            new Exercise(d.id, d.name, d.path, d.description, this.lessons[d.lesson])
          );

          this.initPages(d.id);
        });
      }
    });
  }

  initPages = (exerciseId) => {
    $.api({
      action: 'get pages',
      urlData: {
        id: exerciseId
      },
      on: 'now',
      onResponse: (response) => {
        _.values(response).forEach((d) => {
          this.pages[d.id] = (
            new Page(d.id, d.name, d.path, d.description, d.fields, d.script, this.exercises[d.exercise])
          );
          this.pages[d.id].synced = true;
        });
      }
    });
  }

  initAssets = (lessonId) => {
    $.api({
      action: 'get assets',
      data: {
        path: this.lessons[lessonId].path
      },
      on: 'now',
      onResponse: (response) => {
        _.values(response).forEach((d) => {
          this.assets[d.id] = (
            new Asset(d.id, d.name, d.path, d.type, d.attribute)
          );
        });
      }
    });
  }

  /**
   * Gets a list of lessons and renders the data to dashboard.
   * @param  {[type]} '#lessons' [description]
   * @return {[type]}            [description]
   */
  initLesson = (id) => {
    $.api({
      action: 'get lesson by ID',
      urlData: { id: id },
      on: 'now',
      onResponse: (d) => {
        this.lessons[d.id] = (
          new Lesson(d.id, d.name, d.path, d.description)
        );

        this.initExercises(d.id);
      }
    });
  }

  /**
   * Gets a list of exercises and renders the data to editor.
   * @param  {[type]} `#exercise-list` [description]
   * @return {[type]}             [description]
   */
  initExercise = (id) => {
    $.api({
      action: 'get exercise by ID',
      urlData: { id: id },
      on: 'now',
      onResponse: (d) => {
        this.exercises[d.id] = (
          new Exercise(d.id, d.name, d.path, d.description, this.lessons[d.lesson])
        );

        this.initPages(d.id);
      }
    });
  }

  initPage = (id) => {
    $.api({
      action: 'get page by ID',
      urlData: { id: id },
      on: 'now',
      onResponse: (d) => {
        this.pages[d.id] = (
          new Page(d.id, d.name, d.path, d.description, d.fields, d.script, this.exercises[d.exercise])
        );
        this.pages[d.id].synced = true;
      }
    });
  }

  initAsset = (id) => {
    $.api({
      action: 'get asset by ID',
      urlData: { id: id },
      on: 'now',
      onResponse: (d) => {
        this.assets[d.id] = (
          new Asset(d.id, d.name, d.path, d.type, d.attribute)
        );
      }
    });
  }

  bindUploaders = (uploaders) => {
    uploaders.forEach((s) => {
      s.trigger.click(() => {
        if (s.multiple) {
          s.input.attr('multiple', '');
        } else {
          s.input.removeAttr('multiple');
        }
        // Unbind
        s.input.off('change');

        // Set if needs a submit button to confirm
        if (s.submit) {
          s.submit.off('click');
        }

        // Extra values
        s.path.val(s.pvalue ? s.pvalue() : '');
        s.type.val(s.tvalue ? s.tvalue() : '');

        var uploadNow = () => {
          var form = s.input.parent('form')[0];
          var data = new FormData(form);

          if (s.onSubmit) {
            s.onSubmit();
          }

          $.ajax({
            url: s.url || '/uploader',
            data: data,
            method: 'POST',
            processData: false,
            contentType: false,
            success: (data) => {
              s.input.val('');
              if (s.label) {
                s.label.val('');
              }
              if (s.callback) {
                s.callback(data);
              }
            },
            error: (err) => {
              this.showDimmer(err.responseJSON.message);
            }
          });
        };

        s.input.change(() => {
          if (s.input.val() === '') {
            return;
          }

          if (s.submit) {
            s.label.val(s.input.val()
              .replace(/^C:\\fakepath\\/, ''));
            s.submit.click(uploadNow);
          } else {
            uploadNow();
          }
        });

        s.input.click();
      });
    });
  }

  getPath = () => {
    // only upload to definitive paths
    let path = [
      this.activeView.lesson.id > 0 ? this.lessons[this.activeView.lesson.id].path : '',
      this.activeView.exercise.id > 0 ? this.exercises[this.activeView.exercise.id].path : '',
      this.activeView.page.id > 0 ? this.pages[this.activeView.page.id].path : ''
    ];
    _.pull(path, '');
    return path.join('/');
  }

  removeLesson = (id) => {
    if (this.pages[this.activeView.page.id] && this.pages[this.activeView.page.id].exercise.lesson.id === id) {
      this.activeView.page.id = 0;
    }

    if (this.exercises[this.activeView.exercise.id] && this.exercises[this.activeView.exercise.id].lesson.id === id) {
      this.activeView.exercise.id = 0;
    }

    if (this.activeView.lesson.id === id) {
      this.activeView.lesson.id = 0;
    }

    this.pages = _.omitBy(this.pages, (v, k) => {
      return v.exercise.lesson.id === id;
    });

    this.exercises = _.omitBy(this.exercises, (v, k) => {
      return v.lesson.id === id;
    });

    delete this.lessons[id];
  }

  removeExercise = (id) => {
    if (this.pages[this.activeView.page.id] && this.pages[this.activeView.page.id].exercise.id === id) {
      this.activeView.page.id = 0;
    }

    if (this.activeView.exercise.id === id) {
      this.activeView.exercise.id = 0;
    }

    this.pages = _.omitBy(this.pages, (v, k) => {
      return v.exercise.id === id;
    });

    delete this.exercises[id];
  }

  removePage = (id) => {
    if (this.activeView.page.id === id) {
      this.activeView.page.id = 0;
    }

    delete this.pages[id];
  }

  hideMessages = () => {
    $('.message').each((index, item) => {
      if ($(item).is(':visible')) {
        $(item).transition('fade');
      }
    });
  }

  showMessage = (type, msg) => {
    $(`#${type}-message>span`).text(msg);
    if (!$(`#${type}-message`).is(':visible')) {
      $(`#${type}-message`).transition('fade');
    }
  }

  loadOptions = (line) => {
    let target, cmd, tag, def;

    if (/^show text/.test(line)) {
      target = $('wat-pedit-module-text');
      cmd = 'show text';
      def = this.peditDefaults.text;
    } else if (/^show directions/.test(line)) {
      target = $('wat-pedit-module-directions');
      cmd = 'show directions';
      def = this.peditDefaults.directions;
    } else if (/^hide/.test(line)) {
      target = $('wat-pedit-module-hide');
      cmd = 'hide';
      def = this.peditDefaults.hide;
    } else if (/^pause/.test(line)) {
      // target = $('wat-pedit-module-pause');
      // cmd = 'pause';
      // def = PEdit.PauseModule.defaults;
    } else if (/^wait/.test(line)) {
      target = $('wat-pedit-module-wait');
      cmd = 'wait';
      def = this.peditDefaults.wait;
    } else if (/^play/.test(line)) {
      target = $('wat-pedit-module-play');
      cmd = 'play';
      def = this.peditDefaults.play;
    } else if (/^record/.test(line)) {
      target = $('wat-pedit-module-record');
      cmd = 'record';
      def = this.peditDefaults.record;
    } else if (/^expect Q&A submission/.test(line)) {
      target = $('wat-pedit-module-qna');
      cmd = 'expect Q&A submission';
      def = this.peditDefaults.qna;
    } else {
      def = {};
    }

    this.editor.line.cmd = cmd;
    const matches = line.match(/@\w+\s*$/g);
    tag = _.isNull(matches) ? null : matches[0].replace(/^@/g, '').trim();
    this.editor.line.tag = tag;
    this.editor.line.data = _.has(this.editor.page.data, tag)
      ? this.editor.page.data[tag]
      : _.clone(def)
  }

  peditDefaults = {
    directions: {
      'directions': ''
    }, hide: {
      'element': ''
    }, play: {
      'name': '',
      'path': ''
    },
    qna: {
      'type': 0,
      'question': '',
      'answer': '',
      'choices': [{
        'isCorrect': true,
        'value': ''
      }]
    },
    record: {
      'isFixed': true,
      'length': 0,
      'length-var': '',
      'length-multiplier': 1
    },
    text: {
      'mode': '',
      'text': [],
      'image': { name: '', path: '' },
      'video': { name: '', path: '', isWaveform: false }
    },
    wait: {}
  };

  showDimmer = (msg = 'Please wait...') => {
    $('#page-wait-dimmer .loader').text(msg);
    $('#page-wait-dimmer').dimmer('show');
  }

  hideDimmer = () => {
    $('#page-wait-dimmer').dimmer('hide');
  }

}
