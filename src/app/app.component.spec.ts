import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatMenuModule} from '@angular/material/menu';
import {NavigationEnd, Router} from '@angular/router';

import {of} from 'rxjs';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';

import {AppComponent} from './app.component';
import {TranslateHttpLoaderFactory} from './app.module';
import {AuthenticationService} from './service/authentication.service';
import {User} from './model/user';

const CURRENT_LANG = 'ru';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;
  let authenticationService: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    component.showSidenav = true;

    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    authenticationService = injector.get(AuthenticationService);
    spyOn(authenticationService, 'signOut').and.returnValue(of(true));

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
    router.navigateByUrl = jasmine.createSpy('navigateByUrl').and.callFake(() => Promise.resolve());

    const user = new User();
    user.fullName = 'John Doe';
    user.imageUrl = 'http://example.com/avatar.png';
    user.validUntilSeconds = Math.round(Date.now() / 1000) + 60 * 60;
    authenticationService.setPrincipal(user);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a title 'Orchestra'`, () => {
    expect(component.title).toEqual('Orchestra');
  });

  it('should render title in a toolbar', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.page > header > mat-toolbar > span').textContent).toContain('Orchestra');
  });

  it('should render current user\'s name in a toolbar', () => {
    const principal = authenticationService.getPrincipal();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('.page > header > mat-toolbar > div.profile-info-container > button');
    expect(element.textContent).toEqual(principal.getName());
  });

  it('should render current user\'s avatar in a toolbar', () => {
    const principal = authenticationService.getPrincipal();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('.page > header > mat-toolbar > div.profile-info-container > img.avatar');
    expect(element.getAttribute('src')).toEqual(principal.getPicture());
  });

  it('should sign out on corresponding menu item select', () => {
    component.onSignOutButtonClick();
    expect(authenticationService.signOut).toHaveBeenCalled();
  });

  it('should set principal to null on sign out', () => {
    component.onSignOutButtonClick();
    expect(component.principal).toBeNull();
  });

  it('should navigate to signin page after user being signed out', () => {
    component.onSignOutButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'signin']);
  });

  it('should toggle sidenav', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.sidenav.toggle = jasmine.createSpy('toggle').and.callFake(() => Promise.resolve());
      component.onSidenavToggleButtonClick();
      expect(component.sidenav.toggle).toHaveBeenCalled();
    });
  });

  it('should hide sidenav on error page', () => {
    component.ngDoCheck(); // Initialize authenticated principal
    component.onRouterEvent(new NavigationEnd(1, '/error/404', null));
    expect(component.showSidenav).toBeFalsy();
  });

  it('should switch language', () => {
    component.onLanguageSwitchButtonClick('en');
    expect(router.navigateByUrl).toHaveBeenCalled();
    // @ts-ignore
    const callArg = router.navigateByUrl.calls.mostRecent().args[0];
    expect(callArg).not.toBeNull();
    expect(callArg.toString()).toEqual('/en');
  });

  describe('when router URL is "/test"', () => {
    beforeEach(() => {
      spyOnProperty(router, 'url', 'get').and.returnValue('/test');
    });

    it('should switch language', () => {
      component.onLanguageSwitchButtonClick('en');
      expect(router.navigateByUrl).toHaveBeenCalled();
      // @ts-ignore
      const callArg = router.navigateByUrl.calls.mostRecent().args[0];
      expect(callArg).not.toBeNull();
      expect(callArg.toString()).toEqual('/en/test');
    });
  });

  describe('when router URL is "/en/test"', () => {
    beforeEach(() => {
      spyOnProperty(router, 'url', 'get').and.returnValue('/en/test');
    });

    it('should switch language', () => {
      component.onLanguageSwitchButtonClick('ru');
      expect(router.navigateByUrl).toHaveBeenCalled();
      // @ts-ignore
      const callArg = router.navigateByUrl.calls.mostRecent().args[0];
      expect(callArg).not.toBeNull();
      expect(callArg.toString()).toEqual('/ru/test');
    });

    it('should do nothing on language switch button click when language is not changed', () => {
      component.onLanguageSwitchButtonClick('en');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
