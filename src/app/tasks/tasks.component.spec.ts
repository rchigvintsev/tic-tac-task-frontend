import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';
import {TasksComponent} from './tasks.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {ConfigService} from '../service/config.service';
import {TaskService} from '../service/task.service';
import {Task} from '../model/task';
import {TaskStatus} from '../model/task-status';
import {ComponentTestSupport} from '../test/component-test-support';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let tasks: Array<Task>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: ComponentTestSupport.IMPORTS,
      declarations: ComponentTestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.INBOX)}
      ]
    }).compileComponents();

    const injector = getTestBed();

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    moment.locale(translate.currentLang);

    const router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
  }));

  describe('normally', () => {
    let taskGroupService: TaskGroupService;

    beforeEach(() => {
      fixture = TestBed.createComponent(TasksComponent);

      tasks = [];
      tasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'UNPROCESSED'}));
      tasks.push(new Task().deserialize({
        id: 2,
        title: 'Task 2',
        status: 'PROCESSED',
        deadlineDate: moment().utc().add(1, 'month').format(moment.HTML5_FMT.DATE)
      }));
      tasks.push(new Task().deserialize({
        id: 3,
        title: 'Task 3',
        status: 'PROCESSED',
        deadlineDate: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATE)
      }));

      const taskService = fixture.debugElement.injector.get(TaskService);
      spyOn(taskService, 'getTasks').and.returnValue(of(tasks));
      spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));
      spyOn(taskService, 'updateTask').and.callFake(task => of(new Task().deserialize(task)));
      spyOn(taskService, 'completeTask').and.callFake(_ => of(true));

      taskGroupService = fixture.debugElement.injector.get(TaskGroupService);

      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.tasks.length).toEqual(tasks.length);
    });

    it('should create task', () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.INBOX);
      const taskTitle = 'New task';
      fixture.whenStable().then(() => {
        component.formModel.title = taskTitle;
        component.onTaskFormSubmit();
        fixture.detectChanges();
        expect(component.tasks.length).toEqual(4);
        expect(component.tasks[3].title).toEqual(taskTitle);
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
        expect(component.tasks[3].deadlineDate).toEqual(today);
        expect(component.tasks[3].status).toEqual(TaskStatus.PROCESSED);
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
        expect(component.tasks[3].deadlineDate).toEqual(today);
        expect(component.tasks[3].status).toEqual(TaskStatus.PROCESSED);
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
        expect(component.tasks[3].deadlineDate).toEqual(tomorrow);
        expect(component.tasks[3].status).toEqual(TaskStatus.PROCESSED);
      });
    });

    it('should create unscheduled processed task when "SOME_DAY" group is selected', () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.SOME_DAY);
      const taskTitle = 'For some day';
      fixture.whenStable().then(() => {
        component.formModel.title = taskTitle;
        component.onTaskFormSubmit();
        fixture.detectChanges();

        expect(component.tasks[3].deadlineDate).not.toBeDefined();
        expect(component.tasks[3].status).toEqual(TaskStatus.PROCESSED);
      });
    });

    it('should not create task with blank title', () => {
      fixture.whenStable().then(() => {
        component.formModel.title = ' ';
        component.onTaskFormSubmit();
        fixture.detectChanges();
        expect(component.tasks.length).toEqual(3);
      });
    });

    it('should complete task', fakeAsync(() => {
      const task1 = tasks[0];
      const task2 = tasks[1];

      component.onTaskCompleteCheckboxChange(task1);
      tick(400);

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.tasks.length).toEqual(2);
        expect(component.tasks[0].id).toEqual(task2.id);
      });
    }));

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

    it('should render task deadline', () => {
      const compiled = fixture.debugElement.nativeElement;
      fixture.whenStable().then(() => {
        const spanContent = compiled.querySelector('.task-2 .deadline-column span').textContent;
        expect(spanContent).not.toBeNull();
        expect(spanContent.trim()).toBe('in a month');
      });
    });

    it('should add "color-warn" class to deadline label when task is overdue', () => {
      const compiled = fixture.debugElement.nativeElement;
      fixture.whenStable().then(() => {
        expect(compiled.querySelector('.task-3 .deadline-column span.color-warn')).not.toBeNull();
      });
    });
  });

  describe('when authentication is required', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(TasksComponent);
      const taskService = fixture.debugElement.injector.get(TaskService);
      spyOn(taskService, 'getTasks').and.callFake(() => {
        return throwError({status: 401});
      });

      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render signin page', () => {
      const injector = getTestBed();
      const router = injector.get(Router);
      const translate = injector.get(TranslateService);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(router.navigate).toHaveBeenCalledWith([translate.currentLang, 'signin']);
      });
    });
  });

  describe('when server responds with error', () => {
    const error = {status: 500};

    beforeEach(() => {
      fixture = TestBed.createComponent(TasksComponent);
      const taskService = fixture.debugElement.injector.get(TaskService);
      spyOn(taskService, 'getTasks').and.callFake(() => throwError(error));
      spyOn(window.console, 'error');

      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should output error into console', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(window.console.error).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('when server responds with error with message', () => {
    const errorMessage = 'Something went wrong...';

    beforeEach(() => {
      fixture = TestBed.createComponent(TasksComponent);
      const taskService = fixture.debugElement.injector.get(TaskService);
      spyOn(taskService, 'getTasks').and.callFake(() => throwError({status: 500, errors: [errorMessage]}));
      spyOn(window.console, 'error');

      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should output error message into console', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(window.console.error).toHaveBeenCalledWith(errorMessage);
      });
    });
  });
});
