import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of, throwError} from 'rxjs';

import {AccountPasswordResetConfirmationComponent} from './account-password-reset-confirmation.component';
import {TestSupport} from '../../../../../test/test-support';
import {AlertService} from '../../../../../service/alert.service';
import {I18nService} from '../../../../../service/i18n.service';
import {UserService} from '../../../../../service/user.service';
import {ConfigService} from '../../../../../service/config.service';
import {Config} from '../../../../../model/config';
import {HttpRequestError} from '../../../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER} from '../../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../../handler/default-http-response.handler';
import {PasswordChangeEvent} from '../../../../fragment/account/password/change/account-password-change.component';

describe('AccountPasswordResetConfirmationComponent', () => {
  let component: AccountPasswordResetConfirmationComponent;
  let fixture: ComponentFixture<AccountPasswordResetConfirmationComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let userService: UserService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const configService = injector.inject(ConfigService);
    configService.setConfig(new Config());

    i18nService = injector.inject(I18nService);

    alertService = injector.inject(AlertService);
    spyOn(alertService, 'info').and.stub();
    spyOn(alertService, 'error').and.stub();

    userService = injector.inject(UserService);
    spyOn(userService, 'confirmPasswordReset').and.callFake(_ => of(true));

    router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    fixture = TestBed.createComponent(AccountPasswordResetConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm password reset on password change', () => {
    component.onPasswordChange(new PasswordChangeEvent(null, 'qwerty'));
    expect(userService.confirmPasswordReset).toHaveBeenCalled();
  });

  it('should navigate to signin page when password reset is confirmed', () => {
    component.onPasswordChange(new PasswordChangeEvent(null, 'qwerty'));
    expect(router.navigate).toHaveBeenCalledWith(['en', 'signin'],
      {queryParams: {error: false, message: 'account_password_reset_confirmed'}});
  });

  it('should not confirm password reset when password is blank', () => {
    component.onPasswordChange(new PasswordChangeEvent(null, ' '));
    expect(userService.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('should show localized error message on password reset confirm error', () => {
    const errorMessage = 'Very bad request';
    (userService.confirmPasswordReset as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({status: 400, error: {localizedMessage: errorMessage}}));
    });

    component.onPasswordChange(new PasswordChangeEvent(null, 'qwerty'));
    expect(alertService.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should show error message on password reset confirm error', () => {
    (userService.confirmPasswordReset as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({url: '/', status: 500, message: 'Something went wrong'}));
    });

    component.onPasswordChange(new PasswordChangeEvent(null, 'qwerty'));
    expect(alertService.error).toHaveBeenCalledWith(i18nService.translate('failed_to_confirm_account_password_reset'));
  });

  it('should render link to signin page', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = '.account-password-reset-confirmation-container mat-card mat-card-footer a[href="/en/signin"]';
    const signinLink = compiled.querySelector(selector);
    expect(signinLink).toBeTruthy();
    expect(signinLink.textContent.trim()).toBe('sign_in');
  });

  it('should render link to signup page', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = '.account-password-reset-confirmation-container mat-card mat-card-footer a[href="/en/signup"]';
    const signupLink = compiled.querySelector(selector);
    expect(signupLink).toBeTruthy();
    expect(signupLink.textContent.trim()).toBe('sign_up');
  });
});
