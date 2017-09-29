import { Component, AfterViewInit, NgModule, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';
import { Page, Exercise, Lesson, Asset } from '../../models/models';

import { DirectionsModule } from './module-directions';
import { HideModule } from './module-hide';
import { PlayModule } from './module-play';
import { QnaModule } from './module-qna';
import { RecordModule } from './module-record';
import { TextModule } from './module-text';
import { WaitModule } from './module-wait';

@Component({
  selector: 'wat-pedit',
  templateUrl: 'index.html'
})
@NgModule({
  declarations: [
    DirectionsModule,
    HideModule,
    PlayModule,
    QnaModule,
    RecordModule,
    TextModule,
    WaitModule
  ]
})
export class PEdit implements AfterViewInit {
  _ = _;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  updateLine = (v) => {
    this.service.editor.line.data = v;
    let merged = {};
    merged[this.service.editor.line.tag] = v;
    this.service.editor.page.data = _.merge(
      this.service.editor.page.data,
      merged
    );

    let q = this.service.getPage(this.service.editor.page.id);

    q.setFields(this.service.editor.page.data);
  }

  save = () => {
    this.service.showDimmer();

    setTimeout(() => {
      let q = this.service.getPage(this.service.editor.page.id);
      q.sync(this.service.showDimmer, this.service.hideDimmer);
      this.service.setPage(q);
      $('#success-message>span').text(`${q.name} has been ${q.id > 0 ? 'updated' : 'posted'}.`);
      $('#success-message').transition('fade');
      this.service.hideDimmer();
    }, 2000);
  }

  duplicate = () => {
    let q = this.service.getPage(this.service.editor.page.id);
    let rid = _.random(-5000, -1);

    while (_.has(this.service.pages, rid)) {
      rid = _.random(-5000, -1);
    }
    let dup = new Page(rid, q.name + ' (copy)', q.path, q.description, q.fields, q.script, q.exercise);
    dup.sync(this.service.showDimmer, this.service.hideDimmer);
    this.service.setPage(dup);
    $('#success-message>span').text(`A copy named ${dup.name} has been ${dup.id > 0 ? 'updated' : 'posted'}.`);
    $('#success-message').transition('fade');
  }

  isSynced = () => {
    return this.service.getPage(this.service.editor.page.id) && this.service.getPage(this.service.editor.page.id).isSynced();
  }
}

export * from './events-picker';
export * from './script-editor';
export * from './module-directions';
export * from './module-hide';
export * from './module-play';
export * from './module-qna';
export * from './module-record';
export * from './module-text';
export * from './module-wait';
