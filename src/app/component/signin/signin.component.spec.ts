import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';

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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
      component.email = 'alice@mail.com';
      component.password = 'secret';
      component.onSigninFormSubmit();
      expect(authenticationService.setPrincipal).toHaveBeenCalled();
    });
  });

  it('should navigate to home page on sign in', () => {
    fixture.whenStable().then(() => {
      component.email = 'alice@mail.com';
      component.password = 'secret';
      component.onSigninFormSubmit();
      expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG]);
    });
  });
});
