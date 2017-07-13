import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
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
