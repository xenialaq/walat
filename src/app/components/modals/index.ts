import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

import { Page, Exercise, Lesson, Asset } from '../../models/models';

@Component({
  selector: 'wat-modals',
  templateUrl: 'index.html'
})
export class Modals implements AfterViewInit {
  _ = _;

  _value: object;

  _open: boolean;

  rivers = [
    "aldan",
    "allegheny",
    "amazon",
    "amur",
    "angara",
    "araguaia",
    "aras",
    "argun",
    "arkansas",
    "aruwimi",
    "athabasca",
    "ayeyarwady",
    "barcoo",
    "belaya",
    "beni",
    "benue",
    "bermejo",
    "brahmaputra",
    "brazos",
    "breg",
    "caine",
    "canadian",
    "cauca",
    "chambeshi",
    "churchill",
    "colorado",
    "columbia",
    "congo",
    "cooper",
    "danube",
    "darling",
    "daugava",
    "detroit",
    "dnieper",
    "dniester",
    "dvina",
    "elbe",
    "essequibo",
    "euphrates",
    "finlay",
    "fly",
    "fraser",
    "ganges",
    "georgina",
    "gila",
    "godavari",
    "grande",
    "guapay",
    "guaviare",
    "hooghly",
    "ili",
    "indigirka",
    "indus",
    "iriri",
    "irtysh",
    "ishim",
    "jefferson",
    "jubba",
    "juruena",
    "kagera",
    "kama",
    "kasai",
    "katun",
    "khatanga",
    "khoper",
    "kolyma",
    "krishna",
    "kuskokwim",
    "lena",
    "lerma",
    "limpopo",
    "loire",
    "lomami",
    "mackenzie",
    "madeira",
    "magdalena",
    "mekong",
    "mississippi",
    "missouri",
    "mtkvari",
    "murray",
    "murrumbidgee",
    "narmada",
    "naryn",
    "nelson",
    "niagara",
    "niger",
    "nile",
    "ob",
    "ohio",
    "oka",
    "okavango",
    "olenyok",
    "olyokma",
    "orange",
    "orinoco",
    "ottawa",
    "padma",
    "panj",
    "paraguay",
    "peace",
    "pearl",
    "pechora",
    "pecos",
    "pilcomayo",
    "platte",
    "rhine",
    "rocha",
    "salween",
    "saskatchewan",
    "selenge",
    "senegal",
    "shebelle",
    "shire",
    "slave",
    "snake",
    "sukhona",
    "sutlej",
    "tagus",
    "tarim",
    "tennessee",
    "tigris",
    "tobol",
    "tocantins",
    "tsangpo",
    "ubangi",
    "ucayali",
    "uele",
    "ural",
    "uruguay",
    "vaal",
    "vilyuy",
    "vistula",
    "vitim",
    "vltava",
    "volga",
    "volta",
    "vyatka",
    "warburton",
    "yamuna",
    "yangtze",
    "yenisei",
    "yukon",
    "zambezi",
    "zeya"
  ]

  stones = [
    "granite",
    "anorthosite",
    "banktop",
    "bearl",
    "blaxter",
    "brownstone",
    "caen",
    "catcastle",
    "chalk",
    "charnockite",
    "clipsham",
    "clunch",
    "comblanchien",
    "corallian",
    "corncockle",
    "cotswold",
    "czaple",
    "diabase",
    "diorite",
    "dolomite",
    "dunhouse",
    "elazig",
    "emprador",
    "limestone",
    "flint",
    "marble",
    "frosterley",
    "gabbro",
    "gneiss",
    "granodiorite",
    "haslingden",
    "heavitree",
    "jerusalem",
    "ketton",
    "kielce",
    "larvikite",
    "locharbriggs",
    "marmara",
    "monzonite",
    "mugla",
    "travertine",
    "onyx",
    "peperino",
    "przedborowa",
    "quartzite",
    "sandstone",
    "serpentinite",
    "slate",
    "steatite",
    "stromatolites",
    "strzegom",
    "strzelin",
    "syenite",
    "szczytna",
    "tezontle",
    "travertine",
    "tuffeau",
    "yorkstone"
  ]

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
  }

  @Input()
  set value(data) {
    $('#collection-modal').find('form').form('clear');

    this._value = data;

    if (data.action === 'delete') {
      /* for delete confirmation */
      $('#collection-modal').find('form').form({
        fields: {
          name: {
            identifier: 'name',
            rules: [
              {
                type: 'isExactly',
                value: data['value'].name,
                prompt: 'Please enter the name.'
              }
            ]
          }
        }
      });
    } else if (data.action === 'create') {
      $('#collection-modal').find('input[name="name"]').val([
        _.sample(this.rivers),
        _.sample(this.stones),
        _.random(9) + '' + _.random(9)
      ].join('-'));

      $('#collection-modal').find('form').form({
        fields: {
          name: {
            identifier: 'name',
            rules: [
              {
                type: 'empty',
                prompt: 'Please enter the name.'
              }
            ]
          },
          cname: {
            identifier: 'cname',
            rules: [
              {
                type: 'regExp',
                value: /^(\w+(-\w+)*)?$/,
                prompt: 'Please use words with only alphanumeric and _ characters (words can be hyphenated).'
              }
            ]
          }
        }
      });
    } else if (data.action === 'edit') {
      $('#collection-modal').find('input[name="name"]').val(data['value'].name);
      $('#collection-modal').find('input[name="cname"]').val(data['value'].path);
      $('#collection-modal').find('textarea[name="description"]').val(data['value'].description);

      $('#collection-modal').find('form').form({
        fields: {
          name: {
            identifier: 'name',
            rules: [
              {
                type: 'empty',
                prompt: 'Please enter the name.'
              }
            ]
          },
          cname: {
            identifier: 'cname',
            rules: [
              {
                type: 'regExp',
                value: /^(\w+(-\w+)*)?$/,
                prompt: 'Please use words with only alphanumeric and _ characters (words can be hyphenated).'
              }
            ]
          }
        }
      });
    }

    $('#collection-modal').find('input[name="name"]').focus((event) => {
      $(event.currentTarget).select();
      $(event.currentTarget).mouseup(() => {
        $(event).preventDefault();
      });
    }).unbind('focus');
  }

  @Input()
  set open(t) {
    this._open = t;
    if (t) {
      $('#collection-modal').find('.accordion').accordion('close', 0);
      $('#collection-modal').modal({
        onHide: () => {
          // workaround
          this.service.activeItem.openModal = false;
        }
      }).modal('show');
    } else {
      $('#collection-modal').modal('hide');
    }
  }

  submit = () => {
    if (!$('#collection-modal').find('form').form('is valid')) {
      // form is not valid (both name and cname)
      return;
    }

    let apiAction = '';
    if (this._value['action'] === 'delete') {
      apiAction = 'delete';
    } else if (this._value['action'] === 'edit') {
      apiAction = 'put';
    } else if (this._value['action'] === 'create') {
      apiAction = 'post';
    }

    $.api({
      action: apiAction + ' ' + this._value['type'],
      on: 'now',
      method: apiAction,
      urlData: apiAction === 'delete' ? { id: this._value['value'].id } : undefined,
      data: JSON.stringify({
        "id": this._value['value'].id,
        "name": $('#collection-modal').find('input[name="name"]').val(),
        "path": $('#collection-modal').find('input[name="cname"]').val(),
        "description": $('#collection-modal').find('textarea[name="description"]').val(),
        "lesson": this._value['value'].lesson ? this._value['value'].lesson.id : undefined, // either
        "exercise": this._value['value'].exercise ? this._value['value'].exercise.id : undefined // not both
      }),
      contentType: 'application/json',
      onResponse: (response) => {
        // make some adjustments to response
        this.service.activeItem.openModal = false;

        if (this._value['action'] === 'delete') {
          switch (this._value['type']) {
            case 'lesson':
              this.service.removeLesson(this._value['value'].id); break;
            case 'exercise':
              this.service.removeExercise(this._value['value'].id); break;
            case 'page':
              this.service.removePage(this._value['value'].id); break;
          }
        } else if (this._value['action'] === 'edit') {
          this._value['value'].name = response.name;
          this._value['value'].path = response.path;
          this._value['value'].description = response.description;
        } else if (this._value['action'] === 'create') {
          this._value['value'].id = response.id;
          this._value['value'].name = response.name;
          this._value['value'].path = response.path;
          this._value['value'].description = response.description;
          switch (this._value['type']) {
            case 'lesson':
              this.service.lessons[response.id] = this._value['value'];
              this.service.showLesson(this._value['value'].id);
              break;
            case 'exercise':
              this.service.setExercise(this._value['value']);
              this.service.showExercise(this._value['value'].id);
              break;
            case 'page':
              this.service.setPage(this._value['value']);
              this.service.showPage(this._value['value'].id);
              break;
          }
        }
      }
    });
  }

  cancel = () => {
    this.service.activeItem.openModal = false;
  }
}
