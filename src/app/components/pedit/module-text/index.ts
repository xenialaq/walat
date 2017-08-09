import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-text',
  templateUrl: 'index.html'
})
export class TextModule implements AfterViewInit {
  @ViewChild('selector') e;

  defaults = {
    'mode': '',
    'text': {},
    'image': {},
    'video': {}
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

  toggleMode = (mode) => {
    this._value['mode'] = mode;
    this.valueChange.emit(this._value);
  }

  updateText = (v) => {
    this._value['text'] = v;
    this.valueChange.emit(this._value);
  }

  updateImage = (v) => {
    this._value['image'] = v;
    this.valueChange.emit(this._value);
  }

  updateVideo = (v, isWaveform) => {
    this._value['video'] = v;
    this.valueChange.emit(this._value);
  }

  debug = () => {
    console.log('module-text value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'show text';
  }
}

export * from './content-picker';
export * from './rich-editor';
