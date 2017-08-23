import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-breadcrumb',
  templateUrl: 'index.html'
})
export class Breadcrumb implements AfterViewInit {
  @Input('value') _value: object;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {

  }
}
