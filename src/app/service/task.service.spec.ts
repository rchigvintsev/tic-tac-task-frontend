import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {TaskService} from './task.service';
import {Task} from '../model/task';

describe('TaskService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let taskService: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    taskService = injector.get(TaskService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const service: TaskService = TestBed.get(TaskService);
    expect(service).toBeTruthy();
  });

  it('should return tasks', () => {
    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', completed: false}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', completed: false}));

    taskService.getTasks(false).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
    });

    const request = httpMock.expectOne(`${taskService.taskUrl}?completed=false`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks);
  });

  it('should return task by id', () => {
    const id = 1;
    const testTask = new Task().deserialize({id, title: 'Test task', completed: false});

    taskService.getTask(id).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(`${taskService.taskUrl}/${id}`);
    expect(request.request.method).toBe('GET');
    request.flush(testTask);
  });

  it('should save task', () => {
    const testTask = new Task().deserialize({title: 'Test task', completed: false});

    taskService.saveTask(testTask).subscribe(task => {
      expect(task).toEqual(testTask);
    });

    const request = httpMock.expectOne(taskService.taskUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testTask);
  });
});
