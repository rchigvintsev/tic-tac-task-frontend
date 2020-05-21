import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, getTestBed, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient, HttpEvent, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {Observable, of} from 'rxjs';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {TasksComponent} from '../tasks/tasks.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {AcceptLanguageInterceptor} from './accept-language.interceptor';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';

describe('AcceptLanguageInterceptor', () => {
  let injector;
  let translateService;
  let interceptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        MatInputModule,
        MatTooltipModule,
        MatDatepickerModule,
        NgxMaterialTimepickerModule
      ],
      declarations: [
        TasksComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent,
        LocalizedDatePipe,
        LocalizedRelativeDatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    injector = getTestBed();
    translateService = injector.get(TranslateService);
    interceptor = injector.get(AcceptLanguageInterceptor);
  }));

  it('should add "Accept-Language" header', () => {
    translateService.currentLang = 'en';

    const request = new HttpRequest('GET', '/');
    const handler = new HttpHandlerMock();

    return interceptor.intercept(request, handler).subscribe(() => {
      expect(handler.savedRequest.headers.get('Accept-Language')).toEqual('en');
    }, _ => fail('An error was not expected'));
  });

  it('should do nothing when current language is not set', () => {
    translateService.currentLang = null;

    const request = new HttpRequest('GET', '/');
    const handler = new HttpHandlerMock();

    return interceptor.intercept(request, handler).subscribe(() => {
      expect(handler.savedRequest.headers.get('Accept-Language')).toBeNull();
    }, _ => fail('An error was not expected'));
  });
});

class HttpHandlerMock extends HttpHandler {
  savedRequest: HttpRequest<any>;

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    this.savedRequest = req;
    return of(new HttpResponse());
  }
}
