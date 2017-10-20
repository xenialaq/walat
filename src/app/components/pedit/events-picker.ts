import { Component, AfterViewInit, Input, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-pedit-events-picker',
  templateUrl: 'events-picker.html'
})
export class EventsPicker implements AfterViewInit {
  _ = _;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  useTemplate(tid) {
    $('wat-script-editor').show();
    const flask = this.service.flask;
    flask.update(this.service.templates[tid].content);
    this.hidden = true;
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
