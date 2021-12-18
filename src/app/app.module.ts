import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CookieService} from 'ngx-cookie-service';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {ColorCircleModule} from 'ngx-color/circle';
import {ToastrModule} from 'ngx-toastr';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SidenavMenuComponent} from './component/fragment/sidenav-menu/sidenav-menu.component';
import {BaseTasksComponent} from './component/fragment/base-tasks/base-tasks.component';
import {TaskGroupTasksComponent} from './component/task-group-tasks/task-group-tasks.component';
import {TagTasksComponent} from './component/tag-tasks/tag-tasks.component';
import {TaskListTasksComponent} from './component/task-list-tasks/task-list-tasks.component';
import {ArchiveComponent} from './component/archived-tasks/archive.component';
import {TaskDetailsComponent} from './component/task-details/task-details.component';
import {TaskCommentsComponent} from './component/fragment/task-comments/task-comments.component';
import {ConfirmationDialogComponent} from './component/fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from './component/fragment/color-picker-dialog/color-picker-dialog.component';
import {NotBlankValidatorDirective} from './validator/not-blank.directive';
import {PasswordsMatchValidatorDirective} from './validator/passwords-match.directive';
import {BaseSignComponent} from './component/fragment/base-sign/base-sign.component';
import {SigninComponent} from './component/signin/signin.component';
import {SignupComponent} from './component/signup/signup.component';
import {PasswordResetComponent} from './component/password-reset/password-reset.component';
import {PasswordResetConfirmationComponent} from './component/password-reset-confirmation/password-reset-confirmation.component';
import {ErrorNotFoundComponent} from './component/error-not-found/error-not-found.component';
import {DummyComponent} from './component/dummy/dummy.component';
import {AlertComponent} from './component/fragment/alert/alert.component';
import {TagsComponent} from './component/fragment/tags/tags.component';
import {TaskListsComponent} from './component/fragment/task-lists/task-lists.component';
import {LoadingIndicatorComponent} from './component/fragment/loading-indicator/loading-indicator.component';
import {AccountDialogComponent} from './component/fragment/account-dialog/account-dialog.component';
import {AdminAreaComponent} from './component/admin-area/admin-area.component';
import {ChangePasswordComponent} from './component/fragment/change-password/change-password.component';
import {FocusedDirective} from './component/focused.directive';
import {ConfigService} from './service/config.service';
import {AcceptLanguageInterceptor} from './interceptor/accept-language.interceptor';
import {HttpErrorTranslationInterceptor} from './interceptor/http-error-translation.interceptor';
import {UnauthorizedRequestInterceptor} from './interceptor/unauthorized-request.interceptor';
import {LocalizedDatePipe} from './pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from './pipe/localized-relative-date.pipe';
import {MessageFormatPipe} from './pipe/message-format.pipe';
import {HTTP_RESPONSE_HANDLER} from './handler/http-response.handler';
import {DefaultHttpResponseHandler} from './handler/default-http-response.handler';

export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function loadConfig(configService: ConfigService) {
  return (): Promise<void> => {
    return configService.loadConfig();
  };
}

export function initIcons(iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
  return () => {
    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
    iconRegistry.addSvgIcon('logo-facebook', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/FB_Logo.svg'));
    iconRegistry.addSvgIcon('logo-github', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/GitHub_Logo.svg'));
    iconRegistry.addSvgIcon('logo-vk', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/VK_Blue_Logo.svg'));
  };
}

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    SidenavMenuComponent,
    BaseTasksComponent,
    TaskGroupTasksComponent,
    TagTasksComponent,
    TaskListTasksComponent,
    ArchiveComponent,
    TaskDetailsComponent,
    TaskCommentsComponent,
    ConfirmationDialogComponent,
    ColorPickerDialogComponent,
    AccountDialogComponent,
    LoadingIndicatorComponent,
    NotBlankValidatorDirective,
    PasswordsMatchValidatorDirective,
    BaseSignComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetComponent,
    PasswordResetConfirmationComponent,
    ErrorNotFoundComponent,
    DummyComponent,
    AlertComponent,
    TagsComponent,
    TaskListsComponent,
    AdminAreaComponent,
    ChangePasswordComponent,
    LocalizedDatePipe,
    LocalizedRelativeDatePipe,
    MessageFormatPipe,
    FocusedDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSidenavModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    DragDropModule,
    InfiniteScrollModule,
    NgxMaterialTimepickerModule,
    ColorCircleModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ToastrModule.forRoot({timeOut: 5000, progressBar: true, positionClass: 'toast-bottom-right', newestOnTop: false})
  ],
  exports: [TranslateModule],
  providers: [
    {provide: APP_INITIALIZER, useFactory: loadConfig, multi: true, deps: [ConfigService]},
    {provide: APP_INITIALIZER, useFactory: initIcons, multi: true, deps: [MatIconRegistry, DomSanitizer]},
    {provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: UnauthorizedRequestInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: HttpErrorTranslationInterceptor, multi: true},
    {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler},
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent, ColorPickerDialogComponent, LoadingIndicatorComponent]
})
export class AppModule {
}
