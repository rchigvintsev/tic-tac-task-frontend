import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxChange} from '@angular/material/checkbox';

import {of, throwError} from 'rxjs';

import * as moment from 'moment';
import {TaskDetailComponent} from './task-detail.component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {ConfigService} from '../service/config.service';
import {LogService} from '../service/log.service';
import {TaskGroupService} from '../service/task-group.service';
import {TaskGroup} from '../service/task-group';
import {ComponentTestSupport} from '../test/component-test-support';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;
  let taskService: TaskService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: ComponentTestSupport.IMPORTS,
      declarations: ComponentTestSupport.DECLARATIONS,
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
      deadlineDate: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATE),
      deadlineTime: moment('1970-01-01 12:00').format(moment.HTML5_FMT.TIME)
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

  it('should save task on deadline date input change', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.deadlineDate = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should display server validation error', () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: {deadlineDate: 'Must be valid'}}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadlineDate = moment().add(1, 'days').toDate();
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
      component.taskFormModel.deadlineDate = moment().add(1, 'days').toDate();
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

  it('should save task on deadline date input clear', () => {
    fixture.whenStable().then(() => {
      component.onClearDeadlineDateButtonClick();
      fixture.detectChanges();
      expect(component.taskFormModel.deadlineDate).toBeNull();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on deadline time enabled checkbox change', () => {
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

  it('should add "color-warn" class to deadline date input when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      expect(compiled.querySelector('form input[name="deadlineDate"].color-warn')).not.toBeNull();
    });
  });

  it('should add "color-warn" class to deadline time input when task is overdue', () => {
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
});
