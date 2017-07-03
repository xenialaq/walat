import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-exercise-edit-record',
  templateUrl: 'exercise-edit-record.html'
})
export class ExerciseEditRecordComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('#use-record-fixed').click(() => {
      $('#record-length-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#record-fixed .field>div').removeClass('disabled');
      $('#record-variable .field>div').addClass('disabled');
      this.service.editor.question.mode_options.set('rec-len', 'fixed');
    });

    $('#use-record-variable').click(() => {
      $('#record-length-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#record-fixed .field>div').addClass('disabled');
      $('#record-variable .field>div').removeClass('disabled');
      this.service.editor.question.mode_options.set('rec-len', 'variable');
    });

    $('#record-fixed input').change(() => {
      this.service.editor.question.mode_options.set('rec-duration', $(event.currentTarget).val());
    });

    $('#record-variable input').change(() => {
      this.service.editor.question.mode_options.set(
        'rec-duration',
        $('#record-variable input[name="length-variable"]').val()
      );

      // TODO: Validation
      let multiplier = $('#record-variable input[name="multiplier"]').val();
      multiplier = parseFloat(multiplier);
      this.service.editor.question.mode_options.set(
        'rec-multiplier',
        multiplier
      );
    });
  }
}
