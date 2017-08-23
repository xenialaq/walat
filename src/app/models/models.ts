class Page {
  id: number;
  name: string;
  path: string;
  description: string;
  fields: object; // (field name, value)
  script: string; // walscript template
  exercise: Exercise;
  synced = false;

  constructor(id: number, name: string, path: string, description = '', fields = {}, script = undefined, exercise: Exercise) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
    this.fields = fields;
    this.script = script;
    this.exercise = exercise;
  }

  isSynced = () => {
    return this.synced;
  }

  setName = (v) => {
    if (this.name === v) {
      return;
    }
    this.name = v;
    this.synced = false;
  }

  setPath = (v) => {
    if (this.path === v) {
      return;
    }
    this.path = v;
    this.synced = false;
  }

  setDescription = (v) => {
    if (this.description === v) {
      return;
    }
    this.description = v;
    this.synced = false;
  }

  setFields = (v) => {
    if (this.fields === v) {
      return;
    }
    this.fields = v;
    this.synced = false;
  }

  setScript = (v) => {
    if (this.script === v) {
      return;
    }
    this.script = v;
    this.synced = false;
  }

  setExercise = (v) => {
    if (this.exercise === v) {
      return;
    }
    this.exercise = v;
    this.synced = false;
  }

  sync = (registry, pre = undefined, post = undefined) => {
    if (pre) {
      pre();
    }

    $.api({
      action: `${this.id > 0 ? 'put' : 'post'} page`,
      on: 'now',
      method: this.id > 0 ? 'put' : 'post',
      data: JSON.stringify({
        id: this.id,
        name: this.name,
        path: this.path,
        description: this.description,
        fields: JSON.stringify(this.fields),
        script: this.script,
        exercise: this.exercise.id
      }),
      contentType: 'application/json',
      onResponse: (response) => {
        delete registry[this.id];
        this.synced = true;
        this.id = response.id; /* if post */
        registry[this.id] = this;

        if (post) {
          post();
        }
      }
    });
  }
}

class Exercise {
  id: number;
  name: string;
  path: string;
  description: string;
  lesson: Lesson;
  synced = false;

  constructor(id: number, name: string, path: string, description = '', lesson: Lesson) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
    this.lesson = lesson;
  }

  setName = (v) => {
    this.name = v;
    this.synced = false;
  }

  setPath = (v) => {
    this.path = v;
    this.synced = false;
  }

  setDescription = (v) => {
    this.description = v;
    this.synced = false;
  }

  sync = (registry, pre = undefined, post = undefined) => {
    if (pre) {
      pre();
    }

    $.api({
      action: `${this.id > 0 ? 'put' : 'post'} an exercise`,
      on: 'now',
      method: this.id > 0 ? 'put' : 'post',
      data: JSON.stringify({
        id: this.id,
        name: this.name,
        path: this.path,
        description: this.description,
        lesson: this.lesson.id
      }),
      contentType: 'application/json',
      onResponse: (response) => {
        delete registry[this.id];
        this.synced = true;
        this.id = response.id; /* if post */
        registry[this.id] = this;

        if (post) {
          post();
        }
      }
    });
  }
}

class Lesson {
  id: number;
  name: string;
  path: string;
  description: string;
  synced = false;

  constructor(id: number, name: string, path: string, description = '') {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
  }

  setName = (v) => {
    this.name = v;
    this.synced = false;
  }

  setPath = (v) => {
    this.path = v;
    this.synced = false;
  }

  setDescription = (v) => {
    this.description = v;
    this.synced = false;
  }

  sync = (registry, pre = undefined, post = undefined) => {
    if (pre) {
      pre();
    }

    $.api({
      action: `${this.id > 0 ? 'put' : 'post'} lesson`,
      on: 'now',
      method: this.id > 0 ? 'put' : 'post',
      data: JSON.stringify({
        id: this.id,
        name: this.name,
        path: this.path,
        description: this.description
      }),
      contentType: 'application/json',
      onResponse: (response) => {
        delete registry[this.id];
        this.synced = true;
        this.id = response.id; /* if post */
        registry[this.id] = this;

        if (post) {
          post();
        }
      }
    });
  }
}

class Asset {
  id: number;
  name: string;
  path: string;
  type: string;
  attribute: string;

  constructor(id: number, name: string, path: string, type: string, attribute = '') {
    this.id = id;
    this.name = name;
    this.path = path;
    this.type = type;
    this.attribute = attribute;
  }

  public getUrl = () => '/assets/uploads/' + this.path.split('/').pop();
}

export { Page, Exercise, Lesson, Asset };
