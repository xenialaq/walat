import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'wat-exercise-edit-video-uploader',
  templateUrl: 'exercise-edit-video-uploader.html'
})
export class ExerciseEditVideoUploaderComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('#use-youtube-video').click(() => {
      $('#video-source-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#youtube-video .field>div').removeClass('disabled');
      $('#uploaded-video .field>div').addClass('disabled');
    });

    $('#use-uploaded-video').click(() => {
      $('#video-source-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#youtube-video .field>div').addClass('disabled');
      $('#uploaded-video .field>div').removeClass('disabled');
    });
  }
}
