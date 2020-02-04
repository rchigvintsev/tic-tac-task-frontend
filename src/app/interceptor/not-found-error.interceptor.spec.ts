import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';

import {throwError} from 'rxjs';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {NotFoundErrorInterceptor} from './not-found-error.interceptor';

describe('NotFoundErrorInterceptor', () => {
  let injector: TestBed;
  let router;
  let interceptor;

  beforeEach(() => {
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
        NgxMatDatetimePickerModule
      ],
      declarations: [
        DashboardComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    injector = getTestBed();

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const translateService = injector.get(TranslateService);
    translateService.currentLang = 'en';

    interceptor = injector.get(NotFoundErrorInterceptor);
  });

  it('should navigate to 404 error page when response status is "404 Not found"', () => {
    return interceptor.intercept(null, {
      handle: () => {
        return throwError({status: 404});
      }
    }).subscribe(() => {
      expect(router.navigate).toHaveBeenCalledWith(['en', 'error', '404']);
    });
  });

  it('should ignore error when response status is not "404 Not found"', () => {
    return interceptor.intercept(null, {
      handle: () => {
        return throwError({status: 500});
      }
    }).subscribe(() => fail('An error was expected'), error => {
      expect(error.status).toEqual(500);
    });
  });
});
