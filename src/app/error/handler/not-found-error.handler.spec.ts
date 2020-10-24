import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';
import {NotFoundErrorHandler} from './not-found-error.handler';
import {TestSupport} from '../../test/test-support';

describe('NotFoundErrorHandler', () => {
  let injector: TestBed;
  let router;
  let handler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    injector = getTestBed();

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const translateService = injector.get(TranslateService);
    translateService.currentLang = 'en';

    handler = injector.get(NotFoundErrorHandler);
  });

  it('should navigate to 404 error page when response status is "404 Not found"', () => {
    handler.handle(null).subscribe(() => {});
    expect(router.navigate).toHaveBeenCalledWith(['en', 'error', '404']);
  });

  it('should support only not "404 Not found" error', () => {
    expect(handler.supports({status: 500})).toBeFalsy();
  });
});
