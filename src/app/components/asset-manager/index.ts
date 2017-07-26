import { Component, AfterViewInit, ElementRef } from '@angular/core';

import { AppService } from '../../services/services';

@Component({
  selector: 'wat-asset-manager',
  templateUrl: 'index.html'
})
export class AssetManager implements AfterViewInit {
  _ = _;
  filesize = filesize;

  constructor(private service: AppService, private e: ElementRef) {
  }

  ngAfterViewInit() {
    $(this.e.nativeElement).find('.dropdown').dropdown();
    const uploaders = [
      {
        input: $('input[name="file-upload"]'),
        trigger: $('#sound-add'),
        label: undefined,
        submit: undefined, /* submits immediately */
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: $('input[name="file-type"]'),
        tvalue: () => 'sound',
        path: $('input[name="file-path"]'),
        pvalue: this.service.getLibraryPath,
        callback: (a) => {
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
          this.service.initAsset(a.id);
        }
      },
      {
        input: $('input[name="file-upload"]'),
        trigger: $('#image-add'),
        label: undefined,
        submit: undefined, /* submits immediately */
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: $('input[name="file-type"]'),
        tvalue: () => 'image',
        path: $('input[name="file-path"]'),
        pvalue: this.service.getLibraryPath,
        callback: (a) => {
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
          this.service.initAsset(a.id);
        }
      },
      {
        input: $('input[name="file-upload"]'),
        trigger: $('#video-add'),
        label: undefined,
        submit: undefined, /* submits immediately */
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: $('input[name="file-type"]'),
        tvalue: () => 'video',
        path: $('input[name="file-path"]'),
        pvalue: this.service.getLibraryPath,
        callback: (a) => {
          this.service.showMessage('success', `${a.name} has been uploaded.`);
          $('#page-wait-dimmer').dimmer('hide');
          this.service.initAsset(a.id);
        }
      }
    ];

    this.service.bindUploaders(uploaders);
  }
}
