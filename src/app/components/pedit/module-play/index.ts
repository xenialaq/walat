import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-play',
  templateUrl: 'index.html'
})
export class PlayModule implements AfterViewInit {
  @Input('value') _value: object;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  update = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['name'] = v.name;
    this._value['path'] = v.path;
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-play value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isNull(v.tag) && v.cmd === 'play';
  }
}
