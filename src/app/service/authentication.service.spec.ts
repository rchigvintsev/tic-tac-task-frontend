import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import * as moment from 'moment';

import {TestSupport} from '../test/test-support';
import {AuthenticationService} from './authentication.service';
import {ConfigService} from './config.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {Config} from '../model/config';
import {User} from '../model/user';

const AUTHENTICATED_USER_KEY = 'authenticated-user';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(AUTHENTICATED_USER_KEY);

    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });

    injector = getTestBed();

    const loadingIndicatorService = injector.inject(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    service = injector.inject(AuthenticationService);
    httpMock = injector.inject(HttpTestingController);

    const appConfig = new Config();
    appConfig.apiBaseUrl = 'https://backend.com';
    configService = injector.inject(ConfigService);
    configService.setConfig(appConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should treat current user authenticated when valid authenticated user is present', () => {
    const nextDay = moment().utc().add(1, 'days');
    const user = new User().deserialize({
      email: 'john.doe@mail.com',
      validUntilSeconds: Math.round(nextDay.toDate().getTime() / 1000)
    });
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(user));
    expect(service.isUserSignedIn()).toBeTruthy();
  });

  it('should treat current user unauthenticated when authenticated user is not set', () => {
    expect(service.isUserSignedIn()).toBeFalsy();
  });

  it('should treat current user unauthenticated when authenticated user is invalid', () => {
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(new User()));
    expect(service.isUserSignedIn()).toBeFalsy();
  });

  it('should return authenticated user', () => {
    const user = new User().deserialize({validUntilSeconds: Math.round(Date.now() / 1000) + 60 * 60});
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(user));
    expect(service.getUser()).not.toBeNull();
  });

  it('should return null on user get when authenticated user is not set', () => {
    expect(service.getUser()).toBeNull();
  });

  it('should throw error on user set when user is null', () => {
    expect(() => service.setUser(null)).toThrowError('User must not be null or undefined');
  });

  it('should sign out', () => {
    service.signOut().subscribe(() => {});
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/logout`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });

  it('should sign in', () => {
    const username = 'alice';
    const password = 'secret';

    service.signIn(username, password).subscribe(() => {});
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/login`);
    expect(request.request.method).toBe('POST');
    request.flush(JSON.stringify({sub: username}));
  });

  it('should sign up', done => {
    const newUser = new User();
    newUser.email = 'alice@mail.com';
    newUser.fullName = 'Alice';
    newUser.password = 'secret';

    service.signUp(newUser.email, newUser.fullName, newUser.password).subscribe(user => {
      expect(newUser.equals(user)).toBeTruthy();
      done();
    });
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/v1/users`);
    expect(request.request.method).toBe('POST');
    request.flush(newUser.serialize());
  });

  it('should throw error on sign up when email is null', () => {
    expect(() => service.signUp(null, 'Alice', 'secret')).toThrowError('Email must not be null or undefined');
  });

  it('should throw error on sign up when username is null', () => {
    expect(() => service.signUp('alice@mail.com', null, 'secret'))
      .toThrowError('Username must not be null or undefined');
  });
});
