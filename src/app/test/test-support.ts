import {ComponentFixture} from '@angular/core/testing';
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
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ColorBlockModule} from 'ngx-color/block';
import {ToastrModule} from 'ngx-toastr';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {AppComponent} from '../app.component';
import {AlertComponent} from '../component/fragment/alert/alert.component';
import {BaseSignComponent} from '../component/fragment/base-sign/base-sign.component';
import {SigninComponent} from '../component/signin/signin.component';
import {SignupComponent} from '../component/signup/signup.component';
import {PasswordResetComponent} from '../component/password-reset/password-reset.component';
import {PasswordResetConfirmationComponent} from '../component/password-reset-confirmation/password-reset-confirmation.component';
import {TaskCommentsComponent} from '../component/fragment/task-comments/task-comments.component';
import {TagsComponent} from '../component/fragment/tags/tags.component';
import {TaskListsComponent} from '../component/fragment/task-lists/task-lists.component';
import {TaskListComponent} from '../component/fragment/task-list/task-list.component';
import {BaseTasksComponent} from '../component/fragment/base-tasks/base-tasks.component';
import {NewTaskFormComponent} from '../component/fragment/new-task/new-task-form.component';
import {TaskGroupTasksComponent} from '../component/task-group-tasks/task-group-tasks.component';
import {TagTasksComponent} from '../component/tag-tasks/tag-tasks.component';
import {TaskListTasksComponent} from '../component/task-list-tasks/task-list-tasks.component';
import {ArchiveComponent} from '../component/archived-tasks/archive.component';
import {TaskDetailsComponent} from '../component/task-details/task-details.component';
import {SidenavMenuComponent} from '../component/fragment/sidenav-menu/sidenav-menu.component';
import {ConfirmationDialogComponent} from '../component/fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../component/fragment/color-picker-dialog/color-picker-dialog.component';
import {LoadingIndicatorComponent} from '../component/fragment/loading-indicator/loading-indicator.component';
import {AccountDialogComponent} from '../component/fragment/account-dialog/account-dialog.component';
import {AdminSidenavMenuComponent} from '../component/fragment/admin/sidenav-menu/admin-sidenav-menu.component';
import {AdminUsersComponent} from '../component/fragment/admin/users/admin-users.component';
import {ErrorNotFoundComponent} from '../component/error-not-found/error-not-found.component';
import {DummyComponent} from '../component/dummy/dummy.component';
import {ChangePasswordComponent} from '../component/fragment/change-password/change-password.component';
import {FocusedDirective} from '../component/focused.directive';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';
import {MessageFormatPipe} from '../pipe/message-format.pipe';
import {NotBlankValidatorDirective} from '../validator/not-blank.directive';
import {PasswordsMatchValidatorDirective} from '../validator/passwords-match.directive';
import {CookieConsentComponent} from '../component/fragment/cookie-consent/cookie-consent.component';

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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
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
    NgxMaterialTimepickerModule,
    ToastrModule.forRoot({timeOut: 100})
  ];

  public static readonly DECLARATIONS = [
    AppComponent,
    AlertComponent,
    BaseSignComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetComponent,
    PasswordResetConfirmationComponent,
    TaskCommentsComponent,
    TagsComponent,
    TaskListsComponent,
    TaskListComponent,
    BaseTasksComponent,
    NewTaskFormComponent,
    TaskGroupTasksComponent,
    TagTasksComponent,
    TaskListTasksComponent,
    ArchiveComponent,
    TaskDetailsComponent,
    SidenavMenuComponent,
    ConfirmationDialogComponent,
    ColorPickerDialogComponent,
    AccountDialogComponent,
    LoadingIndicatorComponent,
    AdminSidenavMenuComponent,
    AdminUsersComponent,
    ChangePasswordComponent,
    ErrorNotFoundComponent,
    CookieConsentComponent,
    DummyComponent,
    LocalizedDatePipe,
    LocalizedRelativeDatePipe,
    MessageFormatPipe,
    NotBlankValidatorDirective,
    PasswordsMatchValidatorDirective,
    FocusedDirective
  ];

  static setInputValue(fixture: ComponentFixture<any>, inputId: string, value: string) {
    const emailInput = fixture.debugElement.query(By.css('#' + inputId)).nativeElement;
    emailInput.value = value;
    emailInput.dispatchEvent(new Event('input'));
  }
}
