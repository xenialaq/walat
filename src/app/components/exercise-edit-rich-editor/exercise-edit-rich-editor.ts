import { Component, AfterViewInit } from '@angular/core';
import { EditorComponent } from '../../editor.component';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-exercise-edit-rich-editor',
  templateUrl: 'exercise-edit-rich-editor.html'
})

export class ExerciseEditRichEditorComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

    const options = {
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Compose an epic...',
      readOnly: false,
      theme: 'snow'
    };
    let editor = new Quill('#quill-editor', options); // First matching element will be used

    editor.on('text-change', (delta, oldDelta, source) => {
      this.service.editor.question.template_options.set('text', delta);
    });
  }
}
