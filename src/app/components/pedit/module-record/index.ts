import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-record',
  templateUrl: 'index.html'
})
export class RecordModule implements AfterViewInit {
  @Input('value') _value: object;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $('#record-variable-dropdown').dropdown();
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  updateLength = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['length'] = parseFloat(v);
    this.valueUpdate.emit(this._value);
  }

  updateLengthVar = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['length-var'] = v;
    this.valueUpdate.emit(this._value);
  }

  updateLengthMultiplier = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['length-multiplier'] = parseFloat(v);
    this.valueUpdate.emit(this._value);
  }

  toggleMode = (isFixed) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['isFixed'] = isFixed;
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-record value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isNull(v.tag) && v.cmd === 'record';
  }
}
