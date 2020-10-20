import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import localeRu from '@angular/common/locales/ru';
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
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CookieService} from 'ngx-cookie-service';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {ColorCircleModule} from 'ngx-color/circle';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SidenavMenuComponent} from './component/sidenav-menu/sidenav-menu.component';
import {TaskListComponent} from './component/task-list/task-list.component';
import {TasksByGroupComponent} from './component/tasks-by-group/tasks-by-group.component';
import {TasksByTagComponent} from './component/tasks-by-tag/tasks-by-tag.component';
import {TaskDetailsComponent} from './component/task-details/task-details.component';
import {TaskCommentsComponent} from './component/task-comments/task-comments.component';
import {ConfirmationDialogComponent} from './component/confirmation-dialog/confirmation-dialog.component';
import {NotBlankValidatorDirective} from './validator/not-blank.directive';
import {SigninComponent} from './component/signin/signin.component';
import {NotFoundComponent} from './component/not-found/not-found.component';
import {DummyComponent} from './component/dummy/dummy.component';
import {AlertComponent} from './component/alert/alert.component';
import {TagsComponent} from './component/tags/tags.component';
import {ConfigService} from './service/config.service';
import {HttpErrorInterceptor} from './interceptor/http-error.interceptor';
import {AcceptLanguageInterceptor} from './interceptor/accept-language.interceptor';
import {NotFoundErrorHandler} from './error/handler/not-found-error.handler';
import {HTTP_ERROR_HANDLERS} from './error/handler/http-error.handler';
import {LocalizedDatePipe} from './pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from './pipe/localized-relative-date.pipe';

export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function loadConfig(configService: ConfigService) {
  return (): Promise<void> => {
    return configService.loadConfig();
  };
}

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    SidenavMenuComponent,
    TaskListComponent,
    TasksByGroupComponent,
    TasksByTagComponent,
    TaskDetailsComponent,
    TaskCommentsComponent,
    ConfirmationDialogComponent,
    NotBlankValidatorDirective,
    SigninComponent,
    NotFoundComponent,
    DummyComponent,
    AlertComponent,
    TagsComponent,
    LocalizedDatePipe,
    LocalizedRelativeDatePipe
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
    FlexLayoutModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    NgxMaterialTimepickerModule,
    ColorCircleModule,
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
