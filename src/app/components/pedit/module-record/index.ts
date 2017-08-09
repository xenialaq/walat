import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-record',
  templateUrl: 'index.html'
})
export class RecordModule implements AfterViewInit {
  @ViewChild('selector') e;

  defaults = {
    'isFixed': true,
    'length': 0,
    'length-var': 0,
    'length-multiplier': 1
  }

  _value = this.defaults;

  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
    $('#record-variable-dropdown').dropdown();
  }

  @Input()
  set value(data) {
    this._value = _.isUndefined(data) ? this.defaults : data;
  }

  @Output() change = new EventEmitter();

  updateLength = (v) => {
    this._value['length'] = parseFloat(v);
    this.change.emit(this._value);
  }

  updateLengthVar = (v) => {
    this._value['length-var'] = parseInt(v, 10);
    this.change.emit(this._value);
  }

  updateLengthMultiplier = (v) => {
    this._value['length-multiplier'] = parseFloat(v);
    this.change.emit(this._value);
  }

  toggleMode = (isFixed) => {
    this._value['isFixed'] = isFixed;
  }

  debug = () => {
    console.log('module-record value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'record';
  }
}
