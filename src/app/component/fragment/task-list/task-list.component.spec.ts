import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TaskListComponent} from './task-list.component';
import {ConfigService} from '../../../service/config.service';
import {TaskService} from '../../../service/task.service';
import {Task} from '../../../model/task';
import {TestSupport} from '../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: TaskService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();

    const injector = getTestBed();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';
    moment.locale(translate.currentLang);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'completeTask').and.callFake(_ => of(true));
    spyOn(taskService, 'restoreTask').and.callFake(task => of(new Task().deserialize(task)));
    spyOn(taskService, 'updateTaskCounters').and.stub();

    const tasks = [];
    tasks.push(new Task().deserialize({
      id: 1,
      title: 'Task 1',
      status: 'UNPROCESSED'
    }));
    tasks.push(new Task().deserialize({
      id: 2,
      title: 'Task 2',
      status: 'PROCESSED',
      deadline: moment().utc().add(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeSpecified: true
    }));
    tasks.push(new Task().deserialize({
      id: 3,
      title: 'Task 3',
      status: 'PROCESSED',
      deadline: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL)
    }));
    tasks.push(new Task().deserialize({
      id: 4,
      title: 'Task 4',
      status: 'COMPLETED',
      deadline: moment().utc().subtract(1, 'hour').format(moment.HTML5_FMT.DATETIME_LOCAL)
    }));

    component = fixture.componentInstance;
    component.tasks = tasks;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete task', async () => {
    component.onTaskCompleteCheckboxChange(component.tasks[0]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(taskService.completeTask).toHaveBeenCalledWith(component.tasks[0]);
  });

  it('should update task counters on task complete', async () => {
    component.onTaskCompleteCheckboxChange(component.tasks[0]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should restore completed task', async () => {
    component.onTaskCompleteCheckboxChange(component.tasks[3]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(taskService.restoreTask).toHaveBeenCalledWith(component.tasks[3]);
  });

  it('should update task counters on task restore', async () => {
    component.onTaskCompleteCheckboxChange(component.tasks[3]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should render task deadline', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    const spanContent = compiled.querySelector('.task-2 .deadline-column span').textContent;
    expect(spanContent).not.toBeNull();
    expect(spanContent.trim()).toBe('in a month');
  });

  it('should add "color-warn" class to task list row when task is overdue', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    expect(compiled.querySelector('.task-3 .task-list-row')).not.toBeNull();
  });
});
