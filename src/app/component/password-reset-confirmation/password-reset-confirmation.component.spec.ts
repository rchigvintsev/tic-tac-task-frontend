import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of, throwError} from 'rxjs';

import {PasswordResetConfirmationComponent} from './password-reset-confirmation.component';
import {TestSupport} from '../../test/test-support';
import {AlertService} from '../../service/alert.service';
import {I18nService} from '../../service/i18n.service';
import {UserService} from '../../service/user.service';
import {ConfigService} from '../../service/config.service';
import {Config} from '../../model/config';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';

describe('PasswordResetConfirmationComponent', () => {
  let component: PasswordResetConfirmationComponent;
  let fixture: ComponentFixture<PasswordResetConfirmationComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let userService: UserService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    i18nService = injector.get(I18nService);

    alertService = injector.get(AlertService);
    spyOn(alertService, 'info').and.stub();
    spyOn(alertService, 'error').and.stub();

    userService = injector.get(UserService);
    spyOn(userService, 'confirmPasswordReset').and.callFake(_ => of(true));

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    fixture = TestBed.createComponent(PasswordResetConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm password reset on password reset confirmation form submit', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.repeatedPassword = component.password = 'qwerty';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(userService.confirmPasswordReset).toHaveBeenCalled();
    });
  });

  it('should navigate to signin page when password reset is confirmed', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.repeatedPassword = component.password = 'qwerty';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'],
        {queryParams: {error: false, message: 'password_reset_confirmed'}});
    });
  });

  it('should not confirm password reset when password is blank', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.repeatedPassword = component.password = ' ';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(userService.confirmPasswordReset).not.toHaveBeenCalled();
    });
  });

  it('should not confirm password reset when passwords do not match', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.password = '12345';
      component.repeatedPassword = '54321';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(userService.confirmPasswordReset).not.toHaveBeenCalled();
    });
  });

  it('should show localized error message on password reset confirm error', () => {
    fixture.whenStable().then(() => {
      const errorMessage = 'Very bad request';
      (userService.confirmPasswordReset as jasmine.Spy).and.callFake(() => {
        return throwError(HttpRequestError.fromResponse({status: 400, error: {localizedMessage: errorMessage}}));
      });

      // For some reason two-way binding does not work in tests when input is placed within form
      component.repeatedPassword = component.password = 'qwerty';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(alertService.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should show error message on password reset confirm error', () => {
    fixture.whenStable().then(() => {
      (userService.confirmPasswordReset as jasmine.Spy).and.callFake(() => {
        return throwError(HttpRequestError.fromResponse({url: '/', status: 500, message: 'Something went wrong'}));
      });

      // For some reason two-way binding does not work in tests when input is placed within form
      component.repeatedPassword = component.password = 'qwerty';
      TestSupport.setInputValue(fixture, 'password_input', component.password);
      TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onPasswordResetConfirmationFormSubmit();
      expect(alertService.error).toHaveBeenCalledWith(i18nService.translate('failed_to_confirm_password_reset'));
    });
  });

  it('should render link to signin page', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const selector = '.password-reset-confirmation-container mat-card mat-card-footer a[href="/en/signin"]';
      const signinLink = compiled.querySelector(selector);
      expect(signinLink).toBeTruthy();
      expect(signinLink.textContent.trim()).toBe('sign_in');
    });
  });

  it('should render link to signup page', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const selector = '.password-reset-confirmation-container mat-card mat-card-footer a[href="/en/signup"]';
      const signupLink = compiled.querySelector(selector);
      expect(signupLink).toBeTruthy();
      expect(signupLink.textContent.trim()).toBe('sign_up');
    });
  });
});
