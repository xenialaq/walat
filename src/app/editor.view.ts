import { Component, AfterViewInit } from '@angular/core';

import { Page, Exercise, Lesson, Asset } from './models/models';
import { AppService } from './services/services';

@Component({
  selector: 'editor-view',
  templateUrl: './editor.view.html'
})
export class EditorView implements AfterViewInit {
  constructor(private service: AppService) {
    // this.service.editor = this;
  }

  ngAfterViewInit() {
    // // this.service.setBreadCrumb([], '', 'Please select a page to edit.');

    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
