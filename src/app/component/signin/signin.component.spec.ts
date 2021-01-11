import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SigninComponent} from './signin.component';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {AuthenticationService} from '../../service/authentication.service';
import {Config} from '../../model/config';
import {TestSupport} from '../../test/test-support';

const CURRENT_LANG = 'en';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let authenticationService: AuthenticationService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({error: true}))
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    const alertService = injector.get(AlertService);
    spyOn(alertService, 'error').and.stub();

    authenticationService = injector.get(AuthenticationService);
    spyOn(authenticationService, 'signIn').and.callFake(username => of({sub: username}));
    spyOn(authenticationService, 'setPrincipal').and.callThrough();

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message when error query parameter is present', () => {
    const translate = fixture.debugElement.injector.get(TranslateService);
    const alertService = fixture.debugElement.injector.get(AlertService);
    expect(alertService.error).toHaveBeenCalledWith(translate.instant('sign_in_error'));
  });

  it('should sign in on signin form submit', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.password = 'secret';

      const emailInput = fixture.debugElement.query(By.css('#email_input')).nativeElement;
      emailInput.value = component.email;
      emailInput.dispatchEvent(new Event('input'));

      const passwordInput = fixture.debugElement.query(By.css('#password_input')).nativeElement;
      passwordInput.value = component.password;
      passwordInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(authenticationService.setPrincipal).toHaveBeenCalled();
    });
  });

  it('should navigate to home page on sign in', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.password = 'secret';

      const emailInput = fixture.debugElement.query(By.css('#email_input')).nativeElement;
      emailInput.value = component.email;
      emailInput.dispatchEvent(new Event('input'));

      const passwordInput = fixture.debugElement.query(By.css('#password_input')).nativeElement;
      passwordInput.value = component.password;
      passwordInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG]);
    });
  });

  it('should not sign in when email is empty', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = '';
      component.password = 'secret';

      const emailInput = fixture.debugElement.query(By.css('#email_input')).nativeElement;
      emailInput.value = component.email;
      emailInput.dispatchEvent(new Event('input'));

      const passwordInput = fixture.debugElement.query(By.css('#password_input')).nativeElement;
      passwordInput.value = component.password;
      passwordInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(authenticationService.signIn).not.toHaveBeenCalled();
    });
  });

  it('should not sign in when email is not valid', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice';
      component.password = 'secret';

      const emailInput = fixture.debugElement.query(By.css('#email_input')).nativeElement;
      emailInput.value = component.email;
      emailInput.dispatchEvent(new Event('input'));

      const passwordInput = fixture.debugElement.query(By.css('#password_input')).nativeElement;
      passwordInput.value = component.password;
      passwordInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(authenticationService.signIn).not.toHaveBeenCalled();
    });
  });

  it('should not sign in when password is blank', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.password = ' ';

      const emailInput = fixture.debugElement.query(By.css('#email_input')).nativeElement;
      emailInput.value = component.email;
      emailInput.dispatchEvent(new Event('input'));

      const passwordInput = fixture.debugElement.query(By.css('#password_input')).nativeElement;
      passwordInput.value = component.password;
      passwordInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(authenticationService.signIn).not.toHaveBeenCalled();
    });
  });
});
