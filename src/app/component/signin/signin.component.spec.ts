import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SigninComponent} from './signin.component';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {Config} from '../../model/config';
import {TestSupport} from '../../test/test-support';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;

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

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    const alertService = injector.get(AlertService);
    spyOn(alertService, 'error').and.stub();

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
});
