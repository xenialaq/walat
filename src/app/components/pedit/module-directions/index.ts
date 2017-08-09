import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-directions',
  templateUrl: 'index.html'
})
export class DirectionsModule implements AfterViewInit {
  defaults = {
    'directions': ''
  }

  _value = this.defaults;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  @Input()
  set value(line) {
    this._value = line.cmd !== 'show directions' || _.isUndefined(line.data) ? this.defaults : line.data;
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  update = (v) => {
    this._value['directions'] = v;
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-directions value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'show directions';
  }
}
