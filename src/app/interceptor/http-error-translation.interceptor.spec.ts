import {getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {HttpRequest} from '@angular/common/http';

import {throwError} from 'rxjs';

import {HttpErrorTranslationInterceptor} from './http-error-translation.interceptor';
import {HttpRequestError} from '../error/http-request.error';
import {BadRequestError} from '../error/bad-request.error';
import {UnauthorizedRequestError} from '../error/unauthorized-request.error';
import {ResourceNotFoundError} from '../error/resource-not-found.error';
import {TestSupport} from '../test/test-support';
import {HttpHandlerMock} from '../test/http-handler-mock';

describe('HttpErrorTranslationInterceptor', () => {
  let injector;
  let interceptor: HttpErrorTranslationInterceptor;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();

    injector = getTestBed();
    interceptor = injector.get(HttpErrorTranslationInterceptor);
  }));

  it('should translate response with 400 status code to "BadRequestError"', done => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError({
      url,
      status: 400,
      error: {fieldErrors: [{field: 'test', message: 'Invalid value'}]}
    }));

    interceptor.intercept(request, handler).subscribe(_ => fail('An error was expected'), error => {
      expect(error).toEqual(jasmine.any(BadRequestError));
      done();
    });
  });

  it('should translate response with 401 status code to "UnauthorizedRequestError"', done => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError({url, status: 401}));

    interceptor.intercept(request, handler).subscribe(_ => fail('An error was expected'), error => {
      expect(error).toEqual(jasmine.any(UnauthorizedRequestError));
      done();
    });
  });

  it('should translate response with 404 status code to "ResourceNotFoundError"', done => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError({url, status: 404}));

    interceptor.intercept(request, handler).subscribe(_ => fail('An error was expected'), error => {
      expect(error).toEqual(jasmine.any(ResourceNotFoundError));
      done();
    });
  });

  it('should translate error response to "HttpRequestError" by default', done => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError({url, status: 500}));

    interceptor.intercept(request, handler).subscribe(_ => fail('An error was expected'), error => {
      expect(error).toEqual(jasmine.any(HttpRequestError));
      done();
    });
  });
});
