import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { Page, Exercise, Lesson, Asset } from './models/models';
import { AppService } from './services/services';

@Component({
  selector: 'dashboard-view',
  templateUrl: './dashboard.view.html'
})
export class DashboardView implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
    this.service.activeView = this.service.dashboard;
  }

  ngAfterViewInit() {
    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
