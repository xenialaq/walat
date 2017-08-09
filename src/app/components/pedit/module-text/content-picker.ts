import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-content-picker',
  templateUrl: 'content-picker.html'
})
export class ContentPicker implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
  }

  _value = '';

  @Input()
  set value(data) {
    this._value = data;
  }

  @Output() valueUpdate = new EventEmitter();

  update = (v) => {
    this._value = v;
    this.valueUpdate.emit(this._value);
  }

  ngAfterViewInit() {
  }

  debug = () => {
    console.log('content-picker value: ', this._value);
  }
}
