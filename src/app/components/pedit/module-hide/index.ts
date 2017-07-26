import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-hide',
  templateUrl: 'index.html'
})
export class HideModule implements AfterViewInit {
  @ViewChild('selector') e;

  defaults = {
    'element': '',
  }

  _value = this.defaults;

  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
    $('wat-pedit-module-hide .checkbox').checkbox();
  }

  @Input()
  set value(data) {
    this._value = _.isUndefined(data) ? this.defaults : data;
  }

  @Output() valueChange = new EventEmitter();

  update = (cbox) => {
    let key = $(cbox).next().text().toLowerCase();
    this._value['element'] = key;

    this.valueChange.emit(this._value);
  }

  debug = () => {
    console.log('module-hide value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'hide';
  }
}
