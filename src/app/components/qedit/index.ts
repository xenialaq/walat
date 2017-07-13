import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit',
  templateUrl: 'index.html'
})
export class QEditComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
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
      $('wat-qedit-events-picker').show();
      $('#events-options').hide();
      $('wat-qedit-record>div').hide();

      this.service.question.events_t = undefined;
    });

    $('#step-2-reset').click(() => {
      $('wat-qedit-content-picker').show();
      $('#content-options').hide();
      $('#content-options>div').hide();

      this.service.question.content_t = undefined;
    });

    $('.q-save-button').click((event) => {
      let q = this.service.question;

      let events_options = {};
      if (_.has(this.service.eventsFields, q.events_t)) {
        this.service.eventsFields[q.events_t].forEach((f) => {
          events_options[f] = q.events_options.get(f);
        });
      }

      let content_options = {};

      if (_.has(this.service.contentFields, q.content_t)) {
        this.service.contentFields[q.content_t].forEach((f) => {
          content_options[f] = q.content_options.get(f);
        });
      }

      $(event.currentTarget).api({
        action: q.id > 0 ? 'put a question' : 'post a question',
        on: 'now',
        method: q.id > 0 ? 'put' : 'post',
        data: JSON.stringify({
          "id": q.id,
          "name": q.name,
          "path": q.path,
          "events_t": q.events_t,
          "events_options": JSON.stringify(events_options),
          "template": q.content_t,
          "content_options": JSON.stringify(content_options),
          "directions": q.directions,
          "notes": q.notes,
          "script": q.script,
          "exercise": this.service.exercise.id
        }),
        contentType: 'application/json',
        onResponse: (response) => {
          // make some adjustments to response
          this.service.addQuestionToEditorView(this.service.exercise.id, q.id);
          $('#success-message>span').text(`${q.name} has been ${q.id > 0 ? 'updated' : 'posted'}.`);
          $('#success-message').transition('fade');
        }
      });
    });
  }
}
