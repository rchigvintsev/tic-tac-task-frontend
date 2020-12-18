import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TaskListTasksComponent} from './task-list-tasks.component';
import {ConfigService} from '../../service/config.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageRequest} from '../../service/page-request';
import {TaskList} from '../../model/task-list';
import {Task} from '../../model/task';
import {TaskGroup} from '../../model/task-group';
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
  let component: TaskListTasksComponent;
  let fixture: ComponentFixture<TaskListTasksComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let taskService: TaskService;
  let taskListService: TaskListService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: ActivatedRoute, useValue: {params: of([{id: 1}])}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListTasksComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    httpMock = injector.get(HttpTestingController);

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const taskList = new TaskList().deserialize({id: 1, name: 'Test task list'});
    const tasks = [
      new Task().deserialize({id: 2, taskListIdL: taskList.id, title: 'Task 1'}),
      new Task().deserialize({id: 3, taskListIdL: taskList.id, title: 'Task 2'})
    ];

    taskListService = injector.get(TaskListService);
    spyOn(taskListService, 'getTaskList').and.returnValue(of(taskList));
    spyOn(taskListService, 'getTasks').and.returnValue(of(tasks));
    spyOn(taskListService, 'updateTaskList').and.callFake(t => of(t));

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

  it('should begin title editing on title text click', () => {
    fixture.whenStable().then(() => {
      component.onTitleTextClick();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input blur', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should end title editing on title input enter keydown', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputEnterKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should not end title editing on title input enter keydown when title is blank', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.taskListFormModel.name = '';
      component.onTitleInputEnterKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input escape keydown', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputEscapeKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should undo changes in title on title input escape keydown', () => {
    fixture.whenStable().then(() => {
      component.taskListFormModel.name = 'New name';
      component.onTitleInputEscapeKeydown();
      fixture.detectChanges();
      expect(component.taskListFormModel.name).toEqual('Test task list');
    });
  });

  it('should hide title text element on click', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title .title-text');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form on title text element click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title .title-text'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task list on title input blur', () => {
    fixture.whenStable().then(() => {
      component.taskListFormModel.name = 'New name';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskListService.updateTaskList).toHaveBeenCalled();
    });
  });

  it('should not save task list with blank name', () => {
    fixture.whenStable().then(() => {
      component.taskListFormModel.name = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskListService.updateTaskList).not.toHaveBeenCalled();
    });
  });

  it('should delete task list', () => {
    spyOn(taskListService, 'deleteTaskList').and.returnValue(of());
    fixture.whenStable().then(() => {
      component.onDeleteTaskListButtonClick();
      fixture.detectChanges();
      expect(taskListService.deleteTaskList).toHaveBeenCalled();
    });
  });

  it('should navigate to "tasks-for-today" on task list delete', () => {
    component.onDeleteTaskListButtonClick();
    httpMock.expectOne(`${taskListService.baseUrl}/${component.taskListFormModel.id}`).flush(null);
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });
});
