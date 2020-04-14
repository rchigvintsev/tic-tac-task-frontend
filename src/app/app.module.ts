import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatToolbarModule
} from '@angular/material';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CookieService} from 'ngx-cookie-service';
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from 'ngx-mat-datetime-picker';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TaskGroupsComponent} from './task-groups/task-groups.component';
import {TasksComponent} from './tasks/tasks.component';
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {TaskCommentsComponent} from './task-comments/task-comments.component';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {NotBlankValidatorDirective} from './validator/not-blank.directive';
import {SigninComponent} from './signin/signin.component';
import {NotFoundComponent} from './error/not-found/not-found.component';
import {DummyComponent} from './dummy/dummy.component';
import {AlertComponent} from './alert/alert.component';
import {ConfigService} from './service/config.service';
import {AuthenticationService, PRINCIPAL} from './service/authentication.service';
import {HttpErrorInterceptor} from './interceptor/http-error.interceptor';
import {AcceptLanguageInterceptor} from './interceptor/accept-language.interceptor';
import {NotFoundErrorHandler} from './error/handler/not-found-error.handler';
import {HTTP_ERROR_HANDLERS} from './error/handler/http-error.handler';

export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function loadConfig(configService: ConfigService) {
  return (): Promise<void> => {
    return configService.loadConfig();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    TaskGroupsComponent,
    TasksComponent,
    TaskDetailComponent,
    TaskCommentsComponent,
    ConfirmationDialogComponent,
    NotBlankValidatorDirective,
    SigninComponent,
    NotFoundComponent,
    DummyComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
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
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: loadConfig, multi: true, deps: [ConfigService]},
    {provide: PRINCIPAL, useFactory: AuthenticationService.getPrincipal, deps: [AuthenticationService]},
    {provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true},
    {provide: HTTP_ERROR_HANDLERS, useClass: NotFoundErrorHandler, multi: true},
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppModule {
}
