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
import {MatMenuModule} from '@angular/material/menu';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CookieService} from 'ngx-cookie-service';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TasksComponent} from './tasks/tasks.component';
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {NotBlankValidatorDirective} from './validator/not-blank.directive';
import {TaskCommentsComponent} from './task-comments/task-comments.component';
import {SigninComponent} from './signin/signin.component';
import {NotFoundComponent} from './error/not-found/not-found.component';
import {DummyComponent} from './dummy/dummy.component';
import {AlertComponent} from './alert/alert.component';
import {ConfigService} from './service/config.service';
import {AuthenticationService, CURRENT_USER} from './service/authentication.service';
import {NotFoundErrorInterceptor} from './interceptor/not-found-error.interceptor';

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
    DashboardComponent,
    TasksComponent,
    TaskDetailComponent,
    ConfirmationDialogComponent,
    NotBlankValidatorDirective,
    TaskCommentsComponent,
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
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      multi: true,
      deps: [ConfigService]
    },
    {
      provide: CURRENT_USER,
      useFactory: AuthenticationService.getCurrentUser,
      deps: [AuthenticationService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NotFoundErrorInterceptor,
      multi: true
    },
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppModule {
}
