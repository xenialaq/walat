import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

import { Page, Exercise, Lesson, Asset } from '../../models/models';

@Component({
  selector: 'wat-modals',
  templateUrl: 'index.html'
})
export class Modals implements AfterViewInit {
  _ = _;

  _value: object;

  _open: boolean;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  @Input()
  set value(data) {
    $('#collection-modal').find('form').form('clear');

    this._value = data;

    if (data.action === 'delete') {
      /* for delete confirmation */
      $('#collection-modal').find('form').form({
        fields: {
          name: {
            identifier: 'name',
            rules: [
              {
                type: 'isExactly',
                value: data['value'].name,
                prompt: 'Please enter the name.'
              }
            ]
          }
        }
      });
    } else if (data.action === 'create') {
      $('#collection-modal').find('form').form({
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
    } else if (data.action === 'edit') {
      $('#collection-modal').find('input[name="name"]').val(data['value'].name);
      $('#collection-modal').find('input[name="cname"]').val(data['value'].path);
      $('#collection-modal').find('textarea[name="description"]').val(data['value'].description);

      $('#collection-modal').find('form').form({
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
    }
  }

  @Input()
  set open(t) {
    this._open = t;
    if (t) {
      $('#collection-modal').find('.accordion').accordion('close', 0);
      $('#collection-modal').modal({
        onHide: () => {
          // workaround
          this.service.activeItem.openModal = false;
        }
      }).modal('show');
    } else {
      $('#collection-modal').modal('hide');
    }
  }

  submit = () => {
    if (!$('#collection-modal').find('form').form('is valid')) {
      // form is not valid (both name and cname)
      return;
    }

    let apiAction = '';
    if (this._value['action'] === 'delete') {
      apiAction = 'delete';
    } else if (this._value['action'] === 'edit') {
      apiAction = 'put';
    } else if (this._value['action'] === 'create') {
      apiAction = 'post';
    }

    $.api({
      action: apiAction + ' ' + this._value['type'],
      on: 'now',
      method: apiAction,
      urlData: apiAction === 'delete' ? { id: this._value['value'].id } : undefined,
      data: JSON.stringify({
        "id": this._value['value'].id,
        "name": $('#collection-modal').find('input[name="name"]').val(),
        "path": $('#collection-modal').find('input[name="cname"]').val(),
        "description": $('#collection-modal').find('textarea[name="description"]').val(),
        "lesson": this._value['value'].lesson ? this._value['value'].lesson.id : undefined, // either
        "exercise": this._value['value'].exercise ? this._value['value'].exercise.id : undefined // not both
      }),
      contentType: 'application/json',
      onResponse: (response) => {
        // make some adjustments to response
        this.service.activeItem.openModal = false;

        if (this._value['action'] === 'delete') {
          switch (this._value['type']) {
            case 'lesson':
              this.service.removeLesson(this._value['value'].id); break;
            case 'exercise':
              this.service.removeExercise(this._value['value'].id); break;
            case 'page':
              this.service.removePage(this._value['value'].id); break;
          }
        } else if (this._value['action'] === 'edit') {
          this._value['value'].name = response.name;
          this._value['value'].path = response.path;
          this._value['value'].description = response.description;
        } else if (this._value['action'] === 'create') {
          this._value['value'].id = response.id;
          this._value['value'].name = response.name;
          this._value['value'].path = response.path;
          this._value['value'].description = response.description;
          switch (this._value['type']) {
            case 'lesson':
              this.service.lessons[response.id] = this._value['value']; break;
            case 'exercise':
              this.service.exercises[response.id] = this._value['value']; break;
            case 'page':
              this.service.pages[response.id] = this._value['value']; break;
          }
        }
      }
    });
  }

  cancel = () => {
    this.service.activeItem.openModal = false;
  }
}
