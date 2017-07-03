import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'wat-exercise-edit-sound-uploader',
  templateUrl: 'exercise-edit-sound-uploader.html'
})
export class ExerciseEditSoundUploaderComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('#use-asset-sound').click(() => {
      $('#sound-source-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#asset-sound .field>div').removeClass('disabled');
      $('#uploaded-sound .field>div').addClass('disabled');
    });

    $('#use-uploaded-sound').click(() => {
      $('#sound-source-buttons>button').addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $('#asset-sound .field>div').addClass('disabled');
      $('#uploaded-sound .field>div').removeClass('disabled');
    });

    $('input[name="button-upload-select"]').click(() => {
      $('input[name="file-upload"]').click();
    });

    $('input[name="file-upload"]').change(() => {
      $('input[name="button-upload-select"]').val($(event.currentTarget).val()
        .replace(/^C:\\fakepath\\/, ''));
    });

    $('button[name="button-upload"]').click(() => {
      var form = $('input[name="file-upload"]').parent('form')[0];
      var data = new FormData(form);

      $.ajax({
        url: '/profile',
        data: data,
        method: 'POST',
        processData: false,
        contentType: false,
        success: (data) => {
          alert(data);
        }
      });
    });
  }
}
