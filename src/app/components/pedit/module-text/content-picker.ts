import { Component, AfterViewInit } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-content-picker',
  templateUrl: 'content-picker.html'
})
export class ContentPicker implements AfterViewInit {
  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
    $('wat-pedit-content-picker>.cards>a.card').each((index, e) => {
      $(e).click(() => {
        $('wat-pedit-content-picker').hide();

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
        }

        // this.service.page.content_t = $(e).attr('data-mode');
      });
    });
  }
}
