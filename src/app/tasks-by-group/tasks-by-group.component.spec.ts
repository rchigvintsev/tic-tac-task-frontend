import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of} from 'rxjs';

import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../test/test-support';
import {TasksByGroupComponent} from './tasks-by-group.component';
import {ConfigService} from '../service/config.service';
import {TaskService} from '../service/task.service';
import {TaskGroupService} from '../service/task-group.service';
import {TaskGroup} from '../service/task-group';
import {Task} from '../model/task';
import {TaskStatus} from '../model/task-status';

describe('TasksByGroupComponent', () => {
  let component: TasksByGroupComponent;
  let fixture: ComponentFixture<TasksByGroupComponent>;
  let taskService: TaskService;
  let taskGroupService: TaskGroupService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.INBOX)}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksByGroupComponent);
    const injector = getTestBed();

    const router = injector.get(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve());

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    taskService = injector.get(TaskService);
    spyOn(taskService, 'getTasks').and.returnValue(of([]));
    spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));
    spyOn(taskService, 'updateTaskCounters').and.stub();

    taskGroupService = injector.get(TaskGroupService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create task', () => {
    taskGroupService.notifyTaskGroupSelected(TaskGroup.INBOX);
    const taskTitle = 'New task';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();
      expect(taskService.createTask).toHaveBeenCalled();
    });
  });

  it('should create processed task scheduled for today when "TODAY" group is selected', () => {
    taskGroupService.notifyTaskGroupSelected(TaskGroup.TODAY);
    const taskTitle = 'For today';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(component.taskList.tasks[0].deadline).toEqual(today);
      expect(component.taskList.tasks[0].status).toEqual(TaskStatus.PROCESSED);
    });
  });

  it('should create processed task scheduled for today when "WEEK" group is selected', () => {
    taskGroupService.notifyTaskGroupSelected(TaskGroup.WEEK);
    const taskTitle = 'For today';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(component.taskList.tasks[0].deadline).toEqual(today);
      expect(component.taskList.tasks[0].status).toEqual(TaskStatus.PROCESSED);
    });
  });

  it('should create processed task scheduled for tomorrow when "TOMORROW" group is selected', () => {
    taskGroupService.notifyTaskGroupSelected(TaskGroup.TOMORROW);
    const taskTitle = 'For tomorrow';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();

      const tomorrow = moment().add(1, 'day').toDate();
      tomorrow.setHours(0, 0, 0, 0);
      expect(component.taskList.tasks[0].deadline).toEqual(tomorrow);
      expect(component.taskList.tasks[0].status).toEqual(TaskStatus.PROCESSED);
    });
  });

  it('should create unscheduled processed task when "SOME_DAY" group is selected', () => {
    taskGroupService.notifyTaskGroupSelected(TaskGroup.SOME_DAY);
    const taskTitle = 'For some day';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();

      expect(component.taskList.tasks[0].deadline).not.toBeDefined();
      expect(component.taskList.tasks[0].status).toEqual(TaskStatus.PROCESSED);
    });
  });

  it('should not create task with blank title', () => {
    fixture.whenStable().then(() => {
      component.formModel.title = ' ';
      component.onTaskFormSubmit();
      fixture.detectChanges();
      expect(taskService.createTask).not.toHaveBeenCalled();
    });
  });

  it('should update task counters on task create', () => {
    fixture.whenStable().then(() => {
      component.formModel.title = 'New task';
      component.onTaskFormSubmit();
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  });

  it('should render correct task list title depending on selected task group', () => {
    const compiled = fixture.debugElement.nativeElement;

    taskGroupService.notifyTaskGroupSelected(TaskGroup.INBOX);
    fixture.detectChanges();
    expect(compiled.querySelector('mat-card > mat-card-title').textContent).toBe('inbox');

    taskGroupService.notifyTaskGroupSelected(TaskGroup.TODAY);
    fixture.detectChanges();
    expect(compiled.querySelector('mat-card > mat-card-title').textContent).toBe('scheduled_for_today');

    taskGroupService.notifyTaskGroupSelected(TaskGroup.TOMORROW);
    fixture.detectChanges();
    expect(compiled.querySelector('mat-card > mat-card-title').textContent).toBe('scheduled_for_tomorrow');

    taskGroupService.notifyTaskGroupSelected(TaskGroup.WEEK);
    fixture.detectChanges();
    expect(compiled.querySelector('mat-card > mat-card-title').textContent).toBe('scheduled_for_week');

    taskGroupService.notifyTaskGroupSelected(TaskGroup.SOME_DAY);
    fixture.detectChanges();
    expect(compiled.querySelector('mat-card > mat-card-title').textContent).toBe('scheduled_for_some_day');
  });
});
