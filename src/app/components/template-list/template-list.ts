import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-template-list',
  templateUrl: 'template-list.html'
})
export class TemplateListComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    $('wat-template-list>.cards>a.card').each((index) => {
      $(`wat-template-list>.cards>a.card:nth-child(${index + 1})`).click(() => {
        $('wat-template-list').hide();

        $('#template-options>div').hide();
        $('#template-options').show();

        if (index === 0) {
          // Text
          $('#template-options>div:nth-child(1)').show();
          this.service.editor.question.template = 'text';
        } else if (index === 1) {
          // Slide
          $('#template-options>div:nth-child(2)').show();
          this.service.editor.question.template = 'slide';
        } else if (index === 2) {
          // Video
          $('#template-options>div:nth-child(3)').show();
          this.service.editor.question.template = 'video';
        } else if (index === 3) {
          // Question
          $('#template-options>div:nth-child(4)').show();
          this.service.editor.question.template = 'question';
        } else if (index === 4) {
          // Video and question
          $('#template-options>div:nth-child(3)').show();
          $('#template-options>div:nth-child(4)').show();
          this.service.editor.question.template = 'video, question';
        } else if (index === 5) {
          // Video and waveform
          this.service.editor.question.template = 'video, waveform';
        }
      });
    });
  }
}
