import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TaskListComponent} from './task-list.component';
import {ConfigService} from '../../service/config.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageRequest} from '../../service/page-request';
import {TaskList} from '../../model/task-list';
import {Task} from '../../model/task';
import any = jasmine.any;

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: TaskService;
  let taskListService: TaskListService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const taskList = new TaskList().deserialize({id: 1, name: 'Test task list'});
    const tasks = [
      new Task().deserialize({id: 2, taskListIdL: taskList.id, title: 'Task 1'}),
      new Task().deserialize({id: 3, taskListIdL: taskList.id, title: 'Task 2'})
    ];

    taskListService = injector.get(TaskListService);
    spyOn(taskListService, 'getTaskList').and.returnValue(of(taskList));
    spyOn(taskListService, 'getTasks').and.returnValue(of(tasks));

    taskService = injector.get(TaskService);
    spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load next task page on task list scroll', () => {
    fixture.whenStable().then(() => {
      component.onTaskListScroll();
      expect(taskListService.getTasks).toHaveBeenCalledWith(any(Number), new PageRequest(1));
    });
  });
});
