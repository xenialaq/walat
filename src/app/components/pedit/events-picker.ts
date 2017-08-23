import { Component, AfterViewInit, Input, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-pedit-events-picker',
  templateUrl: 'events-picker.html'
})
export class EventsPicker implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $('wat-pedit-events-picker>.cards>a.card').each((index, e) => {
      $(e).click(() => {
        $('wat-script-editor').show();
        const flask = this.service.flask;
        flask.update(this.service.templates[index]);
        // this.service.page.events_t = $(e).attr('data-mode');
        this.hidden = true;
      });
    });
  }

  @Input('hidden')
  set hidden(hidden: boolean) {
    if (hidden) {
      $('wat-pedit-events-picker').hide();
    } else {
      $('wat-pedit-events-picker').show();
    }
  }
}
