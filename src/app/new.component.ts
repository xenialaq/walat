import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'new-view',
  templateUrl: './new.component.html'
})
export class NewComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('.dropdown').dropdown();

    $('.message .close').on('click', (event) => {
      $(event.currentTarget).closest('.message').transition('fade');
    });
  }
}
