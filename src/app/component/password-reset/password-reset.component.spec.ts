import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TestSupport} from '../../test/test-support';
import {PasswordResetComponent} from './password-reset.component';
import {AlertService} from '../../service/alert.service';
import {I18nService} from '../../service/i18n.service';
import {UserService} from '../../service/user.service';
import {ConfigService} from '../../service/config.service';
import {Config} from '../../model/config';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let userService: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    i18nService = injector.get(I18nService);

    alertService = injector.get(AlertService);
    spyOn(alertService, 'info').and.stub();

    userService = injector.get(UserService);
    spyOn(userService, 'resetPassword').and.callFake(_ => of(true));

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset password on password reset form submit', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      setInputValue('email_input', component.email);
      fixture.detectChanges();

      component.onPasswordResetFormSubmit();
      expect(userService.resetPassword).toHaveBeenCalled();
    });
  });

  it('should not reset password when email is empty', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = '';
      setInputValue('email_input', component.email);
      fixture.detectChanges();

      component.onPasswordResetFormSubmit();
      expect(userService.resetPassword).not.toHaveBeenCalled();
    });
  });

  it('should show info message on password reset', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      setInputValue('email_input', component.email);
      fixture.detectChanges();

      component.onPasswordResetFormSubmit();
      expect(alertService.info).toHaveBeenCalledWith(i18nService.translate('password_reset_confirmation_link_sent'));
    });
  });

  function setInputValue(inputId: string, value: string) {
    const emailInput = fixture.debugElement.query(By.css('#' + inputId)).nativeElement;
    emailInput.value = value;
    emailInput.dispatchEvent(new Event('input'));
  }
});
