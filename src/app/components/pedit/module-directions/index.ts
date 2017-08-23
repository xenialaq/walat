import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-directions',
  templateUrl: 'index.html'
})
export class DirectionsModule implements AfterViewInit {
  @Input('value') _value: object;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
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
    return !_.isNull(v.tag) && v.cmd === 'show directions';
  }
}
