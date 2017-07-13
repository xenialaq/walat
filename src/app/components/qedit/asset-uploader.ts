import { Component, AfterViewInit } from '@angular/core';

import { AppComponentService } from '../../services/services';

@Component({
  selector: 'wat-qedit-asset-uploader',
  templateUrl: 'asset-uploader.html'
})
export class QEditAssetUploaderComponent implements AfterViewInit {
  constructor(private service: AppComponentService) {
  }

  ngAfterViewInit() {
    const uploaders = [
      {
        input: 'input[name="file-upload"]',
        trigger: '#uploader-select',
        label: '#uploader-select',
        submit: '#uploader-submit',
        onSubmit: () => {
          $('#page-wait-dimmer').dimmer('show');
        },
        type: 'input[name="file-type"]',
        tvalue: () => 'sound',
        path: 'input[name="file-path"]',
        pvalue: () => this.service.question.path,
        callback: (d) => {
          $('.asset-name').val(d.name);
          $('.asset-name').data('id', d.id);
          this.service.question.events_options.set(`${d.type}-name`, d.name);
          this.service.question.events_options.set(`${d.type}-path`, d.path);
          $('.use-asset').click();

          $('#page-wait-dimmer').dimmer('hide');
        }
      }
    ];

    this.service.bindUploaders(uploaders);

    $('.use-asset').each((i, e) => $(e).unbind().click((event) => {
      console.log('lolol');
      $(e).parent().children().addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $(e).closest('wat-qedit-asset-uploader')
        .find('.asset-options').removeClass('disabled');
      $(e).closest('wat-qedit-asset-uploader')
        .find('.uploaded-options').addClass('disabled');
    }));

    $('.use-uploaded').each((i, e) => $(e).unbind().click((event) => {
      $(e).parent().children().addClass('basic');
      $(event.currentTarget).removeClass('basic');
      $(e).closest('wat-qedit-asset-uploader')
        .find('.asset-options').addClass('disabled');
      $(e).closest('wat-qedit-asset-uploader')
        .find('.uploaded-options').removeClass('disabled');
    }));


    $('#asset-search').search({
      type: 'standard',
      apiSettings: {
        action: 'get assets',
        data: {
          'name': () => $('#asset-name').val()
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
      minCharacters: 3
    });
  }
}
