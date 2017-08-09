import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-content-picker',
  templateUrl: 'content-picker.html'
})
export class ContentPicker implements AfterViewInit {
  constructor(private service: AppService) {
  }

  _value = '';

  @Input()
  set value(data) {
    this._value = data;
  }

  @Output() change = new EventEmitter();

  update = (v) => {
    this._value = v;
    this.change.emit(this._value);
  }

  ngAfterViewInit() {
  }
}
