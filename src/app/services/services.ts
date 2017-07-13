import {Component, Injectable, ViewChild} from '@angular/core';

import { Question, Exercise, Lesson, Asset } from '../models/models';

import { QEditQnaComponent } from '../components/qedit/qna';

@Injectable()
export class AppComponentService {
  public editor: any;
  public quill: any;
  public qna: any;

  public lessons: number[];
  public lesson: Lesson;
  public exercises: number[];
  public exercise: Exercise;
  public questions: number[];
  public question: Question;

  public readonly eventsFields = {
    'listen': ['sound-id', 'sound-name'],
    'record': ['isFixed', 'length', 'length-multiplier'],
    'listen, record': ['sound-id', 'sound-name', 'isFixed', 'length', 'length-multiplier']
  };

  public readonly contentFields = {
    'text': ['text'],
    'slide': ['slide-id', 'slide-name'],
    'video': ['video-id', 'video-name'],
    'question': ['qna-type', 'qna-question', 'qna-mc', 'qna-key'],
    'video, question': ['qna-type', 'qna-question', 'qna-mc', 'qna-key'],
    'video, waveform': ['video-id', 'video-name']
  };

  constructor() {
    this.question = new Question(0, "untitled", "untitled");
  }

  /**
   * Initializes lesson data for an endpoint.
   * @param  {[type]} selector [Selector to bind the ID]
   * @param  {[type]} callback [Callback function]
   * @return {[type]}          [description]
   */
  initLessonData = (id, selector, callback = undefined) => {
    let apiCaller = $(selector);

    apiCaller.data('id', id);

    apiCaller.api({
      action: 'get lesson by ID',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        this.lesson = new Lesson(response.id, response.name, response.path);
        if (callback) {
          callback(response);
        }
      }
    });
  }

  /**
   * Gets a list of lessons and renders the data to dashboard.
   * @param  {[type]} '#lessons' [description]
   * @return {[type]}            [description]
   */
  addLessonsToDashboardView = () => {
    $('#lessons>tbody').html(`
      <tr class="placeholder">
        <td colspan="7" class="center aligned single line">
          Add a lesson via <i class="plus icon"></i>
        </td>
      </tr>`);
    // get questions
    $('#lessons').api({
      action: 'get lessons',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.addLessonToDashboardView(d);
        });
      }
    });
  }

  /**
   * Renders a lesson object to the dashboard table view.
   * @param  {[type]} '#lessons>tbody' [description]
   * @return {[type]}                  [description]
   */
  addLessonToDashboardView = (d) => {
    $('#lessons>tbody>tr.placeholder').remove();
    const id = d.id;
    $('#lessons>tbody').append(`
      <tr id="lesson-l-${id}">
        <td>
          <div class="ui checkbox">
            <input type="checkbox"> <label></label>
          </div>
        </td>
        <td class="center aligned">
          ${id}
        </td>
        <td class="single line">
          <a href="/editor?lid=${id}">${d.name}</a>
        </td>
        <td class="center aligned">
          ${d.path}
        </td>
        <td class="center aligned">
          <a class="ui olive label">Planning</a>
        </td>
        <td class="center aligned">
          <a class="ui basic image label">
            <img src="/assets/avatar/3.png">
            <span>Alex</span>
          </a>
        </td>
        <td class="center aligned">
          <a href="/library?lid=${id}" class="ui label">Assets</a>
        </td>
      </tr>`);
  }

  /**
   * Gets a list of exercises and renders the data to editor.
   * @param  {[type]} `#exercise-list` [description]
   * @return {[type]}             [description]
   */
  addExercisesToEditorView = () => {
    $('#exercise-list').html(`
      <div class="item placeholder">
        <div class="content">
          <div class="subheader">
            Add exercises to this lesson via
            <i class="folder outline icon"></i>
          </div>
        </div>
      </div>`);

    $('#question-create').hide();
    $('#collection-edit').hide();
    $('#collection-delete').hide();

    // get exercises
    $(`#exercise-list`).api({
      action: 'get exercises',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.addExerciseToEditorView(d);
        });
      }
    });
  }

  /**
   * Renders an exercise object to the editor tree view.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addExerciseToEditorView = (d) => {
    const id = d.id;
    $('#exercise-list>.item.placeholder').remove();

    $('#exercise-list').append(`
      <div class="item" id="exercise-list-e-${id}">
        <i class="folder outline icon"></i>
        <div class="content">
          <a class="header">${d.name}</a>
          <div class="description">${d.path}</div>
        </div>
      </div>`);

    $(`#exercise-list-e-${id}`).data('id', id);


    $(`#exercise-list-e-${id}>.content>.header`).click(() => {
      $(`#exercise-list>.item>.list>.item`).removeClass('active');
      $(`#exercise-list>.item`).removeClass('active');
      $(`#exercise-list-e-${id}`).addClass('active');

      $('#question-create').show();
      $('#collection-edit').show();
      $('#collection-delete').show();

      this.exercise = new Exercise(id, d.name, d.path);

      // TODO: skip GET if hides expanded list
      this.addQuestionsToEditorView(id);
      // Can create question, not save it unless entering an exercise
      $('.q-save-button').removeClass('disabled');
    });
  }

  /**
   * Gets a list of exercises and renders the data to library.
   * @param  {[type]} `#exercise-list` [description]
   * @return {[type]}             [description]
   */
  addExercisesToLibraryView = () => {
    $('#exercise-list').html(`
      <div class="item placeholder">
        <div class="content">
          <div class="subheader">
            No exercises under this lesson
          </div>
        </div>
      </div>`);

    // get exercises
    $(`#exercise-list`).api({
      action: 'get exercises',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.addExerciseToLibraryView(d);
        });
      }
    });
  }

  /**
   * Renders an exercise object to the library tree view.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addExerciseToLibraryView = (d) => {
    const id = d.id;
    $('#exercise-list>.item.placeholder').remove();

    $('#exercise-list').append(`
      <div class="item" id="exercise-list-e-${id}">
        <i class="folder outline icon"></i>
        <div class="content">
          <a class="header">${d.name}</a>
          <div class="description">${d.path}</div>
        </div>
      </div>`);

    $(`#exercise-list-e-${id}`).data('id', id);

    $(`#exercise-list-e-${id}>.content>.header`).click(() => {
      $(`#exercise-list>.item>.list>.item`).removeClass('active');
      $(`#exercise-list>.item`).removeClass('active');
      $(`#exercise-list-e-${id}`).addClass('active');
      // header should update for assets
      this.setBreadCrumb([this.lesson.name], d.name, '');

      this.exercise = new Exercise(id, d.name, d.path);

      this.loadAssets(this.getBasePath());

      // TODO: skip GET if hides expanded list
      this.addQuestionsToLibraryView(id);
    });
  }

  /**
   * Gets a list of questions and renders the data to editor.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addQuestionsToEditorView = (eid) => {
    $('#question-list').html(`
      <div class="item placeholder">
        <div class="content">
          <div class="subheader">
            Add questions to this exercise via
            <i class="cicle icon"></i>
          </div>
        </div>
      </div>`);

    // get questions
    $(`#exercise-list-e-${eid}`).api({
      action: 'get questions',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.addQuestionToEditorView(eid, d);
        });
      }
    });
  }

  /**
   * Renders a question object to the editor tree view.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addQuestionToEditorView = (eid, d) => {
    const id = d.id;
    $('#question-list>.item.placeholder').remove();


    $(`#question-list-q-${id}`).remove(); // If updated

    $(`#question-list`).append(`
      <div class="item" id="question-list-q-${id}">
        <i class="circle thin icon"></i>
        <div class="content">
          <a class="header">${d.name}</a>
          <div class="description">${d.path}</div>
        </div>
      </div>`);

    $(`#question-list-q-${id}`).data('id', id);

    $(`#question-list-q-${id}>.content>.header`).click(() => {
      $(`#question-list>.item>.list>.item`).removeClass('active');
      $(`#question-list>.item`).removeClass('active');
      $(`#question-list-q-${id}`).addClass('active');
      this.setBreadCrumb([this.lesson.name, this.exercise.name], d.name, '');

      $('#collection-delete').show();

      this.question = new Question(id, d.name, d.path);

      this.loadQuestion(d);
    });
  }


  /**
   * Gets a list of questions and renders the data to library.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addQuestionsToLibraryView = (eid) => {
    $(`#question-list`).html(`
      <div class="item placeholder">
        <div class="content">
          <div class="subheader">
            No questions under this exercise
          </div>
        </div>
      </div>`);

    // get questions
    $(`#question-list`).api({
      action: 'get questions',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.addQuestionToLibraryView(eid, d);
        });
      }
    });
  }

  /**
   * Renders a question object to the library tree view.
   * @param  {[type]} '#question-create' [description]
   * @return {[type]}                    [description]
   */
  addQuestionToLibraryView = (eid, d) => {
    const id = d.id;
    $('#question-list>.item.placeholder').remove();

    $(`#question-list`).append(`
      <div class="item" id="question-list-q-${id}">
        <i class="circle thin icon"></i>
        <div class="content">
          <a class="header">${d.name}</a>
          <div class="description">${d.path}</div>
        </div>
      </div>`);

    $(`#question-list-q-${id}`).data('id', id);

    $(`#question-list-q-${id}>.content>.header`).click(() => {
      $(`#question-list>.item>.list>.item`).removeClass('active');
      $(`#question-list>.item`).removeClass('active');
      $(`#question-list-q-${id}`).addClass('active');
      this.setBreadCrumb([this.lesson.name, this.exercise.name], d.name, '');

      this.question = new Question(id, d.name, d.path);

      this.loadAssets(this.getBasePath());
    });
  }

  /**
   * Renders a question object to the editor main view.
   * @param  {[type]} $('editor-view.message' [description]
   * @return {[type]}                         [description]
   */
  loadQuestion = (data) => {
    this.hideMessages();

    // Set question

    this.question.events_t = data.events_t;
    if (data.events_options) {
      // not undefined
      _.toPairsIn(JSON.parse(data.events_options)).forEach((e) => {
        this.question.events_options.set(e[0], e[1]);
      });
    }

    this.question.content_t = data.content_t;
    if (data.content_options) {
      // not undefined
      _.toPairsIn(JSON.parse(data.content_options)).forEach((e) => {
        this.question.content_options.set(e[0], e[1]);
      });
    }

    this.question.directions = data.directions;
    this.question.notes = data.notes;
    this.question.script = data.script;

    let q = this.question;

    // Set recording mode
    let modeset = false;
    $('wat-qedit-events-picker>div>.card').each((i, e) => {
      if ($(e).attr('data-mode') === q.events_t) {
        $(e).click();
        modeset = true;
      }
    });

    if (modeset) {
      if (q.events_t.includes('record')) {
        if (q.events_options.get('isFixed') === true) {
          $('#use-record-fixed').click();
          $('#record-fixed input[name="length"]').val(
            q.events_options.get('length')
          );
        } else {
          $('#use-record-variable').click();

          $('#record-variable-dropdown').dropdown(
            'set selected', q.events_options.get('length')
          );

          $('#record-variable input[name="multiplier"]').val(
            q.events_options.get('length-multiplier')
          );

        }
      }

      if (q.events_t.includes('listen')) {
        if (q.events_options.get('sound-name')) {
          $('#asset-name').val(q.events_options.get('sound-name'));
          $('#asset-name').data('id', q.events_options.get('sound-id'));
          $('#use-asset').click();
        }
      }
    }

    // Set template
    modeset = false;
    $('wat-qedit-content-picker>div>.card').each((i, e) => {
      if ($(e).attr('data-mode') === q.content_t) {
        $(e).click();
        modeset = true;
      }
    });

    if (modeset) {
      if (q.content_t.includes('text')) {
        this.quill.setContents(q.content_options.get('text'));
      }
      if (q.content_t.includes('slide')) {
        if (q.events_options.get('slide-name')) {
          $('#asset-slide-name').val(q.events_options.get('slide-name'));
          $('#asset-slide-name').data('id', q.events_options.get('slide-id'));
          $('#use-asset-slide').click();
        }
      }
      if (q.content_t.includes('video')) {
        if (q.events_options.get('video-name')) {
          $('#asset-video-name').val(q.events_options.get('video-name'));
          $('#asset-video-name').data('id', q.events_options.get('video-id'));
          $('#use-asset-video').click();
        }
      }
      if (q.content_t.includes('question')) {
        let qnaType = q.content_options.get('qna-type');
        $('wat-qedit-qna>.field:eq(0)>.dropdown').dropdown('set selected', qnaType);

        $(`.q-option:eq(${qnaType})>.field>textarea[name="question"]`).val(q.content_options.get('qna-question'));
        $(`.q-option:eq(${qnaType})>.field>textarea[name="key"]`).val(q.content_options.get('qna-key'));

        if (qnaType === '2') {
          this.qna.setChoices(q.content_options.get('qna-mc'));
        }
      } else if (q.content_t.includes('waveform')) {

      }
    }

    // Set extras

    $('wat-qedit-extra textarea[name="directions"]').val(this.question.directions);
    $('wat-qedit-extra textarea[name="notes"]').val(this.question.notes);
    $('wat-qedit-extra textarea[name="script"]').val(this.question.script);
  }


  /**
   * Gets a list of assets with the same three-part basename and renders the data to library.
   * @param  {[type]} path [description]
   * @param  {[type]} ''   [description]
   * @return {[type]}      [description]
   */
  loadAssets = (basepath = '') => {
    this.hideMessages();

    $('#assets').empty();
    // get assets
    $('#assets').api({
      action: 'get assets',
      on: 'now',
      data: {
        "path": basepath
      },
      contentType: 'application/json',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((d) => {
          this.loadAsset(d);
        });
      }
    });
  }

  /**
   * Renders an asset object to the library cards view.
   * @param  {[type]} '#assets' [description]
   * @return {[type]}           [description]
   */
  loadAsset = (d) => {
    const id = d.id;
    // Caller is library
    $('#assets').append(`
      <div class="card" id="asset-a-${id}">
        <div class="image">
          <img src="http://lorempixel.com/400/200/sports">
        </div>
        <div class="extra">
          <table class="ui very basic table">
            <thead style="display: none;">
              <tr>
                <th class="one wide">A</th>
                <th></th>
                <th class="five wide">A</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><i class="asset-icon icon"></i></td>
                <td>
                  <span class='asset-name' style='display: block; max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
                    <a href="/library?aid=${id}">${d.name}</a>
                  </span>
                </td>
                <td>
                  <span class='asset-meta right floated'>
                    ${filesize(d.attribute.size, { round: 0 })}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`);

    $(`#asset-a-${id}`).data('id', id);

    var types = {
      'sound': 'music',
      'video': 'video',
      'image': 'image'
    };
    var colors = {
      'sound': 'blue',
      'video': 'violet',
      'image': 'teal'
    };
    $(`#asset-a-${id}`).addClass(colors[d.type]);
    $(`#asset-a-${id} .asset-icon`).addClass(types[d.type]);

    let src = '/assets/uploads/' + d.path.split('/').pop();
    if (d.type === 'image') {
      $(`#asset-a-${id} .image img`).attr('src', src);
    } else if (d.type === 'sound') {
      $(`#asset-a-${id} .image`).html(`
        <audio controls class="audio" style="width: 100%;">
          <source src="${src}" type="audio/mp3">
          <p>Your user agent does not support the HTML5 Audio element.</p>
        </video>`);
    } else if (d.type === 'video') {
      $(`#asset-a-${id} .image`).html(`
        <video controls class="video" style="width: 100%;">
          <source src="${src}" type="video/mp4">
          <p>Your user agent does not support the HTML5 Video element.</p>
        </video>`);
    }
  }

  /**
   * Sets breadcrumb or page header.
   * @param  {[type]} links.length===0 [description]
   * @return {[type]}                  [description]
   */
  setBreadCrumb = (links, header, subheader) => {
    if (links.length === 0) {
      $('.ui.breadcrumb').hide();
      $('wat-breadcrumb>.segment>.header>.subheader>span').show();

      $('wat-breadcrumb>.segment>.header>.subheader>span').text(subheader);
    } else {
      $('.ui.breadcrumb .divider').text('');

      $('.ui.breadcrumb').show();
      $('wat-breadcrumb>.segment>.header>.subheader>span').hide();

      if (links.length === 1) {
        $('.ui.breadcrumb .section:eq(1)').text(links[0]);
        $('.ui.breadcrumb .divider').hide();
      } else if (links.length === 2) {
        $('.ui.breadcrumb .section:eq(0)').text(links[0]);
        $('.ui.breadcrumb .section:eq(1)').text(links[1]);
        $('.ui.breadcrumb .divider').text(' / ');
      }
    }

    $('wat-breadcrumb>.segment>.header>span').text(header);
  }

  bindUploaders = (uploaders) => {
    uploaders.forEach((s) => {
      $(s.trigger).click(() => {
        // Unbind
        $(s.input).off('change');
        $(s.submit).off('click');

        // Extra values
        $(s.path).val(s.pvalue ? s.pvalue() : '');
        $(s.type).val(s.tvalue ? s.tvalue() : '');

        var uploadNow = () => {
          var form = $(s.input).parent('form')[0];
          var data = new FormData(form);

          if (s.onSubmit) {
            s.onSubmit();
          }

          $.ajax({
            url: '/uploader',
            data: data,
            method: 'POST',
            processData: false,
            contentType: false,
            success: (data) => {
              $(s.input).val('');
              if (s.callback) {
                s.callback(data);
              }
            }
          });
        };

        $(s.input).change(() => {
          if ($(s.input).val() === '') {
            return;
          }

          if (s.submit) {
            $(s.label).val($(s.input).val()
              .replace(/^C:\\fakepath\\/, ''));
            $(s.submit).click(uploadNow);
          } else {
            uploadNow();
          }
        });

        $(s.input).click();
      });
    });
  }

  getBasePath = () => {
    // only upload to definitive paths
    let path = [
      this.lesson && this.lesson.id > 0 ? this.lesson.path : '',
      this.exercise && this.exercise.id > 0 ? this.exercise.path : '',
      this.question && this.question.id > 0 ? this.question.path : ''
    ];
    _.pull(path, '');
    return path.join('/');
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
}
