import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-events-picker',
  templateUrl: 'events-picker.html'
})
export class QEditModeListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('wat-qedit-events-picker>.cards>a.card').each((index, e) => {
      $(e).click(() => {
        $('wat-qedit-events-picker').hide();

        $('wat-qedit-record>div').hide();
        $('wat-qedit-asset-uploader').hide();

        $('#events-options').show();

        if (index === 0) {
          // Listen
          $('wat-qedit-asset-uploader').show();
        } else if (index === 1) {
          // Record
          $('wat-qedit-record>div:nth-child(2)').show();
        } else if (index === 2) {
          // Listen then record
          $('wat-qedit-asset-uploader').show();
          $('wat-qedit-record>div:nth-child(2)').show();
        }

        this.service.question.events_t = $(e).attr('data-mode');
      });
    });
  }
}
