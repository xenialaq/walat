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

    if (this.service.activeView.name == 'editor') {
      this.service.activeView.page = { id: id, data: _.clone(this.service.pages[id].fields) };

      this.service.activeView.line = {
        i: 0,
        cmd: '',
        tag: null,
        data: {} /* field: value */
      };

      let script = this.service.pages[id].script;

      this.service.flask.init(); /* reset code editor */
      if (!_.isUndefined(script)) {
        this.service.flask.update(script);
      }
    }
    else {
      this.service.activeView.page = { id: id };
    }
  }

  getExercises = () => {
    return _.filter(_.values(this.service.exercises), (e) => {
      return e.lesson.id === this.service.activeView.lesson.id;
    });
  }

  getPages = () => {
    return _.filter(_.values(this.service.pages), (e) => {
      return e.exercise.id === this.service.activeView.exercise.id;
    });
  }

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
    let n = new Page(rid, '', '', '', undefined, undefined, this.service.exercises[this.service.activeView.exercise.id]);

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
      item = this.service.exercises[this.service.activeView.exercise.id];
    } else {
      // Edit page
      item = this.service.pages[this.service.activeView.page.id];
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
      item = this.service.exercises[this.service.activeView.exercise.id];
    } else {
      // Edit page
      item = this.service.pages[this.service.activeView.page.id];
    }

    this.service.activeItem = {
      value: item,
      action: 'delete',
      type: this.isPage ? 'page' : 'exercise',
      openModal: true
    }
  }
}
