import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-collection-manager',
  templateUrl: 'index.html'
})
export class CollectionManager implements AfterViewInit {
  _ = _;
  constructor(private service: AppService, private e: ElementRef) {
  }

  isPage = false;

  ngAfterViewInit() {
    $('#collection-create-modal button[name="create"]').click((event) => {
      // type can either be lesson | exercise | page
      if (!$('#collection-create-form').form('is valid')) {
        // form is not valid (both name and cname)
        return;
      }

      $(event.currentTarget).api({
        action: 'post ' + $('.collection-action-type:eq(0)').text(),
        on: 'now',
        method: 'post',
        data: JSON.stringify({
          "id": 0,
          "name": $('#collection-create-modal input[name="name"]').val(),
          "path": $('#collection-create-modal input[name="cname"]').val(),
          "description": $('#collection-create-modal textarea[name="description"]').val(),
          "lesson": this.service.editor.lesson.id, // either
          "exercise": this.service.editor.exercise.id // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-create-modal').modal('hide');
          if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
            this.service.initExercise(response.id);
          } else {
            this.service.initPage(response.id);
          }
        }
      });
    });

    $('#collection-edit-modal button[name="edit"]').click((event) => {
      // type can either be lesson | exercise
      if (!$('#collection-edit-form').form('is valid')) {
        // form is not valid (both name and cname)
        return;
      }

      $(event.currentTarget).api({
        action: 'put ' + $('.collection-action-type:eq(0)').text(),
        on: 'now',
        method: 'put',
        data: JSON.stringify({
          "id": $('#collection-edit-modal').data('id'),
          "name": $('#collection-edit-modal input[name="name"]').val(),
          "path": $('#collection-edit-modal input[name="cname"]').val(),
          "description": $('#collection-edit-modal textarea[name="description"]').val(),
          "lesson": this.service.editor.lesson.id, // either
          "exercise": this.service.editor.exercise.id // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-edit-modal').modal('hide');
          if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
            this.service.initExercise(response.id);
          } else {
            this.service.initPage(response.id);
          }
        }
      });
    });

    $('#collection-delete-modal button[name="delete"]').click((event) => {
      if (!$('#collection-delete-form').form('is valid')) {
        // form is not valid (both name and cname)
        return;
      }

      $(event.currentTarget).data('id', $('#collection-delete-modal').data('id'));
      $(event.currentTarget).api({
        action: 'delete ' + $('.collection-action-type:eq(0)').text(),
        on: 'now',
        method: 'delete',
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-delete-modal').modal('hide');
          if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
            this.service.removeExercise($('#collection-delete-modal').data('id'));
          } else {
            this.service.removePage($('#collection-delete-modal').data('id'));
            if (this.service.editor.page.id === 0) {
              // repurpose delete / edit because they're not hidden
              this.isPage = false;
            }
          }
        }
      });
    });
  }

  showExercise = (id) => {
    this.isPage = false;

    this.service.editor.exercise = { id: id, data: {} };

    console.log('page data is lost');

    this.service.editor.page = { id: 0, data: {} };
  }

  showPage = (id) => {
    this.isPage = true;

    this.service.editor.page = { id: id, data: {} };
  }

  getExercises = () => {
    return _.filter(_.values(this.service.exercises), (e) => {
      return e.lesson.id === this.service.editor.lesson.id;
    });
  }

  getPages = () => {
    return _.filter(_.values(this.service.pages), (e) => {
      return e.exercise.id === this.service.editor.exercise.id;
    });
  }

  createExerciseClick = () => {
    $('.collection-action-type').text('an exercise');

    $('#collection-create-modal input[name="name"]').val('');
    $('#collection-create-modal input[name="cname"]').val('');

    $('#collection-create-modal').modal('show');
  }

  createPageClick = () => {
    $('.collection-action-type').text('a page');

    $('#collection-create-modal input[name="name"]').val('');
    $('#collection-create-modal input[name="cname"]').val('');

    $('#collection-create-modal').modal('show');
  }

  editCollectionClick = () => {
    let pid = 0;
    let item;

    if (!this.isPage) {
      // Edit exercise
      item = this.service.exercises[this.service.editor.exercise.id];
      pid = item.lesson.id;
      $('.collection-action-type').text('an exercise');
      $('#collection-edit-modal .header').text('Edit an exercise');
    } else {
      // Edit page
      item = this.service.pages[this.service.editor.page.id];
      pid = item.exercise.id;
      $('.collection-action-type').text('a page');
      $('#collection-edit-modal .header').text('Edit a page');
    }

    $('#collection-edit-modal').data('id', item.id);
    $('#collection-edit-modal').data('pid', pid);

    $('#collection-edit-modal input[name="name"]').val(item.name);
    $('#collection-edit-modal input[name="cname"]').val(item.path);

    $('#collection-edit-modal').modal('show');
  }

  deleteCollectionClick = () => {
    let item;
    if (!this.isPage) {
      // Delete exercise
      item = this.service.exercises[this.service.editor.exercise.id];
      $('.collection-action-type').text('an exercise');
      $('#collection-delete-modal .header').text('Delete an exercise');
    } else {
      // Delete page
      item = this.service.pages[this.service.editor.page.id];
      $('.collection-action-type').text('a page');
      $('#collection-delete-modal .header').text('Delete a page');
    }

    $('#collection-delete-modal').data('id', item.id);

    $('#collection-delete-modal .name-check').text(item.name);


    $('#collection-delete-modal input[name="name"]').val('');
    $('#collection-delete-modal input[name="cname"]').val('');

    $('#collection-delete-modal').modal('show');
  }
}
