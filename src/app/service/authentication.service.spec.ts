import {getTestBed, TestBed} from '@angular/core/testing';

import {AuthenticationService} from './authentication.service';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = getTestBed();
    service = injector.get(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
