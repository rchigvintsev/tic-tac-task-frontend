import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatDialogModule} from '@angular/material/dialog';

import {first, skip} from 'rxjs/operators';

import * as moment from 'moment';

import {TranslateModule} from '@ngx-translate/core';

import {ConfigService} from './config.service';
import {TaskService} from './task.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {TaskGroup} from '../model/task-group';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskComment} from '../model/task-comment';
import {TaskStatus} from '../model/task-status';

const DATE_FORMAT = moment.HTML5_FMT.DATETIME_LOCAL_MS;

describe('TaskService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let taskService: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule, TranslateModule.forRoot()],
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}}]
    });

    injector = getTestBed();

    const loadingIndicatorService = injector.inject(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    httpMock = injector.inject(HttpTestingController);
    taskService = injector.inject(TaskService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const service: TaskService = TestBed.inject(TaskService);
    expect(service).toBeTruthy();
  });

  it('should return tasks for "INBOX" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'UNPROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    taskService.getTasksForTaskGroup(TaskGroup.INBOX).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=UNPROCESSED,COMPLETED`)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "INBOX" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.INBOX)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/count?statuses=UNPROCESSED`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should return tasks for "TODAY" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 3, title: 'Task 3', status: 'COMPLETED'}));

    taskService.getTasksForTaskGroup(TaskGroup.TODAY).subscribe(tasks => {
      expect(tasks.length).toBe(3);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=PROCESSED,COMPLETED`)
        && /deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "TODAY" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.TODAY)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/count?statuses=PROCESSED`)
        && /deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "TOMORROW" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksForTaskGroup(TaskGroup.TOMORROW).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=PROCESSED,COMPLETED`)
        && /deadlineFrom=[\d-]+T[\d:]+&deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "TOMORROW" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.TOMORROW)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/count?statuses=PROCESSED`)
        && /deadlineFrom=[\d-]+T[\d:]+&deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "WEEK" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 3, title: 'Task 3', status: 'COMPLETED'}));

    taskService.getTasksForTaskGroup(TaskGroup.WEEK).subscribe(tasks => {
      expect(tasks.length).toBe(3);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=PROCESSED,COMPLETED`)
        && /deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "WEEK" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.WEEK)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}/count?statuses=PROCESSED`)
        && /deadlineTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });
    request.flush(2);
  });

  it('should return tasks for "SOME_DAY" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'PROCESSED'}));

    taskService.getTasksForTaskGroup(TaskGroup.SOME_DAY).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=PROCESSED,COMPLETED&deadlineFrom=&deadlineTo=`)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "SOME_DAY" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.SOME_DAY)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/count?statuses=PROCESSED&deadlineFrom=&deadlineTo=`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should return tasks for "ALL" group', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    taskService.getTasksForTaskGroup(TaskGroup.ALL).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=UNPROCESSED,PROCESSED,COMPLETED`)
        && /completedAtFrom=[\d-]+T[\d:]+/.test(httpReq.url)
        && httpReq.url.endsWith('page=0&size=20');
    });
    request.flush(testTasks);
  });

  it('should return number of tasks for "ALL" group', done => {
    taskService.getTaskCountForTaskGroup(TaskGroup.ALL)
      .pipe(skip(1))
      .subscribe(count => { expect(count).toBe(2); done(); });

    const request = httpMock.expectOne(`${taskService.baseUrl}/count?statuses=UNPROCESSED,PROCESSED`);
    expect(request.request.method).toBe('GET');
    request.flush(2);
  });

  it('should reset task counters', done => {
    const subscription = taskService.getTaskCountForTaskGroup(TaskGroup.ALL)
      .pipe(skip(1))
      .subscribe(_ => {
        subscription.unsubscribe();
        taskService.resetTaskCounters();
        taskService.getTaskCountForTaskGroup(TaskGroup.ALL).pipe(first()).subscribe(count => {
          expect(count).toBe(0);
          done();
        });

        const request2 = httpMock.expectOne(`${taskService.baseUrl}/count?statuses=UNPROCESSED,PROCESSED`);
        expect(request2.request.method).toBe('GET');
        request2.flush(2);
      });

    const request1 = httpMock.expectOne(`${taskService.baseUrl}/count?statuses=UNPROCESSED,PROCESSED`);
    expect(request1.request.method).toBe('GET');
    request1.flush(2);
  });

  it('should throw error on get tasks by group when task group is null', () => {
    expect(() => taskService.getTasksForTaskGroup(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should throw error on get task count when task group is null', () => {
    expect(() => taskService.getTaskCountForTaskGroup(null)).toThrowError('Task group must not be null or undefined');
  });

  it('should return archived tasks', done => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: TaskStatus.COMPLETED}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: TaskStatus.COMPLETED}));

    taskService.getArchivedTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne((httpReq) => {
      return httpReq.method === 'GET'
        && httpReq.url.startsWith(`${taskService.baseUrl}?statuses=COMPLETED`)
        && /completedAtTo=[\d-]+T[\d:]+/.test(httpReq.url);
    });

    expect(request.request.method).toBe('GET');
    request.flush(testTasks);
  });

  it('should return task by id', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Test task'});

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
    request.flush(testTask.serialize());
  });

  it('should notify about updated task', done => {
    const testTask = new Task().deserialize({id: 1, name: 'Test task'});
    taskService.getUpdatedTask().subscribe(task => {
      expect(task).toEqual(testTask);
      done();
    });
    taskService.updateTask(testTask).subscribe(() => {});
    httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`).flush(testTask.serialize());
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

  it('should restore task', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Test task', status: TaskStatus.COMPLETED});
    const restoredTestTask = testTask.clone();
    restoredTestTask.status = TaskStatus.PROCESSED;

    taskService.restoreTask(testTask).subscribe(task => {
      expect(task.status).toEqual(restoredTestTask.status);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/completed/${testTask.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(restoredTestTask.serialize());
  });

  it('should notify about restored task', done => {
    const testTask = new Task().deserialize({id: 1, name: 'Test task', status: TaskStatus.PROCESSED});
    taskService.getRestoredTask().subscribe(task => {
      expect(task).toEqual(testTask);
      done();
    });
    taskService.restoreTask(testTask).subscribe(() => {});
    httpMock.expectOne(`${taskService.baseUrl}/completed/${testTask.id}`).flush(testTask.serialize());
  });

  it('should throw error on task restore when task is null', () => {
    expect(() => taskService.restoreTask(null)).toThrowError('Task must not be null or undefined');
  });

  it('should delete task', done => {
    const testTask = new Task().deserialize({id: 1, title: 'Test task'});
    taskService.deleteTask(testTask).subscribe(_ => done());

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('should throw error on task delete when task is null', () => {
    expect(() => taskService.deleteTask(null)).toThrowError('Task must not be null or undefined');
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
      id: 3,
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
    request.flush(testComments.map(comment => comment.serialize()));
  });

  it('should add new comment to task', done => {
    const taskId = 1;
    const testComment = new TaskComment().deserialize({commentText: 'New comment'});
    taskService.addComment(taskId, testComment).subscribe(comment => {
      expect(comment).toEqual(testComment);
      done();
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${taskId}/comments`);
    expect(request.request.method).toBe('POST');
    request.flush(testComment.serialize());
  });

  it('should throw error on comment add when comment is null', () => {
    expect(() => taskService.addComment(1, null)).toThrowError('Task comment must not be null or undefined');
  });
});
