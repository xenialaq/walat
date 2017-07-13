import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-record',
  templateUrl: 'record.html'
})
export class QEditRecordComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('#record-variable-dropdown').dropdown();

    $('#use-record-fixed').click((event) => {
      $('#record-length-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#record-fixed .field>div').removeClass('disabled');
      $('#record-variable .field>div').addClass('disabled');
      this.service.question.events_options.set('isFixed', true);
    });

    $('#use-record-variable').click((event) => {
      $('#record-length-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#record-fixed .field>div').addClass('disabled');
      $('#record-variable .field>div').removeClass('disabled');
      this.service.question.events_options.set('isFixed', false);
    });

    $('#record-fixed input').change((event) => {
      this.service.question.events_options.set('length', $(event.currentTarget).val());
    });

    $('#record-variable input[name="length"]').change((event) => {
      this.service.question.events_options.set(
        'length',
        $(event.currentTarget).val()
      );
    });

    $('#record-variable input[name="multiplier"]').change((event) => {
      this.service.question.events_options.set(
        'length-multiplier',
        $(event.currentTarget).val()
      );
    });
  }
}
