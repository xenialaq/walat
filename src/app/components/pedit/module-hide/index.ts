import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-hide',
  templateUrl: 'index.html'
})
export class HideModule implements AfterViewInit {
  @Input('value') _value: object;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $('wat-pedit-module-hide .checkbox').checkbox();
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  update = (cbox) => {
    if (!this.isAvailable()) {
      return;
    }
    let key = $(cbox).next().text().toLowerCase();
    this._value['element'] = key;

    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-hide value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'hide';
  }
}
