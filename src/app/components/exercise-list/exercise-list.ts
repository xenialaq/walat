import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-exercise-list',
  templateUrl: 'exercise-list.html'
})
export class ExerciseListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('#collection-add').click(() => {
      $('#collection-add-modal').modal('show');
    });

    $('#collection-add-modal button[type="submit"]').click(() => {
      $('#collection-add').api({
        action: 'post exercise',
        on: 'now',
        method: 'post',
        data: JSON.stringify({
          "id": 0,
          "name": $('#collection-add-modal input[name="name"]').val(),
          "path": $('#collection-add-modal input[name="description"]').val(),
          "lesson": this.service.editor.lesson.id
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          console.log('posted')
        }
      });
    });


  }
}
