import { Component, AfterViewInit, ElementRef, Input } from '@angular/core';

import { AppService } from '../../services/services';

import { Page, Exercise, Lesson, Asset } from '../../models/models';

@Component({
  selector: 'wat-collection-manager',
  templateUrl: 'index.html'
})
export class CollectionManager implements AfterViewInit {
  _ = _;
  constructor(private service: AppService, private e: ElementRef) {
  }

  isPage = false;

  ngAfterViewInit() {
  }

  showExercise = (id) => {
    this.isPage = false;

    if (this.service.activeView.name == 'editor') {
      this.service.activeView.exercise = { id: id, data: {} };
      this.service.activeView.page = { id: 0, data: {} };
      this.service.activeView.line = {
        i: 0,
        cmd: '',
        tag: null,
        data: {} /* field: value */
      };
    } else {
      this.service.activeView.exercise = { id: id };
      this.service.activeView.page = { id: 0 };
    }
  }

  showPage = (id) => {
    this.isPage = true;

    this.service.showPage(id);

    if (this.service.activeView.name == 'editor') {
      let script = this.service.getPage(id).script;

      this.service.flask.init(); /* reset code editor */
      if (!_.isUndefined(script)) {
        this.service.flask.update(script);
      }
    }
  }

  getExercises = () => this.service.exercises[this.service.activeView.lesson.id] || []

  getPages = () => this.service.pages[this.service.activeView.exercise.id] || []

  createExerciseClick = () => {
    let rid = _.random(-5000, -1);

    while (_.has(this.service.exercises, rid)) {
      rid = _.random(-5000, -1);
    }
    let n = new Exercise(rid, '', '', '', this.service.lessons[this.service.activeView.lesson.id]);

    this.service.activeItem = {
      value: n,
      action: 'create',
      type: 'exercise',
      openModal: true
    }
  }

  createPageClick = () => {
    let rid = _.random(-5000, -1);

    while (_.has(this.service.pages, rid)) {
      rid = _.random(-5000, -1);
    }
    let n = new Page(rid, '', '', '', undefined, undefined, this.service.getExercise(this.service.activeView.exercise.id));

    this.service.activeItem = {
      value: n,
      action: 'create',
      type: 'page',
      openModal: true
    }
  }

  editCollectionClick = () => {
    let item;

    if (!this.isPage) {
      // Edit exercise
      item = this.service.getExercise(this.service.activeView.exercise.id);
    } else {
      // Edit page
      item = this.service.getPage(this.service.activeView.page.id);
    }

    this.service.activeItem = {
      value: item,
      action: 'edit',
      type: this.isPage ? 'page' : 'exercise',
      openModal: true
    }
  }

  deleteCollectionClick = () => {
    let item;

    if (!this.isPage) {
      // Edit exercise
      item = this.service.getExercise(this.service.activeView.exercise.id);
    } else {
      // Edit page
      item = this.service.getPage(this.service.activeView.page.id);
    }

    this.service.activeItem = {
      value: item,
      action: 'delete',
      type: this.isPage ? 'page' : 'exercise',
      openModal: true
    }
  }

  exerciseListOpt = {
    onUpdate: (event) => {
      // angular binding does mutation automatically
      const items = this.getExercises();

      $.api({
        action: 'reorder lesson by ID',
        on: 'now',
        method: 'post',
        urlData: {
          id: this.service.activeView.lesson.id
        },
        data: JSON.stringify(items.map(i => i.id)),
        contentType: 'application/json',
        onResponse: (response) => {
          console.log(response);
        }
      });
    }
  }

  pageListOpt = {
    onUpdate: (event) => {
      // angular binding does mutation automatically
      const items = this.getPages();

      $.api({
        action: 'reorder exercise by ID',
        on: 'now',
        method: 'post',
        urlData: {
          id: this.service.activeView.exercise.id
        },
        data: JSON.stringify(items.map(i => i.id)),
        contentType: 'application/json',
        onResponse: (response) => {
          console.log(response);
        }
      });
    }
  }
}
