class Question {
  id: number;
  name: string;
  path: string;
  recording_mode: string;
  mode_options: Map<string, any>;
  template: string;
  template_options: Map<string, any>;
  directions: string;
  notes: string;
  script: string;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.mode_options = new Map<string, string>();
    this.template_options = new Map<string, string>();
  }
}

class Exercise {
  id: number;
  name: string;
  path: string;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
  }
}

class Lesson {
  id: number;
  name: string;
  path: string;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
  }
}

class Asset {
  id: number;
  name: string;
  path: string;
  type: string;
  attribute: string;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
  }
}

export {Question, Exercise, Lesson, Asset};
