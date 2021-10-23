import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {NavigationEnd, Router} from '@angular/router';
import {By} from '@angular/platform-browser';

import {EMPTY, of} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

import {AppComponent} from './app.component';
import {AuthenticationService} from './service/authentication.service';
import {User} from './model/user';
import {TestSupport} from './test/test-support';
import {ConfigService} from './service/config.service';
import {TagService} from './service/tag.service';
import {TaskListService} from './service/task-list.service';
import {Language} from './service/i18n.service';
import {Config} from './model/config';
import {HTTP_RESPONSE_HANDLER} from './handler/http-response.handler';
import {DefaultHttpResponseHandler} from './handler/default-http-response.handler';

const CURRENT_LANG = 'ru';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    component.showSidenav = true;

    const injector = getTestBed();

    const translateService = injector.inject(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    const configService = injector.inject(ConfigService);
    configService.setConfig(new Config());

    const tagService = injector.inject(TagService);
    spyOn(tagService, 'getTags').and.returnValue(EMPTY);

    const taskListService = injector.inject(TaskListService);
    spyOn(taskListService, 'getUncompletedTaskLists').and.returnValue(EMPTY);

    authenticationService = injector.inject(AuthenticationService);
    spyOn(authenticationService, 'signOut').and.returnValue(of(true));

    router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
    router.navigateByUrl = jasmine.createSpy('navigateByUrl').and.callFake(() => Promise.resolve());

    const user = new User();
    user.id = 1;
    user.email = 'john.doe@mail.com';
    user.fullName = 'John Doe';
    user.profilePictureUrl = 'https://example.com/avatar.png';
    user.admin = true;
    user.validUntilSeconds = Math.round(Date.now() / 1000) + 60 * 60;
    authenticationService.setAuthenticatedUser(user);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a title 'TicTacTask'`, () => {
    expect(component.title).toEqual('TicTacTask');
  });

  it('should render title in toolbar', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.page > header .application-title').textContent).toContain('TicTacTask');
  });

  it('should render current user\'s name in toolbar', () => {
    const user = authenticationService.getAuthenticatedUser();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('.page > header > mat-toolbar > div.profile-info-container > button');
    expect(element.textContent.trim()).toEqual(user.fullName);
  });

  it('should render current user\'s avatar in toolbar', () => {
    const user = authenticationService.getAuthenticatedUser();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('mat-toolbar > div.profile-info-container img.avatar');
    expect(element.getAttribute('src')).toBe(user.profilePictureUrl);
  });

  it('should render user\'s identicon in toolbar when user does not have a profile picture URL', () => {
    const user = authenticationService.getAuthenticatedUser();
    user.profilePictureUrl = null;
    authenticationService.setAuthenticatedUser(user);
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('mat-toolbar > div.profile-info-container svg.avatar');
    expect(element.getAttribute('data-jdenticon-value')).toBe(user.email);
  });

  it('should sign out on corresponding menu item select', () => {
    component.onSignOutButtonClick();
    expect(authenticationService.signOut).toHaveBeenCalled();
  });

  it('should navigate to signin page after user being signed out', () => {
    component.onSignOutButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'signin']);
  });

  it('should toggle sidenav', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    component.sidenav.toggle = jasmine.createSpy('toggle').and.callFake(() => Promise.resolve());
    component.onSidenavToggleButtonClick();
    expect(component.sidenav.toggle).toHaveBeenCalled();
  });

  it('should hide sidenav when user is not authenticated', () => {
    authenticationService.removeAuthenticatedUser();
    component.onRouterEvent(new NavigationEnd(1, '/', null));
    expect(component.showSidenav).toBeFalsy();
  });

  it('should hide sidenav on error page', () => {
    component.onRouterEvent(new NavigationEnd(1, '/error/404', null));
    expect(component.showSidenav).toBeFalsy();
  });

  it('should hide sidenav on account page', () => {
    component.onRouterEvent(new NavigationEnd(1, '/account', null));
    expect(component.showSidenav).toBeFalsy();
  });

  it('should hide sidenav on admin area page', () => {
    component.onRouterEvent(new NavigationEnd(1, '/admin', null));
    expect(component.showSidenav).toBeFalsy();
  });

  it('should render link to admin area when user is admin', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.debugElement.nativeElement;
    const userMenuButton = compiled.querySelector('mat-toolbar > div.profile-info-container > button');
    userMenuButton.click();

    const element = fixture.debugElement.query(By.css('#admin_area_menu_item'));
    expect(element).toBeTruthy();
  });

  it('should switch language', () => {
    component.onLanguageButtonClick(new Language('en', null));
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
      component.onLanguageButtonClick(new Language('en', null));
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
      component.onLanguageButtonClick(new Language('ru', null));
      expect(router.navigateByUrl).toHaveBeenCalled();
      // @ts-ignore
      const callArg = router.navigateByUrl.calls.mostRecent().args[0];
      expect(callArg).not.toBeNull();
      expect(callArg.toString()).toEqual('/ru/test');
    });

    it('should do nothing on language button click when language is not changed', () => {
      component.onLanguageButtonClick(new Language('en', null));
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
