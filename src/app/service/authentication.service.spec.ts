import {getTestBed, TestBed} from '@angular/core/testing';

import {CookieService} from 'ngx-cookie-service';

import {ACCESS_TOKEN_COOKIE_NAME, AuthenticationService} from './authentication.service';

const ACCESS_TOKEN = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
const EXPIRED_ACCESS_TOKEN = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2Mj'
  + 'M5MDIyLCJleHAiOjE1MTYyMzkwMjN9';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [CookieService]});
    injector = getTestBed();
    service = injector.get(AuthenticationService);
  });

  afterEach(() => {
    const cookieService = injector.get(CookieService);
    cookieService.delete(ACCESS_TOKEN_COOKIE_NAME);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should treat current user authenticated when valid access token is present', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN);
    expect(service.isUserAuthenticated()).toBeTruthy();
  });

  it('should treat current user unauthenticated when access token is expired', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, EXPIRED_ACCESS_TOKEN);
    expect(service.isUserAuthenticated()).toBeFalsy();
  });
});
