import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {TaskListsComponent} from './task-lists.component';
import {TestSupport} from '../../test/test-support';
import {ConfigService} from '../../service/config.service';
import {TaskListService} from '../../service/task-list.service';
import {TaskList} from '../../model/task-list';
import {TaskComment} from "../../model/task-comment";

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('TaskListsComponent', () => {
  let component: TaskListsComponent;
  let fixture: ComponentFixture<TaskListsComponent>;
  let taskListService: TaskListService;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}
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
    spyOn(taskListService, 'deleteTaskList').and.returnValue(of(null));

    routerEvents = new Subject();
    const router = injector.get(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show task list menu trigger button on task list list item mouse over', () => {
    const taskListId = component.taskLists[0].id;
    const menuTriggerColumnSelector = By.css('.task-list-' + taskListId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTaskListListItemMouseOver(component.taskLists[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toBeNull();
    });
  });

  it('should hide task list menu trigger button on task list list item mouse out', () => {
    component.onTaskListListItemMouseOver(component.taskLists[0]);
    const taskListId = component.taskLists[0].id;
    const menuTriggerColumnSelector = By.css('.task-list-' + taskListId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTaskListListItemMouseOut();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should not hide task list menu trigger button on task list list item mouse out when task list menu is opened', () => {
    component.onTaskListListItemMouseOver(component.taskLists[0]);
    const taskListId = component.taskLists[0].id;
    const menuTriggerColumnSelector = By.css('.task-list-' + taskListId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTaskListMenuOpened();
      component.onTaskListListItemMouseOut();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toBeNull();
    });
  });

  it('should hide task list menu trigger button on task list menu closed', () => {
    component.onTaskListListItemMouseOver(component.taskLists[0]);
    const taskListId = component.taskLists[0].id;
    const menuTriggerColumnSelector = By.css('.task-list-' + taskListId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTaskListMenuClosed();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should delete task list', () => {
    fixture.whenStable().then(() => {
      const taskListToDelete = component.taskLists[0];
      component.onDeleteTaskListButtonClick(taskListToDelete);
      fixture.detectChanges();
      expect(component.taskLists.length).toBe(2);
      expect(component.taskLists[0]).not.toEqual(taskListToDelete);
    });
  });

  it('should highlight selected menu item', () => {
    routerEvents.next(new NavigationEnd(1, '/en/task-list/1', null));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item-selected.task-list-1'));
      expect(selectedItem).toBeTruthy();
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
      expect(component.taskLists[0].name).toEqual(taskListName);
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
