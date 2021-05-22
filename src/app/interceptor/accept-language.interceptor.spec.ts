import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {HttpRequest} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

import {AcceptLanguageInterceptor} from './accept-language.interceptor';
import {TestSupport} from '../test/test-support';
import {HttpHandlerMock} from '../test/http-handler-mock';

describe('AcceptLanguageInterceptor', () => {
  let injector;
  let translateService;
  let interceptor;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    injector = getTestBed();
    translateService = injector.inject(TranslateService);
    interceptor = injector.inject(AcceptLanguageInterceptor);
  }));

  it('should add "Accept-Language" header', done => {
    translateService.currentLang = 'en';

    const request = new HttpRequest('GET', '/');
    const handler = new HttpHandlerMock();

    interceptor.intercept(request, handler).subscribe(() => {
      expect(handler.savedRequest.headers.get('Accept-Language')).toEqual('en');
      done();
    }, _ => fail('An error was not expected'));
  });

  it('should do nothing when current language is not set', done => {
    translateService.currentLang = null;

    const request = new HttpRequest('GET', '/');
    const handler = new HttpHandlerMock();

    interceptor.intercept(request, handler).subscribe(() => {
      expect(handler.savedRequest.headers.get('Accept-Language')).toBeNull();
      done();
    }, _ => fail('An error was not expected'));
  });
});
