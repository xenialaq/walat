import { Component, AfterViewInit, NgModule } from '@angular/core';

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
  constructor(private service: AppService) {
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

    $('.q-save-button').click((event) => {
      // let q = this.service.page;

      // let template_fields = {};
      // if (_.has(this.service.eventsFieldsMapping, q.events_t)) {
      //   this.service.eventsFieldsMapping[q.events_t].forEach((f) => {
      //     template_fields[f] = q.template_fields.get(f);
      //   });
      // }
      //
      // let content_fields = {};
      // q.content_t.forEach((content_t) => {
      //   if (_.has(this.service.contentFieldsMapping, content_t)) {
      //     this.service.contentFieldsMapping[content_t].forEach((f) => {
      //       content_fields[f] = q.content_fields[this.service.content_index].get(f);
      //     });
      //   }
      // })


      // $(event.currentTarget).api({
      //   action: q.id > 0 ? 'put a page' : 'post a page',
      //   on: 'now',
      //   method: q.id > 0 ? 'put' : 'post',
      //   data: JSON.stringify({
      //     "id": q.id,
      //     "name": q.name,
      //     "path": q.path,
      //     "events_t": q.events_t,
      //     "template_fields": JSON.stringify(template_fields),
      //     "template": q.content_t,
      //     "content_fields": JSON.stringify(content_fields),
      //     "directions": q.directions,
      //     "notes": q.notes,
      //     "script": q.script,
      //     "exercise": this.service.exercise.id
      //   }),
      //   contentType: 'application/json',
      //   onResponse: (response) => {
      //     // make some adjustments to response
      //     // this.service.addPageToEditorView(this.service.exercise.id, q.id);
      //     // $('#success-message>span').text(`${q.name} has been ${q.id > 0 ? 'updated' : 'posted'}.`);
      //     $('#success-message').transition('fade');
      //   }
      // });
    });
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
