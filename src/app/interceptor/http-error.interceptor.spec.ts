import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient, HttpEvent, HttpRequest, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

import {Observable, of, throwError} from 'rxjs';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {HttpErrorInterceptor} from './http-error.interceptor';
import {HttpErrorHandler} from '../error/handler/http-error.handler';

describe('HttpErrorInterceptor', () => {
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
        MatInputModule,
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
  });

  it('should throw error when error handler is not found', () => {
    const errorInterceptor = new HttpErrorInterceptor([]);
    return errorInterceptor.intercept(null, {
      handle: () => throwError({status: 500})
    }).subscribe(() => fail('An error was expected'), error => expect(error.status).toEqual(500));
  });

  it('should delegate error handling', () => {
    const errorHandler = new DummyErrorHandler();
    spyOn(errorHandler, 'handle').and.callThrough();

    const errorInterceptor = new HttpErrorInterceptor([errorHandler]);
    return errorInterceptor.intercept(null, {
      handle: () => throwError({status: 500})
    }).subscribe(() => expect(errorHandler.handle).toHaveBeenCalled(), () => fail('An error was not expected'));
  });
});

class DummyErrorHandler implements HttpErrorHandler {
  supports(error: any): boolean {
    return true;
  }

  handle(error: any, req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return of(new HttpResponse());
  }
}
