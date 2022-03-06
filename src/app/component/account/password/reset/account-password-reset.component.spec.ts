import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {of, throwError} from 'rxjs';

import {TestSupport} from '../../../../test/test-support';
import {AccountPasswordResetComponent} from './account-password-reset.component';
import {AlertService} from '../../../../service/alert.service';
import {I18nService} from '../../../../service/i18n.service';
import {UserService} from '../../../../service/user.service';
import {ConfigService} from '../../../../service/config.service';
import {Config} from '../../../../model/config';
import {HttpRequestError} from '../../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';

describe('AccountPasswordResetComponent', () => {
  let component: AccountPasswordResetComponent;
  let fixture: ComponentFixture<AccountPasswordResetComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let userService: UserService;

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
    spyOn(userService, 'resetPassword').and.callFake(_ => of(true));

    fixture = TestBed.createComponent(AccountPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset password on password reset form submit', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    TestSupport.setInputValue(fixture, 'email_input', component.email);
    fixture.detectChanges();

    component.onPasswordResetFormSubmit();
    expect(userService.resetPassword).toHaveBeenCalled();
  });

  it('should not reset password when email is empty', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = '';
    TestSupport.setInputValue(fixture, 'email_input', component.email);
    fixture.detectChanges();

    component.onPasswordResetFormSubmit();
    expect(userService.resetPassword).not.toHaveBeenCalled();
  });

  it('should show info message on password reset', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    TestSupport.setInputValue(fixture, 'email_input', component.email);
    fixture.detectChanges();

    component.onPasswordResetFormSubmit();
    expect(alertService.info).toHaveBeenCalledWith(i18nService.translate('account_password_reset_confirmation_link_sent'));
  });

  it('should show localized error message on password reset error', async () => {
    await fixture.whenStable();
    const errorMessage = 'Very bad request';
    (userService.resetPassword as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({status: 400, error: {localizedMessage: errorMessage}}));
    });

    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    TestSupport.setInputValue(fixture, 'email_input', component.email);
    fixture.detectChanges();

    component.onPasswordResetFormSubmit();
    expect(alertService.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should show error message on password reset error', async () => {
    await fixture.whenStable();
    (userService.resetPassword as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({url: '/', status: 500, message: 'Something went wrong'}));
    });

    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    TestSupport.setInputValue(fixture, 'email_input', component.email);
    fixture.detectChanges();

    component.onPasswordResetFormSubmit();
    expect(alertService.error).toHaveBeenCalledWith(i18nService.translate('failed_to_confirm_account_password_reset'));
  });

  it('should render link to signin page', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = '.account-password-reset-container mat-card mat-card-footer a[href="/en/signin"]';
    const signinLink = compiled.querySelector(selector);
    expect(signinLink).toBeTruthy();
    expect(signinLink.textContent.trim()).toBe('sign_in');
  });

  it('should render link to signup page', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = '.account-password-reset-container mat-card mat-card-footer a[href="/en/signup"]';
    const signupLink = compiled.querySelector(selector);
    expect(signupLink).toBeTruthy();
    expect(signupLink.textContent.trim()).toBe('sign_up');
  });
});
