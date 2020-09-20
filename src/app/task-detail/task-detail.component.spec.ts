import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxChange} from '@angular/material/checkbox';

import {of, throwError} from 'rxjs';

import * as moment from 'moment';
import {TaskDetailComponent} from './task-detail.component';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskService} from '../service/task.service';
import {ConfigService} from '../service/config.service';
import {LogService} from '../service/log.service';
import {TaskGroupService} from '../service/task-group.service';
import {TaskGroup} from '../service/task-group';
import {TestSupport} from '../test/test-support';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;
  let taskService: TaskService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)},
        MatDatepickerModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    const task = new Task().deserialize({
      id: 1,
      title: 'Test task',
      description: 'Test description',
      status: 'PROCESSED',
      deadline: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeExplicitlySet: true,
      tags: [{name: 'Red'}]
    });

    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'updateTask').and.callFake(t => of(t));
    spyOn(taskService, 'updateTaskCounters').and.stub();

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
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).not.toHaveBeenCalled();
    });
  });

  it('should save task on description input blur', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on tag add', () => {
    fixture.whenStable().then(() => {
      const event = {value: 'Green'} as any;
      component.onTagChipInputTokenEnd(event);
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on tag remove', () => {
    fixture.whenStable().then(() => {
      const tag = new Tag('Red');
      component.onTagChipRemoved(tag);
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should display server validation error', () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: {deadline: 'Must be valid'}}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      const deadlineError = compiled.querySelector('.deadline-error-container mat-error');
      expect(deadlineError).toBeTruthy();
      expect(deadlineError.textContent.trim()).toEqual('Must be valid');
    });
  });

  it('should ignore validation error when field is not found', () => {
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

  it('should save task on "deadlineDate" input change', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should set deadline time to end of day on "deadlineDate" input change when "deadlineTime" input is disabled', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.deadlineTimeEnabled = false;
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      const momentTime = moment(component.taskFormModel.deadline);
      expect(momentTime.hours()).toEqual(23);
      expect(momentTime.minutes()).toEqual(59);
    });
  });

  it('should set deadline time to end of day on "deadlineTimeEnabled" checkbox uncheck', () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = false;

    fixture.whenStable().then(() => {
      component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
      fixture.detectChanges();
      const momentTime = moment(component.taskFormModel.deadline);
      expect(momentTime.hours()).toEqual(23);
      expect(momentTime.minutes()).toEqual(59);
    });
  });

  it('should save task on "deadlineDate" input clear', () => {
    fixture.whenStable().then(() => {
      component.onClearDeadlineDateButtonClick();
      fixture.detectChanges();
      expect(component.taskFormModel.deadline).toBeNull();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on "deadlineTimeEnabled" checkbox change', () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = true;

    fixture.whenStable().then(() => {
      component.deadlineTime = '11:35';
      component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on deadline time change', () => {
    fixture.whenStable().then(() => {
      component.onDeadlineTimeSet('11:35');
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should add "color-warn" class to "deadlineDate" input when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      expect(compiled.querySelector('form input[name="deadlineDate"].color-warn')).not.toBeNull();
    });
  });

  it('should add "color-warn" class to "deadlineTime" input when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(compiled.querySelector('form input[name="deadlineTime"].color-warn')).not.toBeNull();
    });
  });

  it('should update task counters on task save', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  });

  it('should disable "deadlineTimeEnabled" checkbox when deadline is not defined', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = null;
      fixture.detectChanges();
      expect(compiled.querySelector('.deadline-time-checkbox.mat-checkbox-disabled')).not.toBeNull();
    });
  });
});
