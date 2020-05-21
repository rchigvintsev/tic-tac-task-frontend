import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {AlertComponent} from './alert.component';
import {TasksComponent} from '../tasks/tasks.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {TranslateHttpLoaderFactory} from '../app.module';
import {AlertService} from '../service/alert.service';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';
import {routes} from '../app-routing.module';


describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        MatInputModule,
        MatTooltipModule,
        MatDatepickerModule,
        NgxMaterialTimepickerModule
      ],
      declarations: [
        AlertComponent,
        TasksComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent,
        LocalizedDatePipe,
        LocalizedRelativeDatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render info message', () => {
    const messageText = 'Info test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.info(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-info');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });

  it('should render warning message', () => {
    const messageText = 'Warning test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.warn(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-warn');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });

  it('should render error message', () => {
    const messageText = 'Error test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.error(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-error');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });
});
