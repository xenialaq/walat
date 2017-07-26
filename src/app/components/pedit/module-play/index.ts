import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-play',
  templateUrl: 'index.html'
})
export class PlayModule implements AfterViewInit {
  @ViewChild('selector') e;

  defaults = {
    name: '',
    path: ''
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
    this._value['name'] = v.name;
    this._value['path'] = v.path;
    this.valueChange.emit(this._value);
  }

  debug = () => {
    console.log('module-play value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'play';
  }
}
