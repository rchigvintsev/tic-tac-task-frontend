import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import * as moment from 'moment';

import {AuthenticationService} from './authentication.service';
import {ConfigService} from './config.service';
import {Config} from '../model/config';
import {User} from '../model/user';

const PRINCIPAL_KEY = 'principal';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
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
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(new User()));
    expect(AuthenticationService.getPrincipal()).not.toBeNull();
  });

  it('should return null on principal get when authenticated principal is not set', () => {
    expect(AuthenticationService.getPrincipal()).toBeNull();
  });

  it('should throw error on principal set when principal is null', () => {
    expect(() => AuthenticationService.setPrincipal(null)).toThrowError('Principal must not be null or undefined');
  });

  it('should sign out', () => {
    service.signOut().subscribe(() => {
    });
    const configService = injector.get(ConfigService);
    const request = httpMock.expectOne(`${configService.apiBaseUrl}/logout`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});
