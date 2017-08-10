import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-wait',
  templateUrl: 'index.html'
})
export class WaitModule implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
  }

  @Input('value') _value: object;

  ngAfterViewInit() {
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  update = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-wait value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'wait';
  }
}
