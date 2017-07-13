class Question {
  id: number;
  name: string;
  path: string;
  events_t: string;
  events_options: Map<string, any>;
  content_t: string;
  content_options: Map<string, any>;
  directions: string;
  notes: string;
  script: string;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.events_options = new Map<string, string>();
    this.content_options = new Map<string, string>();
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
