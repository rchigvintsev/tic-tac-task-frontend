import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SigninComponent} from './signin.component';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {Config} from '../../model/config';
import {TestSupport} from '../../test/test-support';

const CURRENT_LANG = 'en';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let alertService: AlertService;
  let i18nService: I18nService;
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
            queryParamMap: of(convertToParamMap({error: 'true', message: 'default'}))
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    i18nService = injector.get(I18nService);

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    alertService = injector.get(AlertService);
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
    expect(alertService.error).toHaveBeenCalledWith(i18nService.translate('sign_in_error'));
  });

  it('should sign in on signin form submit', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.password = 'secret';

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
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

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
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

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
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

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
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

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(authenticationService.signIn).not.toHaveBeenCalled();
    });
  });

  it('should show error message on sign in when server responded with 401 status code', () => {
    (authenticationService.signIn as jasmine.Spy).and.callFake(() => throwError({status: 401}));
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.password = 'secret';

      setInputValue('email_input', component.email);
      setInputValue('password_input', component.password);
      fixture.detectChanges();

      component.onSigninFormSubmit();
      expect(alertService.error).toHaveBeenCalledWith(i18nService.translate('user_not_found_or_invalid_password'));
    });
  });

  it('should render link to signup page', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const signupLink = compiled.querySelector('.sign-container mat-card mat-card-footer a[href="/en/signup"]');
      expect(signupLink).toBeTruthy();
      expect(signupLink.textContent.trim()).toBe('sign_up_proposal');
    });
  });

  function setInputValue(inputId: string, value: string) {
    const emailInput = fixture.debugElement.query(By.css('#' + inputId)).nativeElement;
    emailInput.value = value;
    emailInput.dispatchEvent(new Event('input'));
  }
});
