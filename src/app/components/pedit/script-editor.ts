import { Component, AfterViewInit } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-script-editor',
  templateUrl: 'script-editor.html'
})
export class ScriptEditor {
  constructor(private service: AppService) {
  }

  ngAfterViewInit() {
    const flask = new CodeFlask;
    this.service.flask = flask;
    Prism.languages.walscript = {
      'important': /^Lesson [\w\s-]+\n/m,
      'comment': /^\((start|end) of exercise [\w\s-]+\)\n/m,
      'function': /^(show text|show directions|hide|hide text|hide directions|pause|wait|play|record|expect)/m,
      'constant': /(comparison button|thisPage|nextPage|Q&A submission)/,
      'selector': /^\\[\w\s-]+\n/m /* \Some page */
    };
    flask.run('#flask-editor', { language: 'walscript', lineNumbers: true });
    flask.onUpdate(function(code) {
      // console.log("User's input code: " + code);
    });

    $(flask.textarea).click((event) => {
      const pos = $(event.currentTarget).prop("selectionStart");
      const lines = $(event.currentTarget).val().split('\n');

      let start = 0; let lineIdx = 0;
      while (start <= pos) {
        start += lines[lineIdx].length;
        start += 1; // line end
        lineIdx = lineIdx + 1;
      }
      let end = start;
      start -= lines[lineIdx - 1].length;

      // line highlight plugin # starts from 1
      $(flask.textarea).next().attr('data-line', lineIdx);
      $(flask.textarea).next().children().attr('data-line', lineIdx);
      flask.update();

      this.service.editor.line.i = lineIdx;
      this.service.loadOptions(lines[lineIdx-1]);
    });
  }
}
