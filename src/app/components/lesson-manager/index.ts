import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

import { Page, Exercise, Lesson, Asset } from '../../models/models';

import * as _ from 'lodash';

@Component({
  selector: 'wat-lesson-manager',
  templateUrl: 'index.html'
})
export class LessonManager implements AfterViewInit {
  _ = _;
  Cookies = Cookies;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $(this.e.nativeElement).find('.dropdown').dropdown();

    $('#lesson-add').click(() => {
      $('.collection-action-type').text('a lesson');

      $('#collection-create-modal input[name="name"]').val('');
      $('#collection-create-modal input[name="cname"]').val('');

      $('#collection-create-modal').modal('show');
    });

    $('#lesson-delete').click(() => {
      // Delete lesson
      // $('#collection-delete-modal').data('id', this.service.lesson.name);

      $('.collection-action-type').text('a lesson');
      // $('#collection-delete-modal .name-check').text(this.service.lesson.name);

      $('#collection-delete-modal input[name="name"]').val('');
      $('#collection-delete-modal input[name="cname"]').val('');

      $('#collection-delete-modal').modal('show');
    });

    $('#lesson-edit').click(() => {
      // $('#collection-edit-modal').data('id', this.service.lesson.id);

      $('.collection-action-type').text('a lesson');

      // $('#collection-edit-modal input[name="name"]').val(this.service.lesson.name);
      //   $('#collection-edit-modal input[name="cname"]').val(this.service.lesson.path);

          $('#collection-edit-modal').modal('show');
    });

    $('#collection-create-modal button[name="create"]').click((event) => {
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
          "lesson": this.service.editor.lesson.id, // either
          "exercise": this.service.editor.exercise.id // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-create-modal').modal('hide');

          this.service.initLesson(response.id);
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
          "lesson": this.service.editor.lesson.id, // either
          "exercise": this.service.editor.exercise.id // not both
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-edit-modal').modal('hide');

          this.service.initLesson(response.id);
        }
      });
    });

    $('#collection-delete-modal button[name="delete"]').click((event) => {
      if (!$('#collection-delete-form').form('is valid')) {
        // form is not valid (both name and cname)
        return;
      }

      $(event.currentTarget).data('id', $('#collection-edit-modal').data('id'));
      $(event.currentTarget).api({
        action: 'delete ' + $('.collection-action-type:eq(0)').text(),
        on: 'now',
        method: 'delete',
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          $('#collection-create-modal').modal('hide');

          // this.service.addLessonsToDashboardView();
        }
      });
    });

    // this.service.addLessonsToDashboardView();
  }
}
