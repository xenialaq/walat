import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

import { Lesson, Exercise, Page, Asset } from '../../models/models';

import * as _ from 'lodash';

@Component({
  selector: 'wat-lesson-manager',
  templateUrl: 'index.html'
})
export class LessonManager implements AfterViewInit {
  _ = _;
  Cookies = Cookies;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $(this.e.nativeElement).find('.dropdown').dropdown();

    const uploaders = [
      {
        input: $('input[name="file-upload"]'),
        trigger: $(this.e.nativeElement).find('.create-by-zip'),
        label: undefined,
        submit: undefined, /* submits immediately */
        onSubmit: () => {
          this.service.showDimmer();
        },
        type: $('input[name="file-type"]'),
        tvalue: () => 'zip',
        path: $('input[name="file-path"]'),
        pvalue: this.service.getPath,
        callback: (l) => {
          this.service.hideDimmer();
          this.service.initLesson(l.id);
        },
        url: '/zipuploader'
      }
    ];

    this.service.bindUploaders(uploaders);
  }

  createLessonClick = () => {
    let rid = _.random(-5000, -1);

    while (_.has(this.service.lessons, rid)) {
      rid = _.random(-5000, -1);
    }
    let n = new Lesson(rid, '', '', '');

    this.service.activeItem = {
      value: n,
      action: 'create',
      type: 'lesson',
      openModal: true
    }
  }

  deleteLessonClick = () => {
    let item = this.service.lessons[this.service.activeView.lesson.id];
    this.service.activeItem = {
      value: item,
      action: 'delete',
      type: 'lesson',
      openModal: true
    }
  }

  toggleLesson = (id) => {
    if (this.service.activeView.lesson.id === id) {
      this.service.activeView.lesson.id = 0;
    } else {
      this.service.activeView.lesson.id = id;
    }
  }
}
