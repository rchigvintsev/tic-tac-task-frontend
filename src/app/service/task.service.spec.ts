import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {ConfigService} from './config.service';
import {TaskService} from './task.service';
import {Task} from '../model/task';

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

  it('should return unprocessed tasks', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', processed: false, completed: false}));
    testTasks.push(new Task().deserialize({
      id: 2,
      title: 'Task 2',
      status: 'UNPROCESSED',
      deadline: '2120-02-16T11:46:10.234'
    }));

    const subscription = taskService.getUnprocessedTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/unprocessed`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);

    return subscription;
  });

  it('should return task by id', () => {
    const id = 1;
    const testTask = new Task().deserialize({id, title: 'Test task', completed: false});

    const subscription = taskService.getTask(id).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${id}`);
    expect(request.request.method).toBe('GET');
    request.flush(testTask);

    return subscription;
  });

  it('should create task', () => {
    const testTask = new Task().deserialize({
      title: 'Test task',
      completed: false,
      deadline: '2120-02-16T11:49:37.581'
    });

    const subscription = taskService.createTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(taskService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testTask);

    return subscription;
  });

  it('should update task', () => {
    const testTask = new Task().deserialize({id: 1, title: 'Updated test task', completed: false});

    const subscription = taskService.updateTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTask);

    return subscription;
  });

  it('should complete task', () => {
    const testTask = new Task().deserialize({id: 1, title: 'Updated test task', completed: false});

    const subscription = taskService.completeTask(testTask).subscribe(_ => {});

    const request = httpMock.expectOne(`${taskService.baseUrl}/${testTask.id}/complete`);
    expect(request.request.method).toBe('POST');
    request.flush(null);

    return subscription;
  });
});
