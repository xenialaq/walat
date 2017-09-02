import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-asset-uploader',
  templateUrl: 'index.html'
})
export class AssetUploader implements AfterViewInit {
  @Input() name: string;

  constructor(private service: AppService, private e: ElementRef) {
  }

  _value = {
    'name': '',
    'path': '' /* the asset file name */
  };

  _path = ''; /* the working path */

  searchQuery = '';
  isAsset = false;

  ngAfterViewInit() {
    const uploaders = [
      {
        input: $('input[name="file-upload"]'), /* form file input */
        trigger: $(this.e.nativeElement).find('.uploader-select'),
        label: $(this.e.nativeElement).find('.uploader-select'),
        submit: $(this.e.nativeElement).find('.uploader-submit'),
        onSubmit: () => {
          this.service.showDimmer();
        },
        type: $('input[name="file-type"]'), /* form hidden type input */
        tvalue: () => 'sound',
        path: $('input[name="file-path"]'), /* form hidden path input */
        pvalue: () => this._path,
        callback: (data) => {
          // only support single upload
          const d = data[0];
          this.update(d.name, d.path);
          this.searchQuery = d.name;
          $(this.e.nativeElement).find('.use-asset').click();

          this.service.hideDimmer();
        }
      }
    ];

    this.service.bindUploaders(uploaders);

    $(this.e.nativeElement).find('.ui.search').search({
      type: 'standard',
      apiSettings: {
        action: 'get assets',
        data: {
          'name': () => this.searchQuery,
          'path': () => this._path
        },
        onResponse: function(items) {
          var response = {
            results: []
          };
          _.values(items).forEach((item) => {
            // add result to category
            response.results.push({
              title: item.name,
              description: item.path
            });
          });
          return response;
        }
      },
      minCharacters: 3,
      onSelect: (result, response) => {
        this.update(result.title, result.description);
      }
    });
  }

  @Input()
  set value(data) {
    this._value = data;
  }

  @Input()
  set path(data) {
    this._path = data;
  }

  @Output() valueUpdate = new EventEmitter();

  update = (name, path) => {
    this._value['name'] = name;
    this._value['path'] = path;
    this.updateSearch(name);
    this.valueUpdate.emit(this._value);
  }

  updateSearch = (query) => {
    this.searchQuery = query;
  }

  toggleMode = (isAsset) => {
    this.isAsset = isAsset;
  }

  debug = () => {
    console.log('asset-uploader value: ', this._value);
    console.log('asset-uploader path: ', this._path);
    console.log('asset-uploader search query: ', this.searchQuery);
  }
}
