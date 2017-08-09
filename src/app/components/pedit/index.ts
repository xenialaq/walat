import { Component, AfterViewInit, NgModule, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

import {DirectionsModule} from './module-directions';
import {HideModule} from './module-hide';
import {PlayModule} from './module-play';
import {QnaModule} from './module-qna';
import {RecordModule} from './module-record';
import {TextModule} from './module-text';
import {WaitModule} from './module-wait';

@Component({
  selector: 'wat-pedit',
  templateUrl: 'index.html'
})
@NgModule({
  declarations: [
    DirectionsModule,
    HideModule,
    PlayModule,
    QnaModule,
    RecordModule,
    TextModule,
    WaitModule
  ]
})
export class PEdit implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $('a.step').each((index) => {
      $(`a.step:nth-child(${index + 1})`).click((event) => {
        $('a.step').removeClass('active');
        $(event.currentTarget).addClass('active');
        $(`#step-content-wrapper>div`).hide();
        $(`#step-content-wrapper>div:nth-child(${index + 1})`).show();
      });
    });

    $('#step-1-reset').click(() => {
      $('wat-pedit-events-picker').show();
      $('#events-options').hide();
      $('wat-pedit-events-options>div').hide();

      // this.service.page.events_t = undefined;
    });

    $('#step-2-reset').click(() => {
      $('wat-pedit-content-picker').show();
      $('#content-options').hide();
      $('#content-options>div').hide();

      // this.service.page.content_t = undefined;
    });
  }

  updateLine = (v) => {
    this.service.editor.line.data = v;

    let changedData = {};
    changedData[this.service.editor.line.tag] = this.service.editor.line.data;
    this.service.editor.page.data = _.merge(
      this.service.editor.page.data,
      changedData
    );
  }

  save = () => {
    let q = this.service.pages[this.service.editor.page.id];

    q.setFields(this.service.editor.page.data);

    $('#success-message>span').text(`${q.name} has been ${q.id > 0 ? 'updated' : 'posted'}.`);
    $('#success-message').transition('fade');
  }
}

export * from './events-picker';
export * from './script-editor';
export * from './module-directions';
export * from './module-hide';
export * from './module-play';
export * from './module-qna';
export * from './module-record';
export * from './module-text';
export * from './module-wait';
