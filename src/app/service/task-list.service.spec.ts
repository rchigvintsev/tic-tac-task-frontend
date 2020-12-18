import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {TaskListService} from './task-list.service';
import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';
import {TestSupport} from '../test/test-support';
import {Task} from '../model/task';

describe('TaskListService', () => {
  let httpMock: HttpTestingController;
  let taskListService: TaskListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    });
    const injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    taskListService = injector.get(TaskListService);
  });

  it('should be created', () => {
    const service: TaskListService = TestBed.get(TaskListService);
    expect(service).toBeTruthy();
  });

  it('should return all uncompleted task lists', done => {
    const testTaskLists = [];
    testTaskLists.push(new TaskList().deserialize({id: 1, name: 'Task list 1'}));
    testTaskLists.push(new TaskList().deserialize({id: 2, name: 'Task list 2'}));

    taskListService.getUncompletedTaskLists().subscribe(taskLists => {
      expect(taskLists.length).toBe(2);
      expect(taskLists).toEqual(testTaskLists);
      done();
    });

    const request = httpMock.expectOne(`${taskListService.baseUrl}/uncompleted`);
    expect(request.request.method).toBe('GET');
    request.flush(testTaskLists.map(tag => tag.serialize()));
  });

  it('should return task list by id', done => {
    const testTaskList = new TaskList().deserialize({id: 1, name: 'Test task list'});

    taskListService.getTaskList(testTaskList.id).subscribe(taskList => {
      expect(taskList).toEqual(testTaskList);
      done();
    });

    const taskRequest = httpMock.expectOne(`${taskListService.baseUrl}/${testTaskList.id}`);
    expect(taskRequest.request.method).toBe('GET');
    taskRequest.flush(testTaskList.serialize());
  });

  it('should create task list', done => {
    const testTaskList = new TaskList().deserialize({name: 'Test task list'});
    taskListService.createTaskList(testTaskList).subscribe(taskList => {
      expect(taskList).toEqual(testTaskList);
      done();
    });

    const request = httpMock.expectOne(taskListService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testTaskList);
  });

  it('should update task list', done => {
    const testTaskList = new TaskList().deserialize({id: 1, name: 'Updated test task list'});

    taskListService.updateTaskList(testTaskList).subscribe(taskList => {
      expect(taskList).toEqual(testTaskList);
      done();
    });

    const request = httpMock.expectOne(`${taskListService.baseUrl}/${testTaskList.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTaskList);
  });

  it('should throw error on task list update when task list is null', () => {
    expect(() => taskListService.updateTaskList(null)).toThrowError('Task list must not be null or undefined');
  });

  it('should delete task list', () => {
    const testTaskList = new TaskList().deserialize({id: 1});
    taskListService.deleteTaskList(testTaskList).subscribe(() => {});
    const request = httpMock.expectOne(`${taskListService.baseUrl}/${testTaskList.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('should return tasks for task list', done => {
    const taskListId = 1;
    const testTasks = [];

    testTasks.push(new Task().deserialize({id: 2, taskListId, title: 'Task 1'}));
    testTasks.push(new Task().deserialize({id: 3, taskListId, title: 'Task 2'}));

    taskListService.getTasks(taskListId).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne(`${taskListService.baseUrl}/${taskListId}/tasks?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks.map(task => task.serialize()));
  });
});
