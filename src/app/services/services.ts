import {Component, Injectable} from '@angular/core';

import { Question, Exercise, Lesson, Asset } from '../models/models';

@Injectable()
export class AppComponentService {
  public editor: any;

  constructor() {
  }

  addExercisesToView = () => {
    $('#treelist').empty();
    // get questions
    $(`#treelist`).api({
      action: 'get exercises',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((id) => {
          this.addExerciseToView(id);
        });
      }
    });
  }

  addExerciseToView = (id) => {
    $('#treelist').append(`
        <div class="item" id="treelist-e-${id}">
          <i class="folder outline icon"></i>
          <div class="content">
            <a class="header"></a>
            <div class="description"></div>
          </div>
        </div>`);

    $(`#treelist-e-${id}`).data('id', id);

    $(`#treelist-e-${id}`).api({
      action: 'get exercise by ID',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        $(`#treelist-e-${id}>.content>.header`).text(response.name);
        $(`#treelist-e-${id}>.content>.description`).text(response.path);

        $(`#treelist-e-${id}>.content>.header`).click(() => {
          this.editor.exercise = new Exercise(response.id, response.name, response.path);
          this.addQuestionsToView(id);
        });
      }
    });
  }

  addQuestionsToView = (eid) => {
    if ($(`#treelist-e-${eid}>.list`).length > 0) {
      $(`#treelist-e-${eid}>.list`).empty();
    } else {
      $(`#treelist-e-${eid}`).append('<div class="list"></div>');
    }

    // get questions
    $(`#treelist-e-${eid}`).api({
      action: 'get questions',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        _.values(response).forEach((id) => {
          this.addQuestionToView(eid, id);
        });
      }
    });
  }

  addQuestionToView = (eid, id) => {
    if ($(`#treelist-e-${eid}>.list`).length > 0) {
      $(`#treelist-e-${eid}>.list`).empty();
    } else {
      $(`#treelist-e-${eid}`).append('<div class="list"></div>');
    }

    $(`#treelist-e-${eid}>.list`).append(`
        <div class="item" id="treelist-q-${id}">
          <i class="comment outline icon"></i>
          <div class="content">
            <a class="header"></a>
            <div class="description"></div>
          </div>
        </div>`);

    $(`#treelist-q-${id}`).data('id', id);

    $(`#treelist-q-${id}`).api({
      action: 'get question by ID',
      on: 'now',
      onResponse: (response) => {
        // make some adjustments to response
        $(`#treelist-q-${id}>.content>.header`).text(response.name);
        $(`#treelist-q-${id}>.content>.description`).text(response.path);

        $(`#treelist-q-${id}>.content>.header`).click(() => {
          this.editor.question = new Question(response.id, response.name, response.path);
          this.loadQuestion(id);
        });
      }
    });
  }

  loadQuestion = (id) => {
    $('wat-breadcrumb .breadcrumb>a:eq(0)').text(this.editor.lesson.name);
    $('wat-breadcrumb .breadcrumb>a:eq(1)').text(this.editor.exercise.name);
    $('wat-breadcrumb .breadcrumb>div:eq(0)').text(this.editor.question.name);
  }
}
