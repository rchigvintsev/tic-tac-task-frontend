import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient, HttpEvent, HttpRequest, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Observable, of, throwError} from 'rxjs';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';
import {TasksComponent} from '../tasks/tasks.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {HttpErrorInterceptor} from './http-error.interceptor';
import {HttpErrorHandler} from '../error/handler/http-error.handler';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';

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
        MatTooltipModule,
        NgxMatDatetimePickerModule
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
  });

  it('should throw error when error handler is not found', () => {
    const errorHandler = new DummyErrorHandler(false);
    const errorInterceptor = new HttpErrorInterceptor([errorHandler]);
    return errorInterceptor.intercept(null, {
      handle: () => throwError({status: 500})
    }).subscribe(() => fail('An error was expected'), error => expect(error.status).toEqual(500));
  });

  it('should delegate error handling', () => {
    const errorHandler = new DummyErrorHandler(true);
    spyOn(errorHandler, 'handle').and.callThrough();

    const errorInterceptor = new HttpErrorInterceptor([errorHandler]);
    return errorInterceptor.intercept(null, {
      handle: () => throwError({status: 500})
    }).subscribe(() => expect(errorHandler.handle).toHaveBeenCalled(), () => fail('An error was not expected'));
  });
});

class DummyErrorHandler implements HttpErrorHandler {
  constructor(private supportEverything: boolean) {
  }

  supports(error: any): boolean {
    return this.supportEverything;
  }

  handle(error: any, req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return of(new HttpResponse());
  }
}
