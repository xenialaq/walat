import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-script-editor',
  templateUrl: 'script-editor.html'
})
export class ScriptEditor {
  constructor(private service: AppService, private e: ElementRef) {
  }

  defaults = {
  }

  _value = this.defaults;

  flask = new CodeFlask;

  ngAfterViewInit() {
    this.service.flask = this.flask;
    Prism.languages.walscript = {
      'important': /^Lesson [\w\s-]+\n/m,
      'comment': /^\((start|end) of exercise [\w\s-]+\)\n/m,
      'function': /^(show text|show directions|hide|hide text|hide directions|pause|wait|play|record|expect)/m,
      'constant': /(comparison button|thisPage|nextPage|Q&A submission)/,
      'selector': /^\\[\w\s-]+\n/m, /* \Some page */
      'url': /@\w+\s*$/m
    };
    this.flask.run('#flask-editor', { language: 'walscript', lineNumbers: true });
    this.flask.onUpdate(function(code) {
      // console.log("User's input code: " + code);
    });

    $(this.flask.textarea).click((event) => {
      const pos = $(event.currentTarget).prop("selectionStart");
      const lineno = this.getLineno();

      // line highlight plugin # starts from 1
      $(this.flask.textarea).next().attr('data-line', lineno.i);
      $(this.flask.textarea).next().children().attr('data-line', lineno.i);
      this.flask.update();

      this.service.editor.line.i = lineno.i;
      this.service.loadOptions(this.getLine());
    });
  }

  getLine = () => {
    return this.getLines()[this.getLineno().i - 1];
  }

  getLines = () => {
    return $(this.flask.textarea).val().split('\n');
  }

  getLineno = () => {
    const lines = this.getLines();

    const pos = $(this.flask.textarea).prop("selectionStart");

    let start = 0; let lineIdx = 0;
    while (start <= pos) {
      start += lines[lineIdx].length;
      start += 1; // line end
      lineIdx = lineIdx + 1;
    }
    let end = start;
    start -= lines[lineIdx - 1].length;

    return { i: lineIdx, start: start, end: end, position: pos, col: pos - start };
  }

  insert = (cmd) => {
    const lines = this.getLines();
    const lineno = this.getLineno();
    const line = this.getLine();
    lines.splice(lineno.i, 0, cmd);
    this.flask.update(lines.join('\n'));

    $(this.flask.textarea).prop("selectionStart", lineno.end + cmd.length);
    $(this.flask.textarea).prop("selectionEnd", lineno.end + cmd.length);

    $(this.flask.textarea).focus();
  }
}
