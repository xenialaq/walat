import { Component, AfterViewInit } from '@angular/core';

import { Question, Exercise, Lesson, Asset } from './models/models';
import { AppComponentService } from './services/services';

@Component({
  selector: 'editor-view',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
    this.service.editor = this;
  }

  ngAfterViewInit() {
    this.service.setBreadCrumb([], 'untitled', '');

    let uri = new URI(window.location.href);
    let queryObj = uri.search(true);
    let lessonId = parseInt(queryObj.lid, 10);

    if (_.isNaN(lessonId)) {
      lessonId = 0;
    }

    $('#exercise-list').data('id', lessonId);

    this.service.initLessonData(lessonId, '#exercise-list', () => {
      this.service.addExercisesToEditorView();
    });

    setInterval(() => {
      console.log(this.service.question);
    }, 5000);

    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
