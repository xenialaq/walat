import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../../../services/services';

@Component({
  selector: 'wat-pedit-module-qna',
  templateUrl: 'index.html'
})
export class QnaModule implements AfterViewInit {
  @ViewChild('selector') e;

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

  constructor(private service: AppService) {
  }

  setChoices = (choices) => {
    // $('#mc-choices').empty();
    // choices.forEach((c, i) => {
    //   $('#mc-choices').append(`
    //     <div class="field">
    //       <div class="ui labeled input">
    //         <div class="ui dropdown label">
    //           <input type="hidden" name="correctness">
    //           <div class="text"><i class="${c.isCorrect ? 'green checkmark' : 'red remove'} icon"></i></div>
    //           <i class="dropdown icon"></i>
    //           <div class="menu" tabindex="-1">
    //             <div class="item"><i class="green checkmark icon"></i></div>
    //             <div class="item"><i class="red remove icon"></i></div>
    //           </div>
    //         </div>
    //         <input type="text">
    //       </div>
    //     </div>`);
    //
    //   $(`#mc-choices>.field:eq(${i})>.input>input`).val(c.value);
    // });
    //
    // $('#mc-choices').append(`
    //   <div class="field">
    //     <div class="ui labeled right action input">
    //       <div class="ui dropdown label">
    //         <input type="hidden" name="correctness" value="<i class=&quot;green checkmark icon&quot;></i>">
    //         <div class="text"><i class="green checkmark icon"></i></div>
    //         <i class="dropdown icon"></i>
    //         <div class="menu">
    //           <div class="item"><i class="green checkmark icon"></i></div>
    //           <div class="item"><i class="red remove icon"></i></div>
    //         </div>
    //       </div>
    //       <input type="text">
    //       <div class="ui basic floating dropdown button" id="mc-choices-handle">
    //         <input type="hidden" name="action">
    //         <div class="text">Action</div>
    //         <i class="dropdown icon"></i>
    //         <div class="menu">
    //           <div class="item">Insert above</div>
    //           <div class="item">Remove</div>
    //           <div class="item">Move down</div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>`);
    //
    // $('#mc-choices .dropdown').dropdown();
  }

  updateChoice = (i, correct, v) => {
    if (!_.isUndefined(correct)) {
      this._value['choices'][i]['isCorrect'] = correct;
    }

    if (!_.isUndefined(v)) {
      this._value['choices'][i]['value'] = v;
    }

    this.change.emit(this._value);
  }

  activeChoice = 0;

  handleChoices = (action) => {
    if (action === 'insert above') {
      this._value['choices'].splice(this.activeChoice, 0, {
        isCorrect: false,
        value: ''
      });

      this.activeChoice++;

      this.change.emit(this._value);
    } else if (action === 'remove') {
      this._value['choices'].splice(this.activeChoice, 1);

      this.change.emit(this._value);
    } else if (action === 'move down') {
      let a = this._value['choices'][this.activeChoice];
      let b = this._value['choices'][this.activeChoice + 1];

      this._value['choices'][this.activeChoice] = b;
      this._value['choices'][this.activeChoice + 1] = a;
      this.activeChoice++;

      this.change.emit(this._value);
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
  set value(data) {
    this._value = _.isUndefined(data) ? this.defaults : data;
  }

  @Output() change = new EventEmitter();

  updateQ = (q) => {
    this._value['question'] = q;
    this.change.emit(this._value);
  }

  updateA = (a) => {
    this._value['answer'] = a;
    this.change.emit(this._value);
  }

  toggleMode = (qtype) => {
    this._value['type'] = parseInt(qtype, 10);
    this.change.emit(this._value);
  }

  debug = () => {
    console.log('module-qna value: ', this._value);
  }

  isAvailable = () => {
    let v = this.service.editor.line;
    return !_.isUndefined(v.tag) && v.cmd === 'expect Q&A submission';
  }
}
