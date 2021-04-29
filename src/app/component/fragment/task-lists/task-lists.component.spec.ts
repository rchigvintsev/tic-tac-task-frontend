import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {TaskListsComponent} from './task-lists.component';
import {TestSupport} from '../../../test/test-support';
import {ConfigService} from '../../../service/config.service';
import {TaskListService} from '../../../service/task-list.service';
import {TaskList} from '../../../model/task-list';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('TaskListsComponent', () => {
  let component: TaskListsComponent;
  let fixture: ComponentFixture<TaskListsComponent>;
  let taskListService: TaskListService;
  let updatedTaskListSource: Subject<TaskList>;
  let completedTaskListSource: Subject<TaskList>;
  let deletedTaskListSource: Subject<TaskList>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListsComponent);
    const injector = getTestBed();

    taskListService = injector.get(TaskListService);
    const taskLists = [];
    for (let i = 0; i < 3; i++) {
      taskLists.push(new TaskList().deserialize({id: i + 1, name: `Test task list ${i + 1}`}));
    }
    spyOn(taskListService, 'getUncompletedTaskLists').and.returnValue(of(taskLists));
    spyOn(taskListService, 'createTaskList').and.callFake(list => {
      const result = new TaskList().deserialize(list);
      if (!list.id) {
        result.id = 4;
      }
      return of(result);
    });

    updatedTaskListSource = new Subject<TaskList>();
    spyOn(taskListService, 'getUpdatedTaskList').and.returnValue(updatedTaskListSource.asObservable());
    completedTaskListSource = new Subject<TaskList>();
    spyOn(taskListService, 'getCompletedTaskList').and.returnValue(completedTaskListSource.asObservable());
    deletedTaskListSource = new Subject<TaskList>();
    spyOn(taskListService, 'getDeletedTaskList').and.returnValue(deletedTaskListSource.asObservable());

    routerEvents = new Subject();
    const router = injector.get(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', () => {
    routerEvents.next(new NavigationEnd(1, '/en/task-list/1', null));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item-selected.task-list-1'));
      expect(selectedItem).toBeTruthy();
    });
  });

  it('should update list of task lists on task list update', () => {
    fixture.whenStable().then(() => {
      const updatedTaskList = new TaskList().deserialize({id: 1, name: 'Updated task list'});
      updatedTaskListSource.next(updatedTaskList);
      fixture.detectChanges();
      expect(component.taskLists[0].name).toEqual(updatedTaskList.name);
    });
  });

  it('should update list of task lists on task list complete', () => {
    fixture.whenStable().then(() => {
      const completedTaskList = new TaskList().deserialize({id: 1, name: 'Completed task list', completed: true});
      completedTaskListSource.next(completedTaskList);
      fixture.detectChanges();
      expect(component.taskLists.length).toBe(2);
    });
  });

  it('should update list of task lists on task list delete', () => {
    fixture.whenStable().then(() => {
      const deletedTaskList = new TaskList().deserialize({id: 1});
      deletedTaskListSource.next(deletedTaskList);
      fixture.detectChanges();
      expect(component.taskLists.length).toBe(2);
    });
  });

  it('should enable task list form submit button when task list name is not blank', () => {
    component.taskListFormModel.name = 'New task list';
    component.onTaskListFormModelNameChange();
    expect(component.taskListFormSubmitEnabled).toBeTruthy();
  });

  it('should disable task list form submit button when task list name is blank', () => {
    component.taskListFormModel.name = ' ';
    component.onTaskListFormModelNameChange();
    expect(component.taskListFormSubmitEnabled).toBeFalsy();
  });

  it('should create task list', () => {
    const taskListName = 'New task list';
    fixture.whenStable().then(() => {
      component.taskListFormModel.name = taskListName;
      component.onTaskListFormSubmit();
      fixture.detectChanges();
      expect(taskListService.createTaskList).toHaveBeenCalled();
      expect(component.taskLists.length).toBe(4);
      expect(component.taskLists[3].name).toEqual(taskListName);
    });
  });

  it('should not create task list with blank name', () => {
    fixture.whenStable().then(() => {
      component.taskListFormModel.name = ' ';
      component.onTaskListFormSubmit();
      fixture.detectChanges();
      expect(taskListService.createTaskList).not.toHaveBeenCalled();
    });
  });
});
