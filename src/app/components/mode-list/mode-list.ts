import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-mode-list',
  templateUrl: 'mode-list.html'
})
export class ModeListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('wat-mode-list>.cards>a.card').each((index) => {
      $(`wat-mode-list>.cards>a.card:nth-child(${index + 1})`).click(() => {
        $('wat-mode-list').hide();

        $('wat-exercise-edit-record>div').hide();
        $('wat-exercise-edit-sound-uploader').hide();

        $('#mode-options').show();

        if (index === 0) {
          // Listen
          $('wat-exercise-edit-sound-uploader').show();
          this.service.editor.question.recording_mode = 'listen';
        } else if (index === 1) {
          // Record
          $('wat-exercise-edit-record>div:nth-child(2)').show();
          this.service.editor.question.recording_mode = 'record';
        } else if (index === 2) {
          // Listen then record
          $('wat-exercise-edit-sound-uploader').show();
          $('wat-exercise-edit-record>div:nth-child(2)').show();
          this.service.editor.question.recording_mode = 'listen, record';
        }
      });
    });
  }
}
