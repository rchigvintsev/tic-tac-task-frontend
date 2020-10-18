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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ColorCircleModule} from 'ngx-color/circle';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {AppComponent} from '../app.component';
import {AlertComponent} from '../alert/alert.component';
import {SigninComponent} from '../signin/signin.component';
import {TaskListComponent} from '../task-list/task-list.component';
import {TasksByGroupComponent} from '../tasks-by-group/tasks-by-group.component';
import {TasksByTagComponent} from '../tasks-by-tag/tasks-by-tag.component';
import {TaskDetailsComponent} from '../task-details/task-details.component';
import {TaskCommentsComponent} from '../task-comments/task-comments.component';
import {SidenavMenuComponent} from '../sidenav-menu/sidenav-menu.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';
import {TagsComponent} from '../tags/tags.component';
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
    BrowserAnimationsModule,
    InfiniteScrollModule,
    ColorCircleModule,
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
    TaskListComponent,
    TasksByGroupComponent,
    TasksByTagComponent,
    TaskDetailsComponent,
    TaskCommentsComponent,
    SidenavMenuComponent,
    ConfirmationDialogComponent,
    NotFoundComponent,
    DummyComponent,
    TagsComponent,
    LocalizedDatePipe,
    LocalizedRelativeDatePipe
  ];
}
