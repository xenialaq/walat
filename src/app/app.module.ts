import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { App } from '.';

import { DashboardView } from './dashboard.view';
import { EditorView } from './editor.view';
import { LibraryView } from './library.view';

import { AssetUploader } from './components/asset-uploader';
import { CollectionManager } from './components/collection-manager';
import { Breadcrumb } from './components/breadcrumb';
import { Modals } from './components/modals';
import { Navigation } from './components/navigation';

import { RouterModule }   from '@angular/router';

import { AppService } from './services/services';

import { AssetManager } from './components/asset-manager';
import { LessonManager } from './components/lesson-manager';
import * as PEdit from './components/pedit';

@NgModule({
  declarations: [
    App,
    // views
    DashboardView,
    EditorView,
    LibraryView,
    // common components
    AssetUploader,
    Breadcrumb,
    CollectionManager,
    Modals,
    Navigation,
    // components for Dashboard
    LessonManager,
    // components for Editor
    PEdit.PEdit,
    PEdit.EventsPicker,
    PEdit.ScriptEditor,
    PEdit.DirectionsModule,
    PEdit.HideModule,
    PEdit.PlayModule,
    PEdit.QnaModule,
    PEdit.RecordModule,
    PEdit.TextModule,
    PEdit.WaitModule,
    PEdit.ContentPicker,
    PEdit.RichEditor,
    // components for Library
    AssetManager
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        component: DashboardView
      },
      {
        path: 'editor',
        component: EditorView
      },
      {
        path: 'library',
        component: LibraryView
      }
    ])
  ],
  providers: [AppService],
  bootstrap: [App]
})

export class AppModule { }
