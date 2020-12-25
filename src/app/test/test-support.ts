import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ColorBlockModule} from 'ngx-color/block';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {AppComponent} from '../app.component';
import {AlertComponent} from '../component/fragment/alert/alert.component';
import {SigninComponent} from '../component/signin/signin.component';
import {TaskCommentsComponent} from '../component/fragment/task-comments/task-comments.component';
import {TagsComponent} from '../component/fragment/tags/tags.component';
import {TaskListsComponent} from '../component/fragment/task-lists/task-lists.component';
import {BaseTasksComponent} from '../component/fragment/base-tasks/base-tasks.component';
import {TaskGroupTasksComponent} from '../component/task-group-tasks/task-group-tasks.component';
import {TagTasksComponent} from '../component/tag-tasks/tag-tasks.component';
import {TaskListTasksComponent} from '../component/task-list-tasks/task-list-tasks.component';
import {TaskDetailsComponent} from '../component/task-details/task-details.component';
import {SidenavMenuComponent} from '../component/fragment/sidenav-menu/sidenav-menu.component';
import {ConfirmationDialogComponent} from '../component/fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../component/fragment/color-picker-dialog/color-picker-dialog.component';
import {ErrorNotFoundComponent} from '../component/error-not-found/error-not-found.component';
import {DummyComponent} from '../component/dummy/dummy.component';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';

export class TestSupport {
  public static readonly IMPORTS = [
    FormsModule,
    ReactiveFormsModule,
    HttpClientTestingModule,
    MatInputModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatBadgeModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatSelectModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    ColorBlockModule,
    RouterTestingModule.withRoutes(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxMaterialTimepickerModule
  ];

  public static readonly DECLARATIONS = [
    AppComponent,
    AlertComponent,
    SigninComponent,
    TaskCommentsComponent,
    TagsComponent,
    TaskListsComponent,
    BaseTasksComponent,
    TaskGroupTasksComponent,
    TagTasksComponent,
    TaskListTasksComponent,
    TaskDetailsComponent,
    SidenavMenuComponent,
    ConfirmationDialogComponent,
    ColorPickerDialogComponent,
    ErrorNotFoundComponent,
    DummyComponent,
    LocalizedDatePipe,
    LocalizedRelativeDatePipe
  ];
}
