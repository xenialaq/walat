import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-content-picker',
  templateUrl: 'content-picker.html'
})
export class QEditTemplateListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('wat-qedit-content-picker>.cards>a.card').each((index, e) => {
      $(e).click(() => {
        $('wat-qedit-content-picker').hide();

        $('#content-options>div').hide();
        $('#content-options').show();

        if (index === 0) {
          // Text
          $('#content-options>div:nth-child(1)').show();
        } else if (index === 1) {
          // Slide
          $('#content-options>div:nth-child(2)').show();
        } else if (index === 2) {
          // Video
          $('#content-options>div:nth-child(3)').show();
        } else if (index === 3) {
          // Question
          $('#content-options>div:nth-child(4)').show();
        } else if (index === 4) {
          // Video and question
          $('#content-options>div:nth-child(3)').show();
          $('#content-options>div:nth-child(4)').show();
        } else if (index === 5) {
          // Video and waveform
        }

        this.service.question.content_t = $(e).attr('data-mode');
      });
    });
  }
}
