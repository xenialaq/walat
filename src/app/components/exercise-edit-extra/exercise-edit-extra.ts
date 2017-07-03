import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-exercise-edit-extra',
  templateUrl: 'exercise-edit-extra.html'
})
export class ExerciseEditExtraComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('textarea[name="directions"]').change(() => {
      this.service.editor.question.directions = $(event.currentTarget).val();
    });
    $('textarea[name="notes"]').change(() => {
      this.service.editor.question.notes = $(event.currentTarget).val();
    });
    $('textarea[name="script"]').change(() => {
      this.service.editor.question.script = $(event.currentTarget).val();
    });
  }
}
