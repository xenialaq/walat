import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-extra',
  templateUrl: 'extra.html'
})
export class QEditExtraComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('textarea[name="directions"]').change((event) => {
      this.service.question.directions = $(event.currentTarget).val();
    });
    $('textarea[name="notes"]').change((event) => {
      this.service.question.notes = $(event.currentTarget).val();
    });
    $('textarea[name="script"]').change((event) => {
      this.service.question.script = $(event.currentTarget).val();
    });
  }
}
