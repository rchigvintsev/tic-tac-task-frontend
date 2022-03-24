import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TaskListForWeekComponent} from './task-list-for-week.component';
import {ConfigService} from '../../../../service/config.service';
import {GetTasksRequest, TaskService} from '../../../../service/task.service';
import {Task} from '../../../../model/task';
import {TestSupport} from '../../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';
import {TaskStatus} from '../../../../model/task-status';
import {DateTimeUtils} from '../../../../util/time/date-time-utils';

describe('TaskListForWeekComponent', () => {
  let component: TaskListForWeekComponent;
  let fixture: ComponentFixture<TaskListForWeekComponent>;
  let taskService: TaskService;
  let tasks: Task[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();

    const injector = getTestBed();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';
    moment.locale(translate.currentLang);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListForWeekComponent);

    taskService = fixture.debugElement.injector.get(TaskService);

    tasks = [];
    tasks.push(new Task().deserialize({
      id: 1,
      title: 'Task 1',
      status: 'PROCESSED',
      deadlineDate: moment().format(moment.HTML5_FMT.DATE),
      recurrenceStrategy: {type: 'daily'}
    }));
    tasks.push(new Task().deserialize({
      id: 2,
      title: 'Task 2',
      status: 'PROCESSED',
      deadlineDate: moment().subtract(1, 'day').format(moment.HTML5_FMT.DATE)
    }));
    spyOn(taskService, 'getTaskCount').and.returnValue(of(tasks.length));
    spyOn(taskService, 'getTasks').and.returnValue(of(tasks));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload tasks on task update', async () => {
    await fixture.whenStable();
    taskService.notifyTaskUpdated(tasks[0]);
    expect(taskService.getTasks).toHaveBeenCalledTimes(14);
  });

  it('should reload related task groups on daily task complete', async () => {
    await fixture.whenStable();

    const getTasksSpy = taskService.getTasks as jasmine.Spy
    getTasksSpy.calls.reset();

    taskService.notifyTaskCompleted(tasks[0]);

    expect(getTasksSpy.calls.all()[0].args[0].equals(newTaskRequestForToday())).toBeTruthy();
    expect(getTasksSpy.calls.all()[1].args[0].equals(newTaskRequestForTomorrow())).toBeTruthy();
  });

  it('should reload related task groups on daily task restore', async () => {
    await fixture.whenStable();

    const getTasksSpy = taskService.getTasks as jasmine.Spy
    getTasksSpy.calls.reset();

    taskService.notifyTaskRestored(tasks[0]);

    expect(getTasksSpy.calls.all()[0].args[0].equals(newTaskRequestForToday())).toBeTruthy();
    expect(getTasksSpy.calls.all()[1].args[0].equals(newTaskRequestForTomorrow())).toBeTruthy();
  });

  function newTaskRequestForToday() {
    const taskRequest = new GetTasksRequest();
    taskRequest.statuses = [TaskStatus.PROCESSED, TaskStatus.COMPLETED];
    taskRequest.completedAtFrom = DateTimeUtils.startOfToday();
    taskRequest.deadlineDateTo = DateTimeUtils.today();
    taskRequest.deadlineDateTimeTo = DateTimeUtils.endOfToday();
    return taskRequest;
  }

  function newTaskRequestForTomorrow() {
    const taskRequest = new GetTasksRequest();
    taskRequest.statuses = [TaskStatus.PROCESSED, TaskStatus.COMPLETED];
    taskRequest.completedAtFrom = DateTimeUtils.startOfToday();
    taskRequest.deadlineDateFrom = DateTimeUtils.tomorrow();
    taskRequest.deadlineDateTo = DateTimeUtils.tomorrow();
    taskRequest.deadlineDateTimeFrom = DateTimeUtils.startOfTomorrow();
    taskRequest.deadlineDateTimeTo = DateTimeUtils.endOfTomorrow();
    return taskRequest;
  }
});
