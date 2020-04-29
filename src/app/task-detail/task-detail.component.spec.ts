import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {of, throwError} from 'rxjs';

import * as moment from 'moment';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {TasksComponent} from '../tasks/tasks.component';
import {TaskDetailComponent} from './task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {ConfigService} from '../service/config.service';
import {LogService} from '../service/log.service';
import {TaskGroupService} from '../service/task-group.service';
import {TaskGroup} from '../service/task-group';
import {LocalizedDatePipe} from '../pipe/localized-date.pipe';
import {LocalizedRelativeDatePipe} from '../pipe/localized-relative-date.pipe';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
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
        MatTooltipModule,
        NgxMatDatetimePickerModule
      ],
      declarations: [
        SigninComponent,
        TasksComponent,
        TaskDetailComponent,
        NotFoundComponent,
        DummyComponent,
        LocalizedDatePipe,
        LocalizedRelativeDatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailComponent);

    const taskService = fixture.debugElement.injector.get(TaskService);
    const task = new Task().deserialize({
      id: 1,
      title: 'Test task',
      description: 'Test description',
      status: 'PROCESSED',
      deadline: moment(Date.now()).utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    });
    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'updateTask').and.callFake(t => of(t));

    const logService = fixture.debugElement.injector.get(LogService);
    spyOn(logService, 'error').and.callThrough();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin title editing on title span click', () => {
    fixture.whenStable().then(() => {
      component.onTitleTextClick();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input blur', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should hide title text element on click', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title .title-text');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form on title text element click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title .title-text'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task on title input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).not.toHaveBeenCalled();
    });
  });

  it('should save task on description input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on deadline date input change', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should close deadline date picker on mouse down outside date picker', () => {
    spyOn(component.deadlinePickerElement, 'close').and.callThrough();
    component.deadlinePickerElement.open();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.onMouseDown({target: fixture.debugElement.nativeElement});
      expect(component.deadlinePickerElement.close).toHaveBeenCalled();
    });
  });

  it('should not close deadline date picker on mouse down on date picker itself', () => {
    spyOn(component.deadlinePickerElement, 'close').and.callThrough();
    component.deadlinePickerElement.open();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const datePickerContent = fixture.debugElement.query(By.css('ngx-mat-datetime-content'));
      component.onMouseDown({target: datePickerContent.nativeElement});
      expect(component.deadlinePickerElement.close).not.toHaveBeenCalled();
    });
  });

  it('should display server validation error', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: {deadline: 'Must be valid'}}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      const deadlineError = compiled.querySelector('.deadline-form-field mat-error');
      expect(deadlineError).toBeTruthy();
      expect(deadlineError.textContent.trim()).toEqual('Must be valid');
    });
  });

  it('should ignore validation error when field is not found', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: {absent: 'Must be present'}}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      const deadlineError = compiled.querySelector('mat-error');
      expect(deadlineError).toBeFalsy();
    });
  });

  it('should log service call error when field is not found', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 500, error: {errors: ['Something went wrong']}});
    });
    const logService = fixture.debugElement.injector.get(LogService);

    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(logService.error).toHaveBeenCalled();
    });
  });

  it('should save task on deadline date input clear', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.onClearDeadlineButtonClick();
      fixture.detectChanges();
      expect(component.taskFormModel.deadline).toBeNull();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });
});
