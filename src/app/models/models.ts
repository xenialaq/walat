class Page {
  id: number;
  name: string;
  path: string;
  description: string;
  fields: object; // (field name, value)
  script: string; // walscript template
  exercise: Exercise;

  constructor(id: number, name: string, path: string, description = '', fields = {}, script = '', exercise: Exercise) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
    this.fields = fields;
    this.script = script;
    this.exercise = exercise;
  }
}

class Exercise {
  id: number;
  name: string;
  path: string;
  description: string;
  lesson: Lesson;

  constructor(id: number, name: string, path: string, description = '', lesson: Lesson) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
    this.lesson = lesson;
  }
}

class Lesson {
  id: number;
  name: string;
  path: string;
  description: string;

  constructor(id: number, name: string, path: string, description = '') {
    this.id = id;
    this.name = name;
    this.path = path;
    this.description = description;
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

export {Page, Exercise, Lesson, Asset};
