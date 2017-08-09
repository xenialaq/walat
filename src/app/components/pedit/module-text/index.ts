import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-text',
  templateUrl: 'index.html'
})
export class TextModule implements AfterViewInit {
  constructor(private service: AppService, private e: ElementRef) {
    $(this.e.nativeElement).find('.ui.checkbox').checkbox();
  }

  ngAfterViewInit() {
  }

  @Input('value') _value: object;

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  toggleMode = (mode) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['mode'] = mode;
    this.valueUpdate.emit(this._value);
  }

  updateText = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['text'] = v;
    this.valueUpdate.emit(this._value);
  }

  updateImage = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['image'] = v;
    this.valueUpdate.emit(this._value);
  }

  updateVideo = (v) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['video']['name'] = v['name'];
    this._value['video']['path'] = v['path'];
    this.valueUpdate.emit(this._value);
  }

  updateVideoWaveform = (cbox) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['video']['isWaveform'] = cbox.checked;
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-text value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isNull(v.tag) && v.cmd === 'show text';
  }
}

export * from './content-picker';
export * from './rich-editor';
