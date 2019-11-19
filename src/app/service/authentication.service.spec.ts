import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {CookieService} from 'ngx-cookie-service';

import {ACCESS_TOKEN_COOKIE_NAME, AuthenticationService} from './authentication.service';
import {TestAccessToken} from '../test-access-token';
import {ConfigService} from './config.service';
import {Config} from '../model/config';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CookieService]
    });

    injector = getTestBed();

    service = injector.get(AuthenticationService);
    httpMock = injector.get(HttpTestingController);

    const appConfig = new Config();
    appConfig.apiBaseUrl = 'http://backend.com';
    const configService = injector.get(ConfigService);
    configService.setConfig(appConfig);
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
    expect(service.isSignedIn()).toBeTruthy();
  });

  it('should treat current user unauthenticated when access token is expired', () => {
    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.EXPIRED);
    expect(service.isSignedIn()).toBeFalsy();
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

  it('should sign out', () => {
    service.signOut().subscribe(() => {});
    const configService = injector.get(ConfigService);
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/logout`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});
