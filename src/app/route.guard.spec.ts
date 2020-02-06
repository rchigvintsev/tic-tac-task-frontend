import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, Router, UrlSegment} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import * as moment from 'moment';

import {
  AuthenticatedOnlyRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';
import {routes} from './app-routing.module';
import {TranslateHttpLoaderFactory} from './app.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {SigninComponent} from './signin/signin.component';
import {DummyComponent} from './dummy/dummy.component';
import {NotFoundComponent} from './error/not-found/not-found.component';
import {AuthenticationService} from './service/authentication.service';

describe('RouteGuard', () => {
  let guard;
  let injector;
  let router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        NgxMatDatetimePickerModule
      ],
      declarations: [
        DashboardComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent
      ],
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
    beforeEach(() => {
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

      const principal = AuthenticationService.getPrincipal();
      expect(principal).not.toBeNull();
      expect(principal.isValid()).toBeTruthy();
      expect(principal.getSubject()).toEqual(claims.sub);
      expect(principal.getName()).toEqual(claims.name);
      expect(principal.getPicture()).toEqual(claims.picture);
    });
  });
});