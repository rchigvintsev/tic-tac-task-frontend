import {getTestBed, TestBed} from '@angular/core/testing';

import {JwtModule} from '@auth0/angular-jwt';

import {AuthenticationService} from './authentication.service';
import {getAccessToken, setAccessToken} from '../access-token';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0I' +
  'joxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const EXPIRED_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lI' +
  'iwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjN9.NOUocIfaeHejlAo3QDaWSH0tNJEupC1tVrgpPFz6470';

describe('AuthenticationService', () => {
  let injector: TestBed;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        JwtModule.forRoot({
          config: {
            tokenGetter: getAccessToken,
            whitelistedDomains: ['localhost:8080']
          }
        })
      ]
    });
    injector = getTestBed();
    service = injector.get(AuthenticationService);
  });

  afterEach(() => setAccessToken(null));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should treat current user authenticated when valid access token is present', () => {
    setAccessToken(ACCESS_TOKEN);
    expect(service.isUserAuthenticated()).toBeTruthy();
  });

  it('should treat current user unauthenticated when access token is expired', () => {
    setAccessToken(EXPIRED_ACCESS_TOKEN);
    expect(service.isUserAuthenticated()).toBeFalsy();
  });
});
