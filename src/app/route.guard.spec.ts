import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, Router, UrlSegment} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {
  AuthenticatedOnlyRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';
import {AuthenticationService} from './service/authentication.service';
import {TestSupport} from './test/test-support';

describe('RouteGuard', () => {
  let guard;
  let injector;
  let router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
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
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'error', '404']);
    });

    it('should prepend language to target URL when valid language is not present', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('about', null)];
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'about']);
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

    it('should navigate to signin page when error is occurred', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('/', null)];
      snapshotMock.queryParams =  {error: 'true'};
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'], {queryParams: {error: true}});
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
        sub: 'john.doe@mail.com',
        name: 'John Doe',
        picture: 'http://example.com/avatar.png',
        exp: Math.round(nextDay.toDate().getTime() / 1000)
      };

      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('/', null)];
      snapshotMock.queryParams =  {claims: btoa(JSON.stringify(claims))};

      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();

      const principal = authenticationService.getPrincipal();
      expect(principal).not.toBeNull();
      expect(principal.isValid()).toBeTruthy();
      expect(principal.getSubject()).toEqual(claims.sub);
      expect(principal.getName()).toEqual(claims.name);
      expect(principal.getPicture()).toEqual(claims.picture);
    });
  });
});
