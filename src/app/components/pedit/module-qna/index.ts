import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-qna',
  templateUrl: 'index.html'
})
export class QnaModule implements AfterViewInit {
  defaults = {
    type: 0,
    question: '',
    answer: '',
    choices: [{
      isCorrect: true,
      value: ''
    }]
  }

  _value = this.defaults;

  constructor(private service: AppService, private e: ElementRef) {
  }

  updateChoice = (i, correct, v) => {
    if (!_.isUndefined(correct)) {
      this._value['choices'][i]['isCorrect'] = correct;
    }

    if (!_.isUndefined(v)) {
      this._value['choices'][i]['value'] = v;
    }

    this.valueUpdate.emit(this._value);
  }

  activeChoice = 0;

  handleChoices = (action) => {
    if (!this.isAvailable()) {
      return;
    }
    if (action === 'insert above') {
      this._value['choices'].splice(this.activeChoice, 0, {
        isCorrect: false,
        value: ''
      });

      this.activeChoice++;

      this.valueUpdate.emit(this._value);
    } else if (action === 'remove') {
      this._value['choices'].splice(this.activeChoice, 1);

      this.valueUpdate.emit(this._value);
    } else if (action === 'move down') {
      let a = this._value['choices'][this.activeChoice];
      let b = this._value['choices'][this.activeChoice + 1];

      this._value['choices'][this.activeChoice] = b;
      this._value['choices'][this.activeChoice + 1] = a;
      this.activeChoice++;

      this.valueUpdate.emit(this._value);
    } else {
      return;
    }

    this.refreshDropdowns();
  }

  updateActiveChoice = (i) => {
    this.activeChoice = i;
    this.refreshDropdowns();
  }

  ngAfterViewInit() {
    $('#qna-type-dropdown').dropdown();
    this.refreshDropdowns();
  }

  refreshDropdowns = () => {
    // delayed init
    let setter = setInterval(() => {
      if ($('.mc-choices-handle').length) {
        $('.mc-choices-handle').dropdown('restore defaults');
        $('#mc-choices .dropdown.correctness').dropdown();
        clearInterval(setter);
      }
    }, 50);
  }

  @Input()
  set value(line) {
    this._value = line.cmd !== 'expect Q&A submission' || _.isUndefined(line.data) ? this.defaults : line.data;
  }

  @Output() valueUpdate: EventEmitter<object> = new EventEmitter<object>();

  updateQ = (q) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['question'] = q;
    this.valueUpdate.emit(this._value);
  }

  updateA = (a) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['answer'] = a;
    this.valueUpdate.emit(this._value);
  }

  toggleMode = (qtype) => {
    if (!this.isAvailable()) {
      return;
    }
    this._value['type'] = parseInt(qtype, 10);
    this.valueUpdate.emit(this._value);
  }

  debug = () => {
    console.log('module-qna value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'expect Q&A submission';
  }
}
