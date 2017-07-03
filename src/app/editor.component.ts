import { Component, AfterViewInit } from '@angular/core';

import { Question, Exercise, Lesson, Asset } from './models/models';
import { AppComponentService } from './services/services';

@Component({
  selector: 'editor-view',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements AfterViewInit {
  public lessons: number[];
  public lesson: Lesson;
  public exercices: number[];
  public exercice: Exercise;
  public questions: number[];
  public question: Question;

  constructor(private service: AppComponentService) {
    //this.exercice = new Exercise("name", "path");
    //this.question = new Question("name", "path");
  }

  ngAfterViewInit() {
    let uri = new URI(window.location.href);
    let queryObj = uri.search(true);
    let lessonId = parseInt(queryObj.lid, 10);


    $.api({
      action: 'get lesson by ID',
      on: 'now',
      urlData: {
        id: lessonId
      },
      onResponse: (response) => {
        // make some adjustments to response
        this.lesson = new Lesson(response.id, response.name, response.path);
        $('#treelist').data('id', response.id);

        // get exercises
        this.service.addExercisesToView();
      }
    });

    this.service.editor = this;

    setInterval(() => {
      console.log(this.question);
    }, 5000);
  }
}
