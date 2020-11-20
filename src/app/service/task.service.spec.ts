import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {skip} from 'rxjs/operators';

import * as moment from 'moment';

import {ConfigService} from './config.service';
import {TaskService} from './task.service';
import {TaskGroup} from '../model/task-group';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskComment} from '../model/task-comment';

const DATE_FORMAT = moment.HTML5_FMT.DATETIME_LOCAL_MS;

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

  it('should return tasks for "INBOX" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'UNPROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.INBOX).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/unprocessed?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);
  });

  it('should return number of tasks for "INBOX" group', done => {
    taskService.getTaskCount(TaskGroup.INBOX)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/unprocessed/count`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should return tasks for "TODAY" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.TODAY).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "TODAY" group', done => {
    taskService.getTaskCount(TaskGroup.TODAY)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "TOMORROW" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.TOMORROW).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineFrom=[\d-]+T[\d:]+&deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "TOMORROW" group', done => {
    taskService.getTaskCount(TaskGroup.TOMORROW)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineFrom=[\d-]+T[\d:]+&deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "WEEK" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.WEEK).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed`)
        && /\?deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "WEEK" group', done => {
    taskService.getTaskCount(TaskGroup.WEEK)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/processed/count`)
        && /\?deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "SOME_DAY" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.SOME_DAY).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/processed?deadlineFrom=&deadlineTo=&page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);
  });

  it('should return number of tasks for "SOME_DAY" group', done => {
    taskService.getTaskCount(TaskGroup.SOME_DAY)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/processed/count?deadlineFrom=&deadlineTo=`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should return tasks for "ALL" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    taskService.getTasksByGroup(TaskGroup.ALL).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/uncompleted?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);
  });

  it('should return number of tasks for "ALL" group', done => {
    taskService.getTaskCount(TaskGroup.ALL)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/uncompleted/count`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should throw error on get tasks by group when task group is null', () => {
    expect(() => taskService.getTasksByGroup(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should throw error on get task count when task group is null', () => {
    expect(() => taskService.getTaskCount(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should return task by id', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Test task', tags: [{id: 2, name: 'Test tag'}]});

    taskService.getTask(testTask.id).subscribe(task => {
      expect(task).toEqual(testTask);
      done();
    });

    const taskRequest = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(taskRequest.request.method).toBe('GET');
    taskRequest.flush(testTask.serialize());
  });

  it('should create task', done => {
    const testTask = new Task().deserialize({title: 'Test task'});
    taskService.createTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
      done();
    });

    const request = httpMock.expectOne(taskService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testTask);
  });

  it('should throw error on task create when task is null', () => {
    expect(() => taskService.createTask(null)).toThrowError('Task must not be null or undefined');
  });

  it('should update task', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Updated test task'});

    taskService.updateTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTask);
  });

  it('should throw error on task update when task is null', () => {
    expect(() => taskService.updateTask(null)).toThrowError('Task must not be null or undefined');
  });

  it('should complete task', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Test task'});
    taskService.completeTask(testTask).subscribe(_ => done());

    const request = httpMock.expectOne(`${taskService.baseUrl}/completed/${testTask.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
  });

  it('should throw error on task complete when task is null', () => {
    expect(() => taskService.completeTask(null)).toThrowError('Task must not be null or undefined');
  });

  it('should return tags for task', done => {
    const taskId = 1;
    const testTags = [];

    testTags.push(new Tag().deserialize({id: 2, name: 'Red'}));
    testTags.push(new Tag().deserialize({id: 3, name: 'Green'}));

    taskService.getTags(taskId).subscribe(tags => {
      expect(tags.length).toBe(2);
      expect(tags).toEqual(testTags);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${taskId}/tags`);
    expect(request.request.method).toBe('GET');
    request.flush(testTags.map(tag => tag.serialize()));
  });

  it('should assign tag to task', done => {
    const taskId = 1;
    const tagId = 2;
    taskService.assignTag(taskId, tagId).subscribe(_ => done());

    const request = httpMock.expectOne(`${taskService.baseUrl}/${taskId}/tags/${tagId}`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
  });

  it('should remove tag from task', done => {
    const taskId = 1;
    const tagId = 2;
    taskService.removeTag(taskId, tagId).subscribe(_ => done());

    const request = httpMock.expectOne(`${taskService.baseUrl}/${taskId}/tags/${tagId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('should return comments for task', done => {
    const taskId = 1;
    const testComments = [];

    testComments.push(new TaskComment().deserialize({
      id: 2,
      taskId,
      commentText: 'Comment 1',
      createdAt: moment().utc().subtract(1, 'hours').format(DATE_FORMAT),
      updatedAt: moment().utc().format(DATE_FORMAT)
    }));
    testComments.push(new TaskComment().deserialize({
      id: 1,
      taskId,
      commentText: 'Comment 2',
      createdAt: moment().utc().subtract({days: 1, hours: 1}).format(DATE_FORMAT),
      updatedAt: moment().utc().subtract(1, 'days').format(DATE_FORMAT)
    }));

    taskService.getComments(taskId).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments).toEqual(testComments);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${taskId}/comments?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testComments);
  });
});
