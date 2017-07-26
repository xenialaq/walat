import { Component, AfterViewInit, NgModule } from '@angular/core';

@Component({
  selector: 'dashboard-view',
  templateUrl: './dashboard.view.html'
})
export class DashboardView implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
