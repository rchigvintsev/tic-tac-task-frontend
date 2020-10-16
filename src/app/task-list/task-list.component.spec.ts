import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';
import {TaskListComponent} from './task-list.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {ConfigService} from '../service/config.service';
import {TaskService} from '../service/task.service';
import {Task} from '../model/task';
import {TestSupport} from '../test/test-support';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: TaskService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.INBOX)}
      ]
    }).compileComponents();

    const injector = getTestBed();

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    moment.locale(translate.currentLang);

    const router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'completeTask').and.callFake(_ => of(true));
    spyOn(taskService, 'updateTaskCounters').and.stub();

    const tasks = [];
    tasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'UNPROCESSED'}));
    tasks.push(new Task().deserialize({
      id: 2,
      title: 'Task 2',
      status: 'PROCESSED',
      deadline: moment().utc().add(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeExplicitlySet: true
    }));
    tasks.push(new Task().deserialize({
      id: 3,
      title: 'Task 3',
      status: 'PROCESSED',
      deadline: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeExplicitlySet: false
    }));

    component = fixture.componentInstance;
    component.tasks = tasks;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete task', fakeAsync(() => {
    const task1 = component.tasks[0];
    const task2 = component.tasks[1];

    component.onTaskCompleteCheckboxChange(task1);
    tick(400);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(taskService.completeTask).toHaveBeenCalledWith(task1);
      expect(component.tasks.length).toEqual(2);
      expect(component.tasks[0].id).toEqual(task2.id);
    });
  }));

  it('should update task counters on task complete', fakeAsync(() => {
    component.onTaskCompleteCheckboxChange(component.tasks[0]);
    tick(400);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  }));

  it('should render task deadline', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      const spanContent = compiled.querySelector('.task-2 .deadline-column span').textContent;
      expect(spanContent).not.toBeNull();
      expect(spanContent.trim()).toBe('in a month');
    });
  });

  it('should add "color-warn" class to deadline label when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      expect(compiled.querySelector('.task-3 .deadline-column span.color-warn')).not.toBeNull();
    });
  });

  it('should emit event on task list scroll', () => {
    spyOn(component.taskListScroll, 'emit');
    fixture.whenStable().then(() => {
      component.onTaskListScroll({});
      expect(component.taskListScroll.emit).toHaveBeenCalled();
    });
  });
});
