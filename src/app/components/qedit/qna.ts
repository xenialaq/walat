import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-qna',
  templateUrl: 'qna.html'
})
export class QEditQnaComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
    this.service.qna = this;
  }

  moveHandle = (selector) => {
    // Reset action
    $('#mc-choices-handle').dropdown('restore defaults').appendTo(selector);
    selector.addClass('right action');

    // Post-action
    if (this.getChoices().length <= 1) {
      $('#mc-choices-handle>.menu>.item:nth-child(2)').hide();
    } else {
      $('#mc-choices-handle>.menu>.item:nth-child(2)').show();
    }
  };

  getChoices = () => {
    const values = [];
    const correctnesses = [];

    $('#mc-choices>.field>.input>input').map((i, e) => {
      values.push($(e).val());
    });
    $('#mc-choices>.field>.input>.ui.dropdown.label>input').map((i, e) => {
      correctnesses.push(/checkmark/.test($(e).val()));
    });
    return values.map((v, i) => (
      {
        isCorrect: correctnesses[i],
        value: v
      }));
  }

  setChoices = (choices) => {
    $('#mc-choices').empty();
    choices.forEach((c, i) => {
      $('#mc-choices').append(`
        <div class="field">
          <div class="ui labeled input">
            <div class="ui dropdown label">
              <input type="hidden" name="correctness">
              <div class="text"><i class="${c.isCorrect ? 'green checkmark': 'red remove'} icon"></i></div>
              <i class="dropdown icon"></i>
              <div class="menu" tabindex="-1">
                <div class="item"><i class="green checkmark icon"></i></div>
                <div class="item"><i class="red remove icon"></i></div>
              </div>
            </div>
            <input type="text">
          </div>
        </div>`);

      $(`#mc-choices>.field:eq(${i})>.input>input`).val(c.value);
    });

    $('#mc-choices').append(`
      <div class="field">
        <div class="ui labeled right action input">
          <div class="ui dropdown label">
            <input type="hidden" name="correctness" value="<i class=&quot;green checkmark icon&quot;></i>">
            <div class="text"><i class="green checkmark icon"></i></div>
            <i class="dropdown icon"></i>
            <div class="menu">
              <div class="item"><i class="green checkmark icon"></i></div>
              <div class="item"><i class="red remove icon"></i></div>
            </div>
          </div>
          <input type="text">
          <div class="ui basic floating dropdown button" id="mc-choices-handle">
            <input type="hidden" name="action">
            <div class="text">Action</div>
            <i class="dropdown icon"></i>
            <div class="menu">
              <div class="item">Insert above</div>
              <div class="item">Remove</div>
              <div class="item">Move down</div>
            </div>
          </div>
        </div>
      </div>`);

    $('#mc-choices .dropdown').dropdown();
  }

  mcItemFocused = (event) => {
    this.moveHandle($(event.currentTarget).parent('.ui.input'));
  }

  mcItemChanged = () => {
    this.service.question.content_options.set('qna-mc', this.getChoices());
  }

  ngAfterViewInit() {
    $('#qna-type-dropdown').dropdown({
      onChange: function(value, text, $selectedItem) {
        $('.q-option').hide();

        if (value === '0') {
          // Text
          $('#q-short-answer').show();
        } else if (value === '1') {
          // Filling blank
          $('#q-filling-blank').show();
        } else {
          // MC
          $('#q-multiple-choice').show();
        }

      }
    });

    $('#mc-choices-handle input[name="action"]').change((event) => {
      const action = $(event.currentTarget).val();
      if (action === 'insert above') {
        $(event.currentTarget).closest('.field').before(`
          <div class="field">
            <div class="ui labeled input">
              <div class="ui dropdown label">
                <input type="hidden" name="correctness">
                <div class="text"><i class="red remove icon"></i></div>
                <i class="dropdown icon"></i>
                <div class="menu" tabindex="-1">
                  <div class="item"><i class="green checkmark icon"></i></div>
                  <div class="item"><i class="red remove icon"></i></div>
                </div>
              </div>
              <input type="text">
            </div>
          </div>`);

        const srcInput = $(event.currentTarget).closest('.field').children('.ui.input');
        srcInput.removeClass('right action');
        const destInput = $(event.currentTarget).closest('.field').prev().children('.ui.input');
        this.moveHandle(destInput);

        // bind events and init dropdown
        destInput.children('input').focus(this.mcItemFocused);
        destInput.children('input').change(this.mcItemChanged);
        $('#mc-choices .dropdown').dropdown();
      } else if (action === 'remove') {
        const srcField = $(event.currentTarget).closest('.field');

        let destInput = $(event.currentTarget).closest('.field').prev().children('.ui.input');

        if ($('#mc-choices>.field').index(srcField) === 0) {
          // Remove first choice, dest should be next
          destInput = $(event.currentTarget).closest('.field').next().children('.ui.input');
        }

        this.moveHandle(destInput);
        srcField.remove();
      } else if (action === 'move down') {
        const srcField = $(event.currentTarget).closest('.field');
        const destField = srcField.next();
        srcField.before(destField);
        $('#mc-choices-handle').dropdown('restore defaults');
      }

      // Focus
      $('#mc-choices-handle').closest('.field').children('.ui.input').children('input').focus();

      // Item changed
      this.mcItemChanged();
    });


    $('input[name="q-type"]').change((event) => {
      this.service.question.content_options.set('qna-type', $(event.currentTarget).val());
    });

    $('.q-option textarea[name="question"]').change((event) => {
      this.service.question.content_options.set('qna-question', $(event.currentTarget).val());
    });

    $('.q-option textarea[name="key"]').change((event) => {
      this.service.question.content_options.set('qna-key', $(event.currentTarget).val());
    });

    $('#mc-choices>.field>.input>input').focus(this.mcItemFocused);
    $('#mc-choices>.field>.input>input').change(this.mcItemChanged);
  }
}
