import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {SidenavTaskListsComponent} from './sidenav-task-lists.component';
import {TestSupport} from '../../../../test/test-support';
import {ConfigService} from '../../../../service/config.service';
import {TaskListService} from '../../../../service/task-list.service';
import {TaskService} from '../../../../service/task.service';
import {TaskList} from '../../../../model/task-list';
import {Task} from '../../../../model/task';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';

describe('SidenavTaskListsComponent', () => {
  let component: SidenavTaskListsComponent;
  let fixture: ComponentFixture<SidenavTaskListsComponent>;
  let taskListService: TaskListService;
  let taskService: TaskService;
  let updatedTaskListSource: Subject<TaskList>;
  let completedTaskListSource: Subject<TaskList>;
  let deletedTaskListSource: Subject<TaskList>;
  let restoredTaskSource: Subject<Task>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavTaskListsComponent);
    const injector = getTestBed();

    taskListService = injector.inject(TaskListService);
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

    taskService = injector.inject(TaskService);

    restoredTaskSource = new Subject<Task>();
    spyOn(taskService, 'getRestoredTask').and.returnValue(restoredTaskSource.asObservable());

    routerEvents = new Subject();
    const router = injector.inject(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', async () => {
    routerEvents.next(new NavigationEnd(1, '/en/task-list/1', null));
    await fixture.whenStable();
    fixture.detectChanges();
    const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item.selected.task-list-1'));
    expect(selectedItem).toBeTruthy();
  });

  it('should update list of task lists on task list update', async () => {
    await fixture.whenStable();
    const updatedTaskList = new TaskList().deserialize({id: 1, name: 'Updated task list'});
    updatedTaskListSource.next(updatedTaskList);
    fixture.detectChanges();
    expect(component.taskLists[0].name).toEqual(updatedTaskList.name);
  });

  it('should update list of task lists on task list complete', async () => {
    await fixture.whenStable();
    const completedTaskList = new TaskList().deserialize({id: 1, name: 'Completed task list', completed: true});
    completedTaskListSource.next(completedTaskList);
    fixture.detectChanges();
    expect(component.taskLists.length).toBe(2);
  });

  it('should update list of task lists on task list delete', async () => {
    await fixture.whenStable();
    const deletedTaskList = new TaskList().deserialize({id: 1});
    deletedTaskListSource.next(deletedTaskList);
    fixture.detectChanges();
    expect(component.taskLists.length).toBe(2);
  });

  it('should update list of task lists on task restore', async () => {
    await fixture.whenStable();
    const restoredTaskList = new TaskList().deserialize({id: 1000, name: 'Restored task list'})
    const restoredTask = new Task().deserialize({id: 1, taskListId: restoredTaskList.id, name: 'Restored task'});
    spyOn(taskListService, 'getTaskList').and.returnValue(of(restoredTaskList));

    restoredTaskSource.next(restoredTask);
    fixture.detectChanges();
    expect(component.taskLists.length).toBe(4);
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

  it('should create task list', async () => {
    const taskListName = 'New task list';
    await fixture.whenStable();
    component.taskListFormModel.name = taskListName;
    component.onTaskListFormSubmit();
    fixture.detectChanges();
    expect(taskListService.createTaskList).toHaveBeenCalled();
    expect(component.taskLists.length).toBe(4);
    expect(component.taskLists[3].name).toEqual(taskListName);
  });

  it('should not create task list with blank name', async () => {
    await fixture.whenStable();
    component.taskListFormModel.name = ' ';
    component.onTaskListFormSubmit();
    fixture.detectChanges();
    expect(taskListService.createTaskList).not.toHaveBeenCalled();
  });
});
