import {HttpRequest} from '@angular/common/http';
import {async, getTestBed, TestBed} from '@angular/core/testing';

import {throwError} from 'rxjs';

import {TestSupport} from '../test/test-support';
import {HttpHandlerMock} from '../test/http-handler-mock';
import {UnauthorizedRequestInterceptor} from './unauthorized-request.interceptor';
import {UnauthorizedRequestError} from '../error/unauthorized-request.error';
import {AuthenticationService} from '../service/authentication.service';
import {PageNavigationService} from '../service/page-navigation.service';

describe('UnauthorizedRequestInterceptor', () => {
  let injector;
  let interceptor: UnauthorizedRequestInterceptor;
  let authenticationService: AuthenticationService;
  let pageNavigationService: PageNavigationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();

    injector = getTestBed();

    authenticationService = injector.get(AuthenticationService);
    spyOn(authenticationService, 'removePrincipal').and.stub();

    pageNavigationService = injector.get(PageNavigationService);
    spyOn(pageNavigationService, 'navigateToSigninPage').and.returnValue(Promise.resolve(true));

    interceptor = injector.get(UnauthorizedRequestInterceptor);
  }));

  it('should remove principal when unauthorized request error is occurred', async () => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError(new UnauthorizedRequestError(url, 'Unauthorized')));
    await interceptor.intercept(request, handler).toPromise();
    expect(authenticationService.removePrincipal).toHaveBeenCalled();
  });

  it('should navigate to signin page when unauthorized request error is occurred', async () => {
    const url = '/';
    const request = new HttpRequest('GET', url);
    const handler = new HttpHandlerMock(() => throwError(new UnauthorizedRequestError(url, 'Unauthorized')));
    await interceptor.intercept(request, handler).toPromise();
    expect(pageNavigationService.navigateToSigninPage).toHaveBeenCalled();
  });

  it('should do nothing when unauthorized request error is occurred and current page is signin page', done => {
    spyOn(pageNavigationService, 'isOnSigninPage').and.returnValue(true);

    const url = '/login';
    const request = new HttpRequest('POST', url, null);
    const error = new UnauthorizedRequestError(url, 'Invalid password');
    const handler = new HttpHandlerMock(() => throwError(error));
    interceptor.intercept(request, handler).subscribe(_ => fail('An error was expected'), e => {
      expect(e).toBe(error);
      done();
    });
  });
});
