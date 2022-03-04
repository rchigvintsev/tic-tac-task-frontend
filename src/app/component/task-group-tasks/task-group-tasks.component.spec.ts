import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of, throwError} from 'rxjs';
import * as moment from 'moment';

import {TestSupport} from '../../test/test-support';
import {TaskGroupTasksComponent} from './task-group-tasks.component';
import {ConfigService} from '../../service/config.service';
import {TaskService} from '../../service/task.service';
import {TaskGroupService} from '../../service/task-group.service';
import {TaskGroup} from '../../model/task-group';
import {PageRequest} from '../../service/page-request';
import {Task} from '../../model/task';
import {TaskStatus} from '../../model/task-status';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';
import any = jasmine.any;

describe('TaskGroupTasksComponent', () => {
  let component: TaskGroupTasksComponent;
  let fixture: ComponentFixture<TaskGroupTasksComponent>;
  let taskService: TaskService;
  let taskGroupService: TaskGroupService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler},
        TaskGroupService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskGroupTasksComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    taskService = injector.inject(TaskService);

    const router = injector.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  describe('normally', () => {
    let tasks: Task[];

    beforeEach(() => {
      const injector = getTestBed();

      tasks = [
        new Task().deserialize({id: 1, title: 'Task 1'}),
        new Task().deserialize({id: 2, title: 'Task 2'})
      ]
      spyOn(taskService, 'getTasks').and.returnValue(of(tasks));
      spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));

      taskGroupService = injector.inject(TaskGroupService);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should require new tasks to be unprocessed and unscheduled when "INBOX" group is selected', async () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.INBOX);
      await fixture.whenStable();

      expect(component.taskDeadline).toBeNull();
      expect(component.taskStatus).toEqual(TaskStatus.UNPROCESSED);
    });

    it('should require new tasks to be processed and scheduled for today when "TODAY" group is selected', async () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.TODAY);
      await fixture.whenStable();

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(component.taskDeadline).toEqual(today);
      expect(component.taskStatus).toEqual(TaskStatus.PROCESSED);
    });

    it('should require new tasks to be processed and scheduled for today when "WEEK" group is selected', async () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.WEEK);
      await fixture.whenStable();
      fixture.detectChanges();

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(component.taskDeadline).toEqual(today);
      expect(component.taskStatus).toEqual(TaskStatus.PROCESSED);
    });

    it('should require new tasks to be processed and scheduled for tomorrow when "TOMORROW" group is selected', async () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.TOMORROW);
      await fixture.whenStable();

      const tomorrow = moment().add(1, 'day').toDate();
      tomorrow.setHours(23, 59, 59, 999);
      expect(component.taskDeadline).toEqual(tomorrow);
      expect(component.taskStatus).toEqual(TaskStatus.PROCESSED);
    });

    it('should require new tasks to be processed and unscheduled when "SOME_DAY" group is selected', async () => {
      taskGroupService.notifyTaskGroupSelected(TaskGroup.SOME_DAY);
      await fixture.whenStable();

      expect(component.taskDeadline).toBeNull();
      expect(component.taskStatus).toEqual(TaskStatus.PROCESSED);
    });

    it('should render correct task list title depending on selected task group', () => {
      const compiled = fixture.debugElement.nativeElement;

      taskGroupService.notifyTaskGroupSelected(TaskGroup.INBOX);
      fixture.detectChanges();
      expect(compiled.querySelector('.mat-card-header > .mat-card-title > span').textContent.trim())
        .toBe('inbox');

      taskGroupService.notifyTaskGroupSelected(TaskGroup.TODAY);
      fixture.detectChanges();
      expect(compiled.querySelector('.mat-card-header > .mat-card-title > span').textContent.trim())
        .toBe('scheduled_for_today');

      taskGroupService.notifyTaskGroupSelected(TaskGroup.TOMORROW);
      fixture.detectChanges();
      expect(compiled.querySelector('.mat-card-header > .mat-card-title > span').textContent.trim())
        .toBe('scheduled_for_tomorrow');

      taskGroupService.notifyTaskGroupSelected(TaskGroup.WEEK);
      fixture.detectChanges();
      expect(compiled.querySelector('.mat-card-header > .mat-card-title > span').textContent.trim())
        .toBe('scheduled_for_week');

      taskGroupService.notifyTaskGroupSelected(TaskGroup.SOME_DAY);
      fixture.detectChanges();
      expect(compiled.querySelector('.mat-card-header > .mat-card-title > span').textContent.trim())
        .toBe('scheduled_for_some_day');
    });

    it('should load next task page on task list scroll', async () => {
      await fixture.whenStable();
      component.onTaskListScroll();
      expect(taskService.getTasksForTaskGroup).toHaveBeenCalledWith(any(TaskGroup), new PageRequest(1), false);
    });

    it('should start loading of tasks from first page when task group changed', async () => {
      await fixture.whenStable();
      component.onTaskListScroll();
      taskGroupService.notifyTaskGroupSelected(TaskGroup.ALL);
      expect(taskService.getTasksForTaskGroup).toHaveBeenCalledWith(TaskGroup.ALL, new PageRequest(), false);
    });

    it('should not reload tasks on task group select when task group is not changed', async () => {
      await fixture.whenStable();
      taskGroupService.notifyTaskGroupSelected(TaskGroup.TODAY);
      expect(taskService.getTasksForTaskGroup).toHaveBeenCalledTimes(1);
    });

    it('should reload tasks on task update', async () => {
      await fixture.whenStable();
      taskService.notifyTaskUpdated(tasks[0]);
      expect(taskService.getTasksForTaskGroup).toHaveBeenCalledTimes(2);
    });
  });

  describe('when server responds with error', () => {
    const response = {status: 500, url: 'https://backend.com/service', error: {message: 'Something went wrong...'}};
    beforeEach(() => {
      spyOn(taskService, 'getTasks').and.callFake(() => throwError(() => HttpRequestError.fromResponse(response)));
      spyOn(window.console, 'error');
      fixture.detectChanges();
    });

    it('should output error into console', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      const errorMessage = `HTTP failure response for ${response.url}: `
        + `server responded with status 500 and message "${response.error.message}"`;
      expect(window.console.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
