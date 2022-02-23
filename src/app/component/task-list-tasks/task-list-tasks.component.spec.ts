import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TaskListTasksComponent} from './task-list-tasks.component';
import {ConfigService} from '../../service/config.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageRequest} from '../../service/page-request';
import {Task} from '../../model/task';
import {TaskStatus} from '../../model/task-status';
import {TaskGroup} from '../../model/task-group';
import {TaskList} from '../../model/task-list';
import {ResourceNotFoundError} from '../../error/resource-not-found.error';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';
import any = jasmine.any;

const CURRENT_LANG = 'en';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({result: true})
    };
  }
}

describe('TaskListTasksComponent', () => {
  const taskList = new TaskList().deserialize({id: 1, name: 'Test task list'});

  let component: TaskListTasksComponent;
  let fixture: ComponentFixture<TaskListTasksComponent>;
  let router: Router;
  let taskService: TaskService;
  let taskListService: TaskListService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: ActivatedRoute, useValue: {params: of([{id: 1}])}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListTasksComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.inject(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const tasks = [
      new Task().deserialize({id: 2, taskListIdL: taskList.id, title: 'Task 1'}),
      new Task().deserialize({id: 3, taskListIdL: taskList.id, title: 'Task 2'})
    ];

    taskListService = injector.inject(TaskListService);
    spyOn(taskListService, 'getTaskList').and.returnValue(of(taskList));
    spyOn(taskListService, 'getTasks').and.returnValue(of(tasks));
    spyOn(taskListService, 'updateTaskList').and.callFake(t => of(t));
    spyOn(taskListService, 'completeTaskList').and.returnValue(of(true));
    spyOn(taskListService, 'deleteTaskList').and.returnValue(of(true));
    spyOn(taskListService, 'addTask').and.returnValue(of(true));

    taskService = injector.inject(TaskService);
    spyOn(taskService, 'updateTaskCounters').and.stub();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load next task page on task list scroll', async () => {
    await fixture.whenStable();
    component.onTaskListScroll();
    expect(taskListService.getTasks).toHaveBeenCalledWith(any(Number), new PageRequest(1));
  });

  it('should undo changes in title on title input escape keydown', async () => {
    const previousTitle = component.taskListFormModel.name;
    await fixture.whenStable();
    component.taskListFormModel.name = 'New name';
    component.onTitleInputEscapeKeydown();
    fixture.detectChanges();
    expect(component.taskListFormModel.name).toEqual(previousTitle);
  });

  it('should save task list on title input blur', async () => {
    await fixture.whenStable();
    component.taskListFormModel.name = 'New name';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(taskListService.updateTaskList).toHaveBeenCalled();
  });

  it('should not save task list with blank name', async () => {
    await fixture.whenStable();
    component.taskListFormModel.name = ' ';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(taskListService.updateTaskList).not.toHaveBeenCalled();
  });

  it('should complete task list', async () => {
    await fixture.whenStable();
    component.onCompleteTaskListButtonClick();
    fixture.detectChanges();
    expect(taskListService.completeTaskList).toHaveBeenCalled();
  });

  it('should update task counters on task list complete', async () => {
    await fixture.whenStable();
    component.onCompleteTaskListButtonClick();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should navigate to "tasks-for-today" page on task list complete', async () => {
    await fixture.whenStable();
    component.onCompleteTaskListButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });

  it('should delete task list', async () => {
    await fixture.whenStable();
    component.onDeleteTaskListButtonClick();
    fixture.detectChanges();
    expect(taskListService.deleteTaskList).toHaveBeenCalled();
  });

  it('should navigate to "tasks-for-today" page on task list delete', async () => {
    await fixture.whenStable();
    component.onDeleteTaskListButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });

  it('should navigate to "not-found" error page when task list is not found', async () => {
    taskListService.getTaskList = jasmine.createSpy('getTaskList').and.callFake(() => {
      return throwError(() => ResourceNotFoundError.fromResponse({url: `/task-list/${taskList.id}`}));
    });
    component.ngOnInit();
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
  });

  it('should include new task in current task list', async () => {
    await fixture.whenStable();

    const newTask = new Task().deserialize({title: 'New task', status: TaskStatus.PROCESSED});
    component.onTaskCreate(newTask)

    expect(component.tasks.length).toBe(3);
    expect(component.tasks[2].title).toBe(newTask.title);
    expect(component.tasks[2].taskListId).toBe(taskList.id);
  });
});
