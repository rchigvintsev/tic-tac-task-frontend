import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, Router, UrlSegment} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';

import {AuthenticatedOnlyRouteGuard, LocalizedRouteGuard, UnauthenticatedOnlyRouteGuard} from './route.guard';
import {routes} from './app-routing.module';
import {TranslateHttpLoaderFactory} from './app.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {LoginComponent} from './login/login.component';
import {DummyComponent} from './dummy/dummy.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {AuthenticationService} from './service/authentication.service';

describe('RouteGuard', () => {
  let guard;

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
        })
      ],
      declarations: [
        DashboardComponent,
        TaskDetailComponent,
        LoginComponent,
        DummyComponent,
        NotFoundComponent
      ],
      providers: [CookieService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('Localized', () => {
    let router;

    beforeEach(() => {
      const injector = getTestBed();

      router = injector.get(Router);
      router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

      const translateService = injector.get(TranslateService);
      translateService.currentLang = 'en';

      guard = injector.get(LocalizedRouteGuard);
    });

    it('should navigate to 404 page when valid language is present in URL', () => {
      const snapshotMock = new ActivatedRouteSnapshot();
      snapshotMock.url = [new UrlSegment('en', null)];
      expect(guard.canActivate(snapshotMock, null)).toBeTruthy();
      expect(router.navigate).toHaveBeenCalledWith(['en', '404']);
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
    let router;

    beforeEach(() => {
      const injector = getTestBed();
      authenticationService = injector.get(AuthenticationService);

      router = injector.get(Router);
      router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

      const translateService = injector.get(TranslateService);
      translateService.currentLang = 'en';

      guard = injector.get(UnauthenticatedOnlyRouteGuard);
    });

    it('should deny access when current user is authenticated', () => {
      spyOn(authenticationService, 'isUserAuthenticated').and.returnValue(true);
      expect(guard.canActivate(null, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en']);
    });

    it('should allow access when current user is not authenticated', () => {
      spyOn(authenticationService, 'isUserAuthenticated').and.returnValue(false);
      expect(guard.canActivate(null, null)).toBeTruthy();
    });
  });

  describe('AuthenticatedOnly', () => {
    let authenticationService;
    let router;

    beforeEach(() => {
      const injector = getTestBed();
      authenticationService = injector.get(AuthenticationService);

      router = injector.get(Router);
      router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

      const translateService = injector.get(TranslateService);
      translateService.currentLang = 'en';

      guard = injector.get(AuthenticatedOnlyRouteGuard);
    });

    it('should deny access when current user is not authenticated', () => {
      spyOn(authenticationService, 'isUserAuthenticated').and.returnValue(false);
      expect(guard.canActivate(null, null)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'login']);
    });

    it('should allow access when current user is authenticated', () => {
      spyOn(authenticationService, 'isUserAuthenticated').and.returnValue(true);
      expect(guard.canActivate(null, null)).toBeTruthy();
    });
  });
});
