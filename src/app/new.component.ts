import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'new-view',
  templateUrl: './new.component.html'
})
export class NewComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    $('.modal').modal('show');
    $('.dropdown').dropdown();
  }
}
