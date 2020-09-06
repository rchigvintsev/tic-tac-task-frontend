import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HttpEvent, HttpRequest, HttpResponse} from '@angular/common/http';

import {Observable, of, throwError} from 'rxjs';
import {HttpErrorInterceptor} from './http-error.interceptor';
import {HttpErrorHandler} from '../error/handler/http-error.handler';
import {TestSupport} from '../test/test-support';

describe('HttpErrorInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
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
