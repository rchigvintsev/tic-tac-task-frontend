import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

import {of} from 'rxjs';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {SigninComponent} from './signin.component';
import {TasksComponent} from '../tasks/tasks.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';
import {ConfigService} from '../service/config.service';
import {AlertService} from '../service/alert.service';
import {Config} from '../model/config';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        MatInputModule,
        NgxMatDatetimePickerModule
      ],
      declarations: [SigninComponent, TasksComponent, TaskDetailComponent, NotFoundComponent, DummyComponent],
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
    fixture = TestBed.createComponent(SigninComponent);

    const configService = fixture.debugElement.injector.get(ConfigService);
    configService.setConfig(new Config());

    const alertService = fixture.debugElement.injector.get(AlertService);
    spyOn(alertService, 'error').and.stub();

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
