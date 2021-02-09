import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {SignupComponent} from './signup.component';
import {TestSupport} from '../../test/test-support';
import {I18nService} from '../../service/i18n.service';
import {AlertService} from '../../service/alert.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {Config} from '../../model/config';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let i18nService: I18nService;
  let alertService: AlertService;
  let authenticationService: AuthenticationService;

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

    i18nService = injector.get(I18nService);

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    alertService = injector.get(AlertService);
    spyOn(alertService, 'info').and.stub();

    authenticationService = injector.get(AuthenticationService);
    spyOn(authenticationService, 'signUp').and.callFake((email, username) => of({email, fullName: username}));

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show information message on sign up when server responded with 200 status code', () => {
    fixture.whenStable().then(() => {
      // For some reason two-way binding does not work in tests when input is placed within form
      component.email = 'alice@mail.com';
      component.fullName = 'Alice';
      component.password = 'secret';
      component.repeatedPassword = 'secret';

      setInputValue('email_input', component.email);
      setInputValue('full_name_input', component.fullName);
      setInputValue('password_input', component.password);
      setInputValue('password_repeat_input', component.repeatedPassword);
      fixture.detectChanges();

      component.onSignupFormSubmit();
      expect(alertService.info).toHaveBeenCalledWith(i18nService.translate('email_confirmation_link_sent'));
    });
  });

  function setInputValue(inputId: string, value: string) {
    const emailInput = fixture.debugElement.query(By.css('#' + inputId)).nativeElement;
    emailInput.value = value;
    emailInput.dispatchEvent(new Event('input'));
  }
});
