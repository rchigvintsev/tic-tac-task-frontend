import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import * as moment from 'moment';

import {AuthenticationService} from './authentication.service';
import {ConfigService} from './config.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {Config} from '../model/config';
import {User} from '../model/user';

const PRINCIPAL_KEY = 'principal';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});

    injector = getTestBed();

    const loadingIndicatorService = injector.get(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    service = injector.get(AuthenticationService);
    httpMock = injector.get(HttpTestingController);

    const appConfig = new Config();
    appConfig.apiBaseUrl = 'http://backend.com';
    configService = injector.get(ConfigService);
    configService.setConfig(appConfig);
  });

  afterEach(() => {
    localStorage.removeItem(PRINCIPAL_KEY);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should treat current user authenticated when valid authenticated principal is present', () => {
    const nextDay = moment().utc().add(1, 'days');
    const user = new User().deserialize({
      email: 'john.doe@mail.com',
      validUntilSeconds: Math.round(nextDay.toDate().getTime() / 1000)
    });
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(user));
    expect(service.isUserSignedIn()).toBeTruthy();
  });

  it('should treat current user unauthenticated when authenticated principal is not set', () => {
    expect(service.isUserSignedIn()).toBeFalsy();
  });

  it('should treat current user unauthenticated when authenticated principal is invalid', () => {
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(new User()));
    expect(service.isUserSignedIn()).toBeFalsy();
  });

  it('should return authenticated principal', () => {
    const user = new User().deserialize({validUntilSeconds: Math.round(Date.now() / 1000) + 60 * 60});
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(user));
    expect(service.getPrincipal()).not.toBeNull();
  });

  it('should return null on principal get when authenticated principal is not set', () => {
    expect(service.getPrincipal()).toBeNull();
  });

  it('should throw error on principal set when principal is null', () => {
    expect(() => service.setPrincipal(null)).toThrowError('Principal must not be null or undefined');
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
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/users`);
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
