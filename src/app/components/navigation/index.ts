import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-navigation',
  templateUrl: 'index.html'
})
export class Navigation {
  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $(this.e.nativeElement).find('.dropdown').dropdown();

    const uploaders = [
      {
        input: $('input[name="file-upload"]'),
        trigger: $(this.e.nativeElement).find('.import-from-walat'),
        label: undefined,
        submit: undefined, /* submits immediately */
        onSubmit: () => {
          this.service.showDimmer();
        },
        type: $(),
        tvalue: () => '*',
        path: $('input[name="file-path"]'),
        pvalue: this.service.getPath,
        callback: (l) => {
          this.service.hideDimmer();
          // this.service.initLesson(l.id);
        },
        url: '/importer'
      }
    ];

    this.service.bindUploaders(uploaders);
  }

  editLessonClick() {
    let item = this.service.lessons[this.service.activeView.lesson.id];

    this.service.activeItem = {
      value: item,
      action: 'edit',
      type: 'lesson',
      openModal: true
    }
  }

  composeLessonClick() {
    location.replace(`/editor?lid=${this.service.activeView.lesson.id}`);
  }

  editLibraryClick() {
    location.replace(`/library?lid=${this.service.activeView.lesson.id}`);
  }

  generateLessonClick(format) {
    window.open(`/generator?lid=${this.service.activeView.lesson.id}&format=${format}`);
  }

  exportLessonClick() {
    window.open(`/exportor?lid=${this.service.activeView.lesson.id}`);
  }
}
