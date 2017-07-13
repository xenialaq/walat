import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-exercise-list',
  templateUrl: 'index.html'
})
export class CollectionListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('#exercise-create').click(() => {
      $('#collection-create-modal').data('pid', this.service.lesson.id);

      $('.collection-action-type').text('an exercise');

      $('#collection-create-modal input[name="name"]').val('');
      $('#collection-create-modal input[name="cname"]').val('');

      $('#collection-create-modal').modal('show');
    });

    $('#question-create').click(() => {
      $('#collection-create-modal').data('pid', this.service.exercise.id);

      $('.collection-action-type').text('a question');

      $('#collection-create-modal input[name="name"]').val('');
      $('#collection-create-modal input[name="cname"]').val('');

      $('#collection-create-modal').modal('show');
    });

    $('#collection-edit').click(() => {
      let id = 0;
      let pid = 0;
      let name = '';
      let path = '';

      if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
        // Edit exercise
        id = this.service.exercise.id;
        pid = this.service.lesson.id;
        name = this.service.exercise.name;
        path = this.service.exercise.path;
      } else if ($('.collection-action-type:eq(0)').text() === 'a question') {
        // Edit question
        id = this.service.question.id;
        pid = this.service.exercise.id;
        name = this.service.question.name;
        path = this.service.question.path;
      } else {
        return;
      }

      $('#collection-edit-modal').data('id', id);
      $('#collection-edit-modal').data('pid', pid);

      $('#collection-edit-modal input[name="name"]').val(name);
      $('#collection-edit-modal input[name="cname"]').val(path);

      $('#collection-edit-modal').modal('show');
    });

    $('#collection-delete').click(() => {
      let id = 0;
      let name = '';
      if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
        // Delete exercise
        id = this.service.exercise.id;
        name = this.service.exercise.name;
      } else if ($('.collection-action-type:eq(0)').text() === 'a question') {
        // Delete question
        id = this.service.question.id;
        name = this.service.question.name;
      } else {
        return;
      }
      $('#collection-delete-modal').data('id', id);

      $('#collection-delete-modal .name-check').text(name);

      $('#collection-delete-modal input[name="name"]').val('');
      $('#collection-delete-modal input[name="cname"]').val('');

      $('#collection-delete-modal').modal('show');
    });

    $('#collection-create-modal button[name="create"]').click((event) => {
      // type can either be lesson | exercise | question
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
          "lesson": $('#collection-create-modal').data('pid'), // either
          "exercise": $('#collection-create-modal').data('pid') // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-create-modal').modal('hide');
          if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
            this.service.addExercisesToEditorView();
          } else {
            this.service.addQuestionsToEditorView(this.service.exercise.id);
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
          "lesson": $('#collection-edit-modal').data('pid'), // either
          "exercise": $('#collection-edit-modal').data('pid') // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-edit-modal').modal('hide');
          if ($('.collection-action-type:eq(0)').text() === 'an exercise') {
            this.service.addExercisesToEditorView();
          } else {
            this.service.addQuestionsToEditorView(this.service.exercise.id);
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
            this.service.addExercisesToEditorView();
          } else {
            this.service.addQuestionsToEditorView(this.service.exercise.id);
          }
        }
      });
    });
  }
}
