import {getTestBed, TestBed} from '@angular/core/testing';

import {CookieService} from 'ngx-cookie-service';

import {ACCESS_TOKEN_COOKIE_NAME, AuthenticationService} from './authentication.service';
import {TestAccessToken} from '../test-access-token';

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
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.VALID);
    expect(service.isUserAuthenticated()).toBeTruthy();
  });

  it('should treat current user unauthenticated when access token is expired', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.EXPIRED);
    expect(service.isUserAuthenticated()).toBeFalsy();
  });

  it('should return current user', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.VALID);
    const user = AuthenticationService.getCurrentUser(service);
    expect(user).not.toBeNull();
  });

  it('should return null on get current user when access token is expired', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.EXPIRED);
    const user = AuthenticationService.getCurrentUser(service);
    expect(user).toBeNull();
  });
});
