import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NewComponent } from './new.component';
import { WizardComponent } from './components/wizard';

import { EditorComponent } from './editor.component';
import { QEditComponent } from './components/qedit';

import { QEditModeListComponent } from './components/qedit/events-picker';
import { QEditAssetUploaderComponent } from './components/qedit/asset-uploader';
import { QEditRecordComponent } from './components/qedit/record';
import { QEditTemplateListComponent } from './components/qedit/content-picker';
import { QEditRichEditorComponent } from './components/qedit/rich-editor';
import { QEditQnaComponent } from './components/qedit/qna';
import { QEditExtraComponent } from './components/qedit/extra';

import { AssetsComponent } from './assets.component';
import { AssetManagerComponent } from './components/asset-manager';

import { BreadcrumbComponent } from './components/breadcrumb';
import { CollectionListComponent } from './components/collection-list';
import { ModalsComponent } from './components/modals';
import { SidebarComponent } from './components/sidebar';

import { RouterModule }   from '@angular/router';

import { AppComponentService } from './services/services';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    NewComponent,
    AssetsComponent,
    AssetManagerComponent,
    BreadcrumbComponent,
    CollectionListComponent,
    QEditComponent,
    QEditRecordComponent,
    QEditRichEditorComponent,
    QEditAssetUploaderComponent,
    QEditQnaComponent,
    QEditExtraComponent,
    QEditModeListComponent,
    SidebarComponent,
    QEditTemplateListComponent,
    WizardComponent,
    ModalsComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        component: NewComponent
      },
      {
        path: 'editor',
        component: EditorComponent
      },
      {
        path: 'library',
        component: AssetsComponent
      }
    ])
  ],
  providers: [AppComponentService],
  bootstrap: [AppComponent]
})

export class AppModule { }
