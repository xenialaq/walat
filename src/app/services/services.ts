import {Component, Injectable, ElementRef} from '@angular/core';

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
    `show text @text \nshow directions @directions \nplay \nhide text \nshow directions @directions \nwait`,
    `show text @text \nshow directions @directions \nwait \nrecord @duration \nhide text \nshow directions @directions \nwait`,
    `show text @content \nshow directions @dir \nplay @sound \nwait \nrecord @duration \nhide @element \nshow directions @directions \nwait`
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

  public library = {
    lesson: { id: 0, data: {} },
    exercise: { id: 0, data: {} },
    page: { id: 0, data: { /* field: value */ } }
  };



  constructor() {
    this.initLessons();

    setInterval(() => {
      console.log('lessons', this.lessons);
      console.log('exercises', this.exercises);
      console.log('pages', this.pages);
      console.log('editor', this.editor);
    }, 10000);
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

        this.editor.lesson.id = lessonId;
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

  // /**
  //  * Initializes lesson data for an endpoint.
  //  * @param  {[type]} selector [Selector to bind the ID]
  //  * @param  {[type]} callback [Callback function]
  //  * @return {[type]}          [description]
  //  */
  // initLessonData = (id, selector, callback = undefined) => {
  //   let apiCaller = $(selector);
  //
  //   apiCaller.data('id', id);
  //
  //   apiCaller.api({
  //     action: 'get lesson by ID',
  //     on: 'now',
  //     onResponse: (response) => {
  //       // make some adjustments to response
  //       this.lesson = new Lesson(response.id, response.name, response.path);
  //       if (callback) {
  //         callback(response);
  //       }
  //     }
  //   });
  // }

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

    // $('#lessons>tbody').html(`
    //   <tr class="placeholder">
    //     <td colspan="7" class="center aligned single line">
    //       Add a lesson via <i class="plus icon"></i>
    //     </td>
    //   </tr>`);
    // // get pages
    // $('#lessons').api({
    //   action: 'get lessons',
    //   on: 'now',
    //   onResponse: (response) => {
    //     // make some adjustments to response
    //     _.values(response).forEach((d) => {
    //       this.addLessonToDashboardView(d);
    //     });
    //   }
    // });
  }
  //
  // /**
  //  * Renders a lesson object to the dashboard table view.
  //  * @param  {[type]} '#lessons>tbody' [description]
  //  * @return {[type]}                  [description]
  //  */
  // addLessonToDashboardView = (d) => {
  //   $('#lessons>tbody>tr.placeholder').remove();
  //   const id = d.id;
  //   $('#lessons>tbody').append(`
  //     <tr id="lesson-l-${id}">
  //       <td>
  //         <div class="ui checkbox">
  //           <input type="checkbox"> <label></label>
  //         </div>
  //       </td>
  //       <td class="center aligned">
  //         ${id}
  //       </td>
  //       <td class="single line">
  //         <a href="/editor?lid=${id}">${d.name}</a>
  //       </td>
  //       <td class="center aligned">
  //         ${d.path}
  //       </td>
  //       <td class="center aligned">
  //         <a class="ui olive label">Planning</a>
  //       </td>
  //       <td class="center aligned">
  //         <a class="ui basic image label">
  //           <img src="/assets/avatar/3.png">
  //           <span>Alex</span>
  //         </a>
  //       </td>
  //       <td class="center aligned">
  //         <a href="/library?lid=${id}" class="ui label">Assets</a>
  //       </td>
  //     </tr>`);
  // }
  //
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

        console.log(this.exercises)

        this.initPages(d.id);
      }
    });
    // $('#exercise-list').html(`
    //   <div class="item placeholder">
    //     <div class="content">
    //       <div class="subheader">
    //         Add exercises to this lesson via
    //         <i class="folder outline icon"></i>
    //       </div>
    //     </div>
    //   </div>`);
    //
    // $('#page-create').hide();
    // $('#collection-edit').hide();
    // $('#collection-delete').hide();
    //
    // // get exercises
    // $(`#exercise-list`).api({
    //   action: 'get exercises',
    //   on: 'now',
    //   onResponse: (response) => {
    //     // make some adjustments to response
    //     _.values(response).forEach((d) => {
    //       this.addExerciseToEditorView(d);
    //     });
    //   }
    // });
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

  //
  // /**
  //  * Renders an exercise object to the editor tree view.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addExerciseToEditorView = (d) => {
  //   const id = d.id;
  //   $('#exercise-list>.item.placeholder').remove();
  //
  //   $('#exercise-list').append(`
  //     <div class="item" id="exercise-list-e-${id}">
  //       <i class="folder outline icon"></i>
  //       <div class="content">
  //         <a class="header">${d.name}</a>
  //         <div class="description">${d.path}</div>
  //       </div>
  //     </div>`);
  //
  //   $(`#exercise-list-e-${id}`).data('id', id);
  //
  //
  //   $(`#exercise-list-e-${id}>.content>.header`).click(() => {
  //     $(`#exercise-list>.item>.list>.item`).removeClass('active');
  //     $(`#exercise-list>.item`).removeClass('active');
  //     $(`#exercise-list-e-${id}`).addClass('active');
  //
  //     $('#page-create').show();
  //     $('#collection-edit').show();
  //     $('#collection-delete').show();
  //
  //     this.exercise = new Exercise(id, d.name, d.path);
  //
  //     // TODO: skip GET if hides expanded list
  //     this.addPagesToEditorView(id);
  //     // Can create page, not save it unless entering an exercise
  //     $('.q-save-button').removeClass('disabled');
  //   });Exercise
  // }
  //
  // /**
  //  * Gets a list of exercises and renders the data to library.
  //  * @param  {[type]} `#exercise-list` [description]
  //  * @return {[type]}             [description]
  //  */
  // addExercisesToLibraryView = () => {
  //   $('#exercise-list').html(`
  //     <div class="item placeholder">
  //       <div class="content">
  //         <div class="subheader">
  //           No exercises under this lesson
  //         </div>
  //       </div>
  //     </div>`);
  //
  //   // get exercises
  //   $(`#exercise-list`).api({
  //     action: 'get exercises',
  //     on: 'now',
  //     onResponse: (response) => {
  //       // make some adjustments to response
  //       _.values(response).forEach((d) => {
  //         this.addExerciseToLibraryView(d);
  //       });
  //     }
  //   });
  // }
  //
  // /**
  //  * Renders an exercise object to the library tree view.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addExerciseToLibraryView = (d) => {
  //   const id = d.id;
  //   $('#exercise-list>.item.placeholder').remove();
  //
  //   $('#exercise-list').append(`
  //     <div class="item" id="exercise-list-e-${id}">
  //       <i class="folder outline icon"></i>
  //       <div class="content">
  //         <a class="header">${d.name}</a>
  //         <div class="description">${d.path}</div>
  //       </div>
  //     </div>`);
  //
  //   $(`#exercise-list-e-${id}`).data('id', id);
  //
  //   $(`#exercise-list-e-${id}>.content>.header`).click(() => {
  //     $(`#exercise-list>.item>.list>.item`).removeClass('active');
  //     $(`#exercise-list>.item`).removeClass('active');
  //     $(`#exercise-list-e-${id}`).addClass('active');
  //     // header should update for assets
  //     this.setBreadCrumb([this.lesson.name], d.name, '');
  //
  //     this.exercise = new Exercise(id, d.name, d.path);
  //
  //     this.loadAssets(this.getEditorPath());
  //
  //     // TODO: skip GET if hides expanded list
  //     this.addPagesToLibraryView(id);
  //   });
  // }
  //
  // /**
  //  * Gets a list of pages and renders the data to editor.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addPagesToEditorView = (eid) => {
  //   $('#page-list').html(`
  //     <div class="item placeholder">
  //       <div class="content">
  //         <div class="subheader">
  //           Add pages to this exercise via
  //           <i class="cicle icon"></i>
  //         </div>
  //       </div>
  //     </div>`);
  //
  //   // get pages
  //   $(`#exercise-list-e-${eid}`).api({
  //     action: 'get pages',
  //     on: 'now',
  //     onResponse: (response) => {
  //       // make some adjustments to response
  //       _.values(response).forEach((d) => {
  //         this.addPageToEditorView(eid, d);
  //       });
  //     }
  //   });
  // }
  //
  // /**
  //  * Renders a page object to the editor tree view.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addPageToEditorView = (eid, d) => {
  //   const id = d.id;
  //   $('#page-list>.item.placeholder').remove();
  //
  //
  //   $(`#page-list-q-${id}`).remove(); // If updated
  //
  //   $(`#page-list`).append(`
  //     <div class="item" id="page-list-q-${id}">
  //       <i class="circle thin icon"></i>
  //       <div class="content">
  //         <a class="header">${d.name}</a>
  //         <div class="description">${d.path}</div>
  //       </div>
  //     </div>`);
  //
  //   $(`#page-list-q-${id}`).data('id', id);
  //
  //   $(`#page-list-q-${id}>.content>.header`).click(() => {
  //     $(`#page-list>.item>.list>.item`).removeClass('active');
  //     $(`#page-list>.item`).removeClass('active');
  //     $(`#page-list-q-${id}`).addClass('active');
  //     this.setBreadCrumb([this.lesson.name, this.exercise.name], d.name, '');
  //
  //     $('#collection-delete').show();
  //
  //     this.page = new Page(id, d.name, d.path);
  //     this.loadPage(d);
  //   });
  // }


  // /**
  //  * Gets a list of pages and renders the data to library.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addPagesToLibraryView = (eid) => {
  //   $(`#page-list`).html(`
  //     <div class="item placeholder">
  //       <div class="content">
  //         <div class="subheader">
  //           No pages under this exercise
  //         </div>
  //       </div>
  //     </div>`);
  //
  //   // get pages
  //   $(`#page-list`).api({
  //     action: 'get pages',
  //     on: 'now',
  //     onResponse: (response) => {
  //       // make some adjustments to response
  //       _.values(response).forEach((d) => {
  //         this.addPageToLibraryView(eid, d);
  //       });
  //     }
  //   });
  // }
  //
  // /**
  //  * Renders a page object to the library tree view.
  //  * @param  {[type]} '#page-create' [description]
  //  * @return {[type]}                    [description]
  //  */
  // addPageToLibraryView = (eid, d) => {
  //   const id = d.id;
  //   $('#page-list>.item.placeholder').remove();
  //
  //   $(`#page-list`).append(`
  //     <div class="item" id="page-list-q-${id}">
  //       <i class="circle thin icon"></i>
  //       <div class="content">
  //         <a class="header">${d.name}</a>
  //         <div class="description">${d.path}</div>
  //       </div>
  //     </div>`);
  //
  //   $(`#page-list-q-${id}`).data('id', id);
  //
  //   $(`#page-list-q-${id}>.content>.header`).click(() => {
  //     $(`#page-list>.item>.list>.item`).removeClass('active');
  //     $(`#page-list>.item`).removeClass('active');
  //     $(`#page-list-q-${id}`).addClass('active');
  //     this.setBreadCrumb([this.lesson.name, this.exercise.name], d.name, '');
  //
  //     this.page = new Page(id, d.name, d.path);
  //
  //     this.loadAssets(this.getEditorPath());
  //   });
  // }
  //
  // /**
  //  * Renders a page object to the editor main view.
  //  * @param  {[type]} $('editor-view.message' [description]
  //  * @return {[type]}                         [description]
  //  */
  // loadPage = (data) => {
  //   this.hideMessages();
  //
  //   // Set page
  //
  //   this.page.events_t = data.events_t;
  //   if (data.template_fields) {
  //     // not undefined
  //     _.toPairsIn(JSON.parse(data.template_fields)).forEach((e) => {
  //       this.page.template_fields.set(e[0], e[1]);
  //     });
  //   }
  //
  //   this.page.content_t = data.content_t;
  //   if (data.content_fields) {
  //     // not undefined
  //     _.toPairsIn(JSON.parse(data.content_fields)).forEach((e) => {
  //       this.page.content_fields[this.content_index].set(e[0], e[1]);
  //     });
  //   }
  //
  //   this.page.directions = data.directions;
  //   this.page.notes = data.notes;
  //   this.page.script = data.script;
  //
  //   let q = this.page;
  //
  //   // Set recording mode
  //   let modeset = false;
  //   $('wat-pedit-events-picker>div>.card').each((i, e) => {
  //     if ($(e).attr('data-mode') === q.events_t) {
  //       $(e).click();
  //       modeset = true;
  //     }
  //   });
  //
  //   if (modeset) {
  //     if (q.events_t.includes('record')) {
  //       if (q.template_fields.get('isFixed') === true) {
  //         $('#use-record-fixed').click();
  //         $('#record-fixed input[name="length"]').val(
  //           q.template_fields.get('length')
  //         );
  //       } else {
  //         $('#use-record-variable').click();
  //
  //         $('#record-variable-dropdown').dropdown(
  //           'set selected', q.template_fields.get('length')
  //         );
  //
  //         $('#record-variable input[name="multiplier"]').val(
  //           q.template_fields.get('length-multiplier')
  //         );
  //
  //       }
  //     }
  //
  //     if (q.events_t.includes('listen')) {
  //       if (q.template_fields.get('sound-name')) {
  //         $('#asset-name').val(q.template_fields.get('sound-name'));
  //         $('#asset-name').data('id', q.template_fields.get('sound-id'));
  //         $('#use-asset').click();
  //       }
  //     }
  //   }
  //
  //   // Set template
  //   modeset =Exercise false;
  //   $('wat-pedit-content-picker>div>.card').each((i, e) => {
  //     if ($(e).attr('data-mode') === q.content_t) {
  //       $(e).click();
  //       modeset = true;
  //     }
  //   });
  //
  //   if (modeset) {
  //     if (q.content_t.includes('text')) {
  //       this.quill.setContents(q.content_fields[this.content_index].get('text'));
  //     }
  //     if (q.content_t.includes('slide')) {
  //       if (q.template_fields.get('slide-name')) {
  //         $('#asset-slide-name').val(q.template_fields.get('slide-name'));
  //         $('#asset-slide-name').data('id', q.template_fields.get('slide-id'));
  //         $('#use-asset-slide').click();
  //       }
  //     }
  //     if (q.content_t.includes('video')) {
  //       if (q.template_fields.get('video-name')) {
  //         $('#asset-video-name').val(q.template_fields.get('video-name'));
  //         $('#asset-video-name').data('id', q.template_fields.get('video-id'));
  //         $('#use-asset-video').click();
  //       }
  //     }
  //     if (q.content_t.includes('page')) {
  //       let qnaType = q.content_fields[this.content_index].get('qna-type');
  //       $('wat-pedit-module-qna>.field:eq(0)>.dropdown').dropdown('set selected', qnaType);
  //
  //       $(`.q-option:eq(${qnaType})>.field>textarea[name="page"]`).val(q.content_fields[this.content_index].get('qna-page'));
  //       $(`.q-option:eq(${qnaType})>.field>textarea[name="key"]`).val(q.content_fields[this.content_index].get('qna-key'));
  //
  //       if (qnaType === '2') {
  //         this.qna.setChoices(q.content_fields[this.content_index].get('qna-mc'));
  //       }
  //     } else if (q.content_t.includes('waveform')) {
  //
  //     }
  //   }
  //
  //   // Set extras
  //
  //   $('wat-pedit-extra textarea[name="directions"]').val(this.page.directions);
  //   $('wat-pedit-extra textarea[name="notes"]').val(this.page.notes);
  //   $('wat-pedit-extra textarea[name="script"]').val(this.page.script);
  // }
  //
  //
  // /**
  //  * Gets a list of assets with the same three-part basename and renders the data to library.
  //  * @param  {[type]} path [description]
  //  * @param  {[type]} ''   [description]
  //  * @return {[type]}      [description]
  //  */
  // loadAssets = (basepath = '') => {
  //   this.hideMessages();
  //
  //   $('#assets').empty();
  //   // get assets
  //   $('#assets').api({
  //     action: 'get assets',
  //     on: 'now',
  //     data: {
  //       "path": basepath
  //     },
  //     contentType: 'application/json',
  //     onResponse: (response) => {
  //       // make some adjustments to response
  //       _.values(response).forEach((d) => {
  //         this.loadAsset(d);
  //       });
  //     }
  //   });
  // }
  //

  //
  // /**
  //  * Sets breadcrumb or page header.
  //  * @param  {[type]} links.length===0 [description]
  //  * @return {[type]}                  [description]
  //  */
  // setBreadCrumb = (links, header, subheader) => {
  //   if (links.length === 0) {
  //     $('.ui.breadcrumb').hide();
  //     $('wat-breadcrumb>.segment>.header>.sub.header>span').show();
  //
  //     $('wat-breadcrumb>.segment>.header>.sub.header>span').text(subheader);
  //   } else {
  //     $('.ui.breadcrumb .divider').text('');
  //
  //     $('.ui.breadcrumb').show();
  //     $('wat-breadcrumb>.segment>.header>.subheader>span').hide();
  //
  //     if (links.length === 1) {
  //       $('.ui.breadcrumb .section:eq(1)').text(links[0]);
  //       $('.ui.breadcrumb .divider').hide();
  //     } else if (links.length === 2) {
  //       $('.ui.breadcrumb .section:eq(0)').text(links[0]);
  //       $('.ui.breadcrumb .section:eq(1)').text(links[1]);
  //       $('.ui.breadcrumb .divider').text(' / ');
  //     }
  //   }
  //
  //   $('wat-breadcrumb>.segment>.header>span').text(header);
  // }

  bindUploaders = (uploaders) => {
    uploaders.forEach((s) => {
      s.trigger.click(() => {
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
            url: '/uploader',
            data: data,
            method: 'POST',
            processData: false,
            contentType: false,
            success: (data) => {
              s.input.val('');
              if (s.callback) {
                s.callback(data);
              }
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

  getEditorPath = () => {
    // only upload to definitive paths
    let path = [
      this.editor.lesson.id > 0 ? this.lessons[this.editor.lesson.id].path : '',
      this.editor.exercise.id > 0 ? this.exercises[this.editor.exercise.id].path : '',
      this.editor.page.id > 0 ? this.pages[this.editor.page.id].path : ''
    ];
    _.pull(path, '');
    return path.join('/');
  }

  getLibraryPath = () => {
    // only upload to definitive paths
    let path = [
      this.library.lesson.id > 0 ? this.lessons[this.library.lesson.id].path : '',
      this.library.exercise.id > 0 ? this.exercises[this.library.exercise.id].path : '',
      this.library.page.id > 0 ? this.pages[this.library.page.id].path : ''
    ];
    _.pull(path, '');
    return path.join('/');
  }

  removeLesson = (id) => {
    if (this.pages[this.editor.page.id] && this.pages[this.editor.page.id].exercise.lesson.id === id) {
      this.editor.page.id = 0;
    }

    if (this.exercises[this.editor.exercise.id] && this.exercises[this.editor.exercise.id].lesson.id === id) {
      this.editor.exercise.id = 0;
    }

    if (this.editor.lesson.id === id) {
      this.editor.lesson.id = 0;
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
    if (this.pages[this.editor.page.id] && this.pages[this.editor.page.id].exercise.id === id) {
      this.editor.page.id = 0;
    }

    if (this.editor.exercise.id === id) {
      this.editor.exercise.id = 0;
    }

    this.pages = _.omitBy(this.pages, (v, k) => {
      return v.exercise.id === id;
    });

    delete this.exercises[id];
  }

  removePage = (id) => {
    if (this.editor.page.id === id) {
      this.editor.page.id = 0;
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
    $('wat-pedit-events-picker').hide();

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
      'length-var': 0,
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

}
