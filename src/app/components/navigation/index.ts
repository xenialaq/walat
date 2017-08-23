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
}
