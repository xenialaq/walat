import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './index.html'
})
export class App implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('.message .close')
      .on('click', function() {
        if ($(this).closest('.message').is(':visible')) {
          $(this).closest('.message').transition('fade');
        }
      });
  }
}
