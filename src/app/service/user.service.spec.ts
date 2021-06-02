import {HttpTestingController} from '@angular/common/http/testing';
import {getTestBed, TestBed} from '@angular/core/testing';

import {TestSupport} from '../test/test-support';
import {ConfigService} from './config.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {UserService} from './user.service';
import {User} from '../model/user';

describe('UserService', () => {
  let httpMock: HttpTestingController;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}}]
    });

    const injector = getTestBed();

    const loadingIndicatorService = injector.inject(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    httpMock = injector.inject(HttpTestingController);
    userService = injector.inject(UserService);
  });

  it('should be created', () => {
    const service: UserService = TestBed.inject(UserService);
    expect(service).toBeTruthy();
  });

  it('should confirm email', done => {
    const userId = 1;
    const token = 'K1Mb2ByFcfYndPmuFijB';
    userService.confirmEmail(userId, token).subscribe(_ => done());
    const request = httpMock.expectOne(`${userService.baseUrl}/${userId}/email/confirmation/${token}`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
  });

  it('should reset password', done => {
    userService.resetPassword('alice@mail.com').subscribe(_ => done());
    const request = httpMock.expectOne(`${userService.baseUrl}/password/reset`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
  });

  it('should confirm password reset', done => {
    const userId = 1;
    const token = 'K1Mb2ByFcfYndPmuFijB';
    const password = 'qwerty';
    userService.confirmPasswordReset(userId, token, password).subscribe(_ => done());
    const request = httpMock.expectOne(`${userService.baseUrl}/${userId}/password/reset/confirmation/${token}`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
  });

  it('should update user', done => {
    const testUser = new User().deserialize({id: 1, email: 'alice@mail.com'});

    userService.updateUser(testUser).subscribe(user => {
      expect(user).toEqual(testUser);
      done();
    });

    const request = httpMock.expectOne(`${userService.baseUrl}/${testUser.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testUser);
  });

  it('should throw error on user update when user is null', () => {
    expect(() => userService.updateUser(null)).toThrowError('User must not be null or undefined');
  });
});
