import {APP_INITIALIZER} from '@angular/core';
import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {MatIconRegistry} from '@angular/material/icon';

import {of, throwError} from 'rxjs';

import {SignupComponent} from './signup.component';
import {TestSupport} from '../../test/test-support';
import {I18nService} from '../../service/i18n.service';
import {AlertService} from '../../service/alert.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {Config} from '../../model/config';
import {User} from '../../model/user';
import {HttpRequestError} from '../../error/http-request.error';
import {initIcons} from '../../app.module';

fdescribe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ActivatedRoute, useValue: {queryParamMap: of(convertToParamMap({error: true}))}},
        {provide: APP_INITIALIZER, useFactory: initIcons, multi: true, deps: [MatIconRegistry, DomSanitizer]},
      ]
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

    authenticationService = injector.inject(AuthenticationService);
    spyOn(authenticationService, 'signUp').and.callFake((email, username) =>
      of({email, fullName: username} as User));

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sign up on signup form submit', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = 'Alice';
    component.repeatedPassword = component.password = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).toHaveBeenCalled();
  });

  it('should not sign up when email is empty', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = '';
    component.fullName = 'Alice';
    component.password = 'secret';
    component.repeatedPassword = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).not.toHaveBeenCalled();
  });

  it('should not sign up when email is not valid', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice';
    component.fullName = 'Alice';
    component.password = 'secret';
    component.repeatedPassword = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).not.toHaveBeenCalled();
  });

  it('should not sign up when username is blank', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = ' ';
    component.password = 'secret';
    component.repeatedPassword = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).not.toHaveBeenCalled();
  });

  it('should not sign up when password is blank', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = 'Alice';
    component.repeatedPassword = component.password = ' ';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).not.toHaveBeenCalled();
  });

  it('should not sign up when passwords do not match', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = 'Alice';
    component.password = '12345';
    component.repeatedPassword = '54321';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(authenticationService.signUp).not.toHaveBeenCalled();
  });

  it('should show information message on sign up when server responded with 200 status code', async () => {
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = 'Alice';
    component.password = 'secret';
    component.repeatedPassword = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(alertService.info).toHaveBeenCalledWith('email_confirmation_link_sent');
  });

  it('should show localized error message on sign up', async () => {
    const errorMessage = 'Very bad request';
    (authenticationService.signUp as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({status: 400, error: {localizedMessage: errorMessage}}));
    });
    await fixture.whenStable();
    // For some reason two-way binding does not work in tests when input is placed within form
    component.email = 'alice@mail.com';
    component.fullName = 'Alice';
    component.password = 'secret';
    component.repeatedPassword = 'secret';

    TestSupport.setInputValue(fixture, 'email_input', component.email);
    TestSupport.setInputValue(fixture, 'full_name_input', component.fullName);
    TestSupport.setInputValue(fixture, 'password_input', component.password);
    TestSupport.setInputValue(fixture, 'password_repeat_input', component.repeatedPassword);
    fixture.detectChanges();

    component.onSignupFormSubmit();
    expect(alertService.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should render link to signin page', async () => {
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    const signupLink = compiled.querySelector('.sign-container mat-card mat-card-footer a[href="/en/signin"]');
    expect(signupLink).toBeTruthy();
    expect(signupLink.textContent.trim()).toBe('sign_in_proposal');
  });
});
