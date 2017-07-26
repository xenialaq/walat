import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-wait',
  templateUrl: 'index.html'
})
export class WaitModule implements AfterViewInit {
  @ViewChild('selector') e;

  defaults = {
  }

  _value = this.defaults;

  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
  }

  @Input()
  set value(data) {
    this._value = _.isUndefined(data) ? this.defaults : data;
  }

  @Output() valueChange = new EventEmitter();

  update = (v) => {
    this.valueChange.emit(this._value);
  }

  debug = () => {
    console.log('module-wait value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'wait';
  }
}
