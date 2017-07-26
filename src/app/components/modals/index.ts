import { Component, AfterViewInit } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-modals',
  templateUrl: 'index.html'
})
export class Modals implements AfterViewInit {
  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
    $('#collection-create-modal .accordion').accordion();
    $('#collection-edit-modal .accordion').accordion();

    $('.ui.modal button[name="cancel"]').click((event) => {
      $(event.currentTarget).closest('.ui.modal').modal('hide');
    });

    $('#collection-create-form').form({
      fields: {
        name: {
          identifier: 'name',
          rules: [
            {
              type: 'empty',
              prompt: 'Please enter the name.'
            }
          ]
        },
        cname: {
          identifier: 'cname',
          rules: [
            {
              type: 'regExp',
              value: /^(\w+(-\w+)*)?$/,
              prompt: 'Please use words with only alphanumeric and _ characters (words can be hyphenated).'
            }
          ]
        }
      }
    });

    $('#collection-edit-form').form({
      fields: {
        name: {
          identifier: 'name',
          rules: [
            {
              type: 'empty',
              prompt: 'Please enter the name.'
            }
          ]
        },
        cname: {
          identifier: 'cname',
          rules: [
            {
              type: 'regExp',
              value: /^(\w+(-\w+)*)?$/,
              prompt: 'Please use words with only alphanumeric and _ characters (words can be hyphenated).'
            }
          ]
        }
      }
    });

    $('#collection-delete-form').form({
      fields: {
        name: {
          identifier: 'name',
          rules: [
            {
              type: 'empty',
              prompt: 'Please enter the name.'
            }
          ]
        }
      }
    });
  }
}
