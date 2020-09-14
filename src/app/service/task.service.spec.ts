import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {skip} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {TaskService} from './task.service';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskGroup} from './task-group';

describe('TaskService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let taskService: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    });
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    taskService = injector.get(TaskService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const service: TaskService = TestBed.get(TaskService);
    expect(service).toBeTruthy();
  });

  it('should return tasks for "INBOX" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'UNPROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.INBOX).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/unprocessed?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "INBOX" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.INBOX)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne(`${taskService.baseUrl}/unprocessed/count`);
    expect(request.request.method).toBe('GET');
    request.flush(2);

    return subscription;
  });

  it('should return tasks for "TODAY" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.TODAY).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "TODAY" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.TODAY)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(2);

    return subscription;
  });

  it('should return tasks for "TOMORROW" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.TOMORROW).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineDateFrom=[0-9\-]+&deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "TOMORROW" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.TOMORROW)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineDateFrom=[0-9\-]+&deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(2);

    return subscription;
  });

  it('should return tasks for "WEEK" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.WEEK).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "WEEK" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.WEEK)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineDateTo=[0-9\-]+/.test(httpReq.url);
    });
    request.flush(2);

    return subscription;
  });

  it('should return tasks for "SOME_DAY" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.SOME_DAY).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/processed`
      + '?deadlineDateFrom=&deadlineDateTo=&page=0&size=20');
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "SOME_DAY" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.SOME_DAY)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne(`${taskService.baseUrl}/processed/count`
      + '?deadlineDateFrom=&deadlineDateTo=');
    expect(request.request.method).toBe('GET');
    request.flush(2);

    return subscription;
  });

  it('should return tasks for "ALL" group', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    const subscription = taskService.getTasks(TaskGroup.ALL).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/uncompleted?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);

    return subscription;
  });

  it('should return number of tasks for "ALL" group', () => {
    const subscription = taskService.getTaskCount(TaskGroup.ALL)
      .pipe(skip(1))
      .subscribe(count => expect(count).toBe(2));

    const request = httpMock.expectOne(`${taskService.baseUrl}/uncompleted/count`);
    expect(request.request.method).toBe('GET');
    request.flush(2);

    return subscription;
  });

  it('should throw error on get tasks when task group is null', () => {
    expect(() => taskService.getTasks(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should throw error on get task count when task group is null', () => {
    expect(() => taskService.getTaskCount(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should return task by id', () => {
    const testTag = new Tag().deserialize({id: 2, name: 'Test tag'});
    const testTask = new Task().deserialize({id: 1, title: 'Test task', tags: [testTag]});

    const subscription = taskService.getTask(testTask.id).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const taskRequest = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(taskRequest.request.method).toBe('GET');
    taskRequest.flush(testTask);

    return subscription;
  });

  it('should create task', () => {
    const testTask = new Task().deserialize({title: 'Test task'});
    const subscription = taskService.createTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(taskService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testTask);

    return subscription;
  });

  it('should update task', () => {
    const testTask = new Task().deserialize({id: 1, title: 'Updated test task'});

    const subscription = taskService.updateTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTask);

    return subscription;
  });

  it('should complete task', () => {
    const testTask = new Task().deserialize({id: 1, title: 'Updated test task'});

    const subscription = taskService.completeTask(testTask).subscribe(_ => {});

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}/complete`);
    expect(request.request.method).toBe('POST');
    request.flush(null);

    return subscription;
  });
});
