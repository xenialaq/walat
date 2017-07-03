import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'wat-exercise-edit',
  templateUrl: 'exercise-edit.html'
})
export class ExerciseEditComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('a.step').each((index) => {
      $(`a.step:nth-child(${index + 1})`).click(() => {
        $('a.step').removeClass('active');
        $(event.currentTarget).addClass('active');
        $(`#step-content-wrapper>div`).hide();
        $(`#step-content-wrapper>div:nth-child(${index+1})`).show();
      });
    });

    $('#step-1-reset').click(() => {
      $('wat-mode-list').show();
      $('#mode-options').hide();
      $('wat-exercise-edit-record>div').hide();
    });

    $('#step-2-reset').click(() => {
      $('wat-template-list').show();
      $('#template-options').hide();
      $('#template-options>div').hide();
    });

    $('#step-3-reset').click(() => {

    });
  }
}
