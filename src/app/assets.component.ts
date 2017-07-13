import { Component, AfterViewInit } from '@angular/core';

import { Question, Exercise, Lesson, Asset } from './models/models';
import { AppComponentService } from './services/services';

@Component({
  selector: 'assets-view',
  templateUrl: './assets.component.html'
})
export class AssetsComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    this.service.setBreadCrumb([], 'Media library', '');

    // Only allows edits in editor
    $('wat-exercise-list>div>.icon.secondary.menu>div').hide();

    $('.dropdown').dropdown();

    let uri = new URI(window.location.href);
    let queryObj = uri.search(true);
    let lessonId = parseInt(queryObj.lid, 10);

    if (_.isNaN(lessonId)) {
      lessonId = 0;
    }

    $('#exercise-list').data('id', lessonId);

    // Init lesson
    if (lessonId !== 0) {
      this.service.initLessonData(lessonId, '#exercise-list', () => {
        // Show lesson assets
        this.service.loadAssets(this.service.lesson.path);
      });

      // Load tree and bind clicks
      this.service.addExercisesToLibraryView();
    } else {
      // Show global assets
      this.service.loadAssets();
    }


    const uploaders = [
      {
        input: 'input[name="file-upload"]',
        trigger: '#uploader-submit',
        label: undefined,
        submit: undefined, // submits immediately
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: 'input[name="file-type"]',
        tvalue: () => 'sound',
        path: 'input[name="file-path"]',
        pvalue: () => this.service.getBasePath,
        callback: (a) => {
          this.service.loadAssets(this.service.getBasePath());
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
        }
      },
      {
        input: 'input[name="file-upload"]',
        trigger: '#image-add',
        label: undefined,
        submit: undefined, // submits immediately
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: 'input[name="file-type"]',
        tvalue: () => 'image',
        path: 'input[name="file-path"]',
        pvalue: () => this.service.getBasePath,
        callback: (a) => {
          this.service.loadAssets(this.service.getBasePath());
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
        }
      },
      {
        input: 'input[name="file-upload"]',
        trigger: '#video-add',
        label: undefined,
        submit: undefined, // submits immediately
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: 'input[name="file-type"]',
        tvalue: () => 'video',
        path: 'input[name="file-path"]',
        pvalue: () => this.service.getBasePath,
        callback: (a) => {
          this.service.loadAssets(this.service.getBasePath());
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
        }
      }
    ];

    this.service.bindUploaders(uploaders);

    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
