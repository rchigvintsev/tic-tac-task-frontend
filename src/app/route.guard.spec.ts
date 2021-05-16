import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {ActivatedRouteSnapshot, Router, UrlSegment} from '@angular/router';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {
  AuthenticatedOnlyRouteGuard,
  EmailConfirmationCallbackRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  PasswordResetConfirmationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';
import {AuthenticationService} from './service/authentication.service';
import {TestSupport} from './test/test-support';
import {ConfigService} from './service/config.service';
import {UserService} from './service/user.service';

describe('RouteGuard', () => {
  let guard;
  let injector;
  let router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    injector = getTestBed();

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const translateService = injector.get(TranslateService);
    translateService.currentLang = 'en';
  });

  describe('Localized', () => {
    beforeEach(() => {
      guard = injector.get(LocalizedRouteGuard);
    });

    it('should navigate to 404 error page when valid language is present in URL', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('en', null)];
      expect(guard.canActivate(snapshotMock, null).toString()).toBe('/en/error/404');
    });

    it('should prepend language to target URL when valid language is not present', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('about', null)];
      snapshotMock.queryParams = {test: 'true'};
      expect(guard.canActivate(snapshotMock, null).toString()).toBe('/en/about?test=true');
    });
  });

  describe('UnauthenticatedOnly', () => {
    let authenticationService;

    beforeEach(() => {
      authenticationService = injector.get(AuthenticationService);
      guard = injector.get(UnauthenticatedOnlyRouteGuard);
    });

    it('should deny access when current user is authenticated', () => {
      spyOn(authenticationService, 'isUserSignedIn').and.returnValue(true);
      expect(guard.canActivate(null, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en']);
    });

    it('should allow access when current user is not authenticated', () => {
      spyOn(authenticationService, 'isUserSignedIn').and.returnValue(false);
      expect(guard.canActivate(null, null)).toBeTruthy();
    });
  });

  describe('AuthenticatedOnly', () => {
    let authenticationService;

    beforeEach(() => {
      authenticationService = injector.get(AuthenticationService);
      guard = injector.get(AuthenticatedOnlyRouteGuard);
    });

    it('should deny access when current user is not authenticated', () => {
      spyOn(authenticationService, 'isUserSignedIn').and.returnValue(false);
      expect(guard.canActivate(null, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin']);
    });

    it('should allow access when current user is authenticated', () => {
      spyOn(authenticationService, 'isUserSignedIn').and.returnValue(true);
      expect(guard.canActivate(null, null)).toBeTruthy();
    });
  });

  describe('OAuth2AuthorizationCallback', () => {
    let authenticationService;

    beforeEach(() => {
      authenticationService = injector.get(AuthenticationService);
      guard = injector.get(OAuth2AuthorizationCallbackRouteGuard);
    });

    it('should navigate to signin page when error occurred', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('/', null)];
      snapshotMock.queryParams =  {error: 'true'};
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'], {queryParams: {error: true, message: 'default'}});
    });

    it('should navigate to root page when there is no error', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('/', null)];
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en']);
    });

    it('should set authenticated principal', () => {
      const nextDay = moment().utc().add(1, 'days');
      const claims = {
        sub: '1',
        email: 'john.doe@mail.com',
        name: 'John Doe',
        picture: 'http://example.com/avatar.png',
        exp: Math.round(nextDay.toDate().getTime() / 1000)
      };

      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('/', null)];
      snapshotMock.queryParams =  {access_token_claims: btoa(JSON.stringify(claims))};

      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();

      const principal = authenticationService.getPrincipal();
      expect(principal).not.toBeNull();
      expect(principal.isValid()).toBeTruthy();
      expect(principal.getId()).toEqual(claims.sub);
      expect(principal.getEmail()).toEqual(claims.email);
      expect(principal.getName()).toEqual(claims.name);
      expect(principal.getProfilePictureUrl()).toEqual(claims.picture);
    });
  });

  describe('EmailConfirmationCallback', () => {
    let userService: UserService;

    beforeEach(() => {
      userService = injector.get(UserService);
      guard = injector.get(EmailConfirmationCallbackRouteGuard);
    });

    it('should navigate to signin page with error when query parameter "userId" is missing', done => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/email/confirmation', null)];
      snapshotMock.queryParams = {token: '4b1f7955-a406-4d36-8cbe-d6c61f39e27d'};
      guard.canActivate(snapshotMock, null).subscribe(urlTree => {
        expect(urlTree.toString()).toBe('/en/signin?error=true&message=invalid_email_confirmation_params');
        done();
      });
    });

    it('should navigate to signin page with error when query parameter "token" is missing', done => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/email/confirmation', null)];
      snapshotMock.queryParams = {userId: '1'};
      guard.canActivate(snapshotMock, null).subscribe(urlTree => {
        expect(urlTree.toString()).toBe('/en/signin?error=true&message=invalid_email_confirmation_params');
        done();
      });
    });

    it('should confirm user email', done => {
      userService.confirmEmail = jasmine.createSpy('confirmEmail')
        .and.callFake(() => throwError('Something went wrong'));

      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/email/confirmation', null)];
      const userId = 1;
      const token = '4b1f7955-a406-4d36-8cbe-d6c61f39e27d';
      snapshotMock.queryParams = {userId, token};
      guard.canActivate(snapshotMock, null).subscribe(_ => {
        expect(userService.confirmEmail).toHaveBeenCalledWith(userId, token);
        done();
      });
    });

    it('should navigate to signin page when email is confirmed', done => {
      userService.confirmEmail = jasmine.createSpy('confirmEmail').and.callFake(() => of(true));

      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/email/confirmation', null)];
      snapshotMock.queryParams = {userId: 1, token: '4b1f7955-a406-4d36-8cbe-d6c61f39e27d'};
      guard.canActivate(snapshotMock, null).subscribe(urlTree => {
        expect(urlTree.toString()).toBe('/en/signin?error=false&message=email_confirmed');
        done();
      });
    });

    it('should navigate to signin page with error when some error occurred during email confirmation', done => {
      userService.confirmEmail = jasmine.createSpy('confirmEmail')
        .and.callFake(() => throwError('Something went wrong'));

      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/email/confirmation', null)];
      snapshotMock.queryParams = {userId: 1, token: '4b1f7955-a406-4d36-8cbe-d6c61f39e27d'};
      guard.canActivate(snapshotMock, null).subscribe(urlTree => {
        expect(urlTree.toString()).toBe('/en/signin?error=true&message=failed_to_confirm_email');
        done();
      });
    });
  });

  describe('PasswordResetConfirmationCallback', () => {
    beforeEach(() => {
      guard = injector.get(PasswordResetConfirmationCallbackRouteGuard);
    });

    it('should navigate to signin page with error when query parameter "userId" is missing', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/password/reset/confirmation', null)];
      snapshotMock.queryParams = {token: '4b1f7955-a406-4d36-8cbe-d6c61f39e27d'};
      expect(guard.canActivate(snapshotMock, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'],
        {queryParams: {error: true, message: 'invalid_password_reset_confirmation_params'}});
    });

    it('should navigate to signin page with error when query parameter "token" is missing', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/password/reset/confirmation', null)];
      snapshotMock.queryParams = {userId: '1'};
      expect(guard.canActivate(snapshotMock, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'],
        {queryParams: {error: true, message: 'invalid_password_reset_confirmation_params'}});
    });

    it('should allow access', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('account/password/reset/confirmation', null)];
      snapshotMock.queryParams = {userId: 1, token: '4b1f7955-a406-4d36-8cbe-d6c61f39e27d'};
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
    });
  });
});
