import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {TaskListService} from './task-list.service';
import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';
import {TestSupport} from '../test/test-support';

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

  it('should delete task list', () => {
    const testTaskList = new TaskList().deserialize({id: 1});
    taskListService.deleteTaskList(testTaskList).subscribe(() => {});
    const request = httpMock.expectOne(`${taskListService.baseUrl}/${testTaskList.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
