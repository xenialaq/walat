import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor.component';
import { NewComponent } from './new.component';

import { SidebarComponent } from './components/sidebar/sidebar';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb';
import { ExerciseListComponent } from './components/exercise-list/exercise-list';
import { ExerciseEditComponent } from './components/exercise-edit/exercise-edit';

import { ModeListComponent } from './components/mode-list/mode-list';
import { ExerciseEditSoundUploaderComponent } from './components/exercise-edit-sound-uploader/exercise-edit-sound-uploader';
import { ExerciseEditRecordComponent } from './components/exercise-edit-record/exercise-edit-record';

import { TemplateListComponent } from './components/template-list/template-list';
import { ExerciseEditRichEditorComponent } from './components/exercise-edit-rich-editor/exercise-edit-rich-editor';
import { ExerciseEditSlideUploaderComponent } from './components/exercise-edit-slide-uploader/exercise-edit-slide-uploader';
import { ExerciseEditVideoUploaderComponent } from './components/exercise-edit-video-uploader/exercise-edit-video-uploader';
import { ExerciseEditQnaComponent } from './components/exercise-edit-qna/exercise-edit-qna';

import { ExerciseEditExtraComponent } from './components/exercise-edit-extra/exercise-edit-extra';

import { WizardComponent } from './components/wizard/wizard';

import { RouterModule }   from '@angular/router';

import { AppComponentService } from './services/services';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    NewComponent,
    BreadcrumbComponent,
    ExerciseListComponent,
    ExerciseEditComponent,
    ExerciseEditRecordComponent,
    ExerciseEditRichEditorComponent,
    ExerciseEditSlideUploaderComponent,
    ExerciseEditSoundUploaderComponent,
    ExerciseEditVideoUploaderComponent,
    ExerciseEditQnaComponent,
    ExerciseEditExtraComponent,
    ModeListComponent,
    SidebarComponent,
    TemplateListComponent,
    WizardComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'new',
        component: NewComponent
      },
      {
        path: 'editor',
        component: EditorComponent
      }
    ])
  ],
  providers: [AppComponentService],
  bootstrap: [AppComponent]
})

export class AppModule { }
