import {getTestBed, TestBed} from '@angular/core/testing';

import {JwtModule} from '@auth0/angular-jwt';

import {AuthenticationService} from './authentication.service';
import {getAccessToken} from '../access-token';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        JwtModule.forRoot({
          config: {
            tokenGetter: getAccessToken,
            whitelistedDomains: ['localhost:8080'],
          }
        })
      ]
    });
    injector = getTestBed();
    service = injector.get(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
