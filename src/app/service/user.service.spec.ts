import {HttpTestingController} from '@angular/common/http/testing';
import {getTestBed, TestBed} from '@angular/core/testing';

import {TestSupport} from '../test/test-support';
import {ConfigService} from './config.service';
import {UserService} from './user.service';
import {User} from '../model/user';

describe('TaskListService', () => {
  let httpMock: HttpTestingController;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    });
    const injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    userService = injector.get(UserService);
  });

  it('should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });

  it('should create user', done => {
    const testUser = new User().deserialize({email: 'alice@mail.com', password: 'secret', fullName: 'Alice'});
    userService.createUser(testUser).subscribe(user => {
      expect(user).toEqual(testUser);
      done();
    });

    const request = httpMock.expectOne(userService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testUser.serialize());
  });

  it('should throw error on user create when user is null', () => {
    expect(() => userService.createUser(null)).toThrow(new Error('User must not be null or undefined'));
  });

  it('should confirm email', done => {
    const userId = 1;
    const token = 'K1Mb2ByFcfYndPmuFijB';
    userService.confirmEmail(userId, token).subscribe(_ => done());
    const request = httpMock.expectOne(`${userService.baseUrl}/${userId}/email/confirmation/${token}`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
  });
});
