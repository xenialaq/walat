import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-script-editor',
  templateUrl: 'script-editor.html'
})
export class ScriptEditor {
  constructor(private service: AppService, private e: ElementRef) {
  }

  varList = [
    "artichoke",
    "aubergine",
    "basil",
    "bean",
    "celery",
    "corn",
    "daikon",
    "dill",
    "eggplant",
    "endive",
    "fennel",
    "frisee",
    "garlic",
    "ginger",
    "habanero",
    "jalapeno",
    "jicama",
    "kale",
    "kohlrabi",
    "lavender",
    "lettuce",
    "mamey",
    "mushroom",
    "nopale",
    "okra",
    "onion",
    "pea",
    "potato",
    "radish",
    "rhubarb",
    "sage",
    "squash",
    "taro",
    "thyme",
    "wasabi",
    "yam",
    "zucchini"
  ];

  varUsed = [];

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
    this.init();
    this.service.flask.init = this.init;
  }

  init = () => {
    this.varList = this.varUsed.concat(this.varList);
    this.varUsed = [];

    $('#flask-editor').html('');
    this.flask.run('#flask-editor', { language: 'walscript', lineNumbers: true });
    this.flask.onUpdate((code) => {
      let varRecycled = _.remove(this.varUsed, (a) => !code.includes('@' + a));
      this.varList = this.varList.concat(varRecycled);
      this.service.pages[this.service.editor.page.id].setScript(code);
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
    if (cmd.endsWith('@')) {
      const vname = _.sample(this.varList);
      if (!vname) {
        return;
      }
      _.pull(this.varList, vname);
      this.varUsed.push(vname);
      cmd = cmd + vname;
    }
    const lines = this.getLines();
    const lineno = this.getLineno();
    const currentLine = lines[lineno.i];
    const line = this.getLine();
    lines.splice(lineno.col > 0 ? lineno.i : lineno.i - 1, 0, cmd);
    this.flask.update(lines.join('\n'));

    let cursor = lineno.col > 0 ? lineno.end + cmd.length : lineno.start - 1;
    $(this.flask.textarea).prop("selectionStart", cursor);
    $(this.flask.textarea).prop("selectionEnd", cursor);

    $(this.flask.textarea).click();
    $(this.flask.textarea).focus();
  }

  @Input('hidden')
  set hidden(hidden: boolean) {
    if (hidden) {
      $('#flask-container').hide();
    } else {
      $('#flask-container').show();
    }
  }
}
