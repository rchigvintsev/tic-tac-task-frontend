import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TaskListItemComponent} from './task-list-item.component';
import {ConfigService} from '../../../../service/config.service';
import {TaskService} from '../../../../service/task.service';
import {Task} from '../../../../model/task';
import {TestSupport} from '../../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';
import {TaskStatus} from '../../../../model/task-status';

describe('TaskListItemComponent', () => {
  let component: TaskListItemComponent;
  let fixture: ComponentFixture<TaskListItemComponent>;
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
    fixture = TestBed.createComponent(TaskListItemComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'completeTask').and.callFake(_ => of(true));
    spyOn(taskService, 'restoreTask').and.callFake(task => of(new Task().deserialize(task)));
    spyOn(taskService, 'updateTaskCounters').and.stub();

    component = fixture.componentInstance;
    component.task = new Task().deserialize({
      id: 1,
      title: 'Test task',
      status: 'PROCESSED',
      deadline: moment().utc().add(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeSpecified: true
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete task', async () => {
    await fixture.whenStable();
    component.onTaskCompleteCheckboxChange();
    expect(taskService.completeTask).toHaveBeenCalledWith(component.task);
  });

  it('should update task counters on task complete', async () => {
    await fixture.whenStable();
    component.onTaskCompleteCheckboxChange();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should restore completed task', async () => {
    await fixture.whenStable();
    component.task.status = TaskStatus.COMPLETED;
    component.onTaskCompleteCheckboxChange();
    expect(taskService.restoreTask).toHaveBeenCalledWith(component.task);
  });

  it('should update task counters on task restore', async () => {
    await fixture.whenStable();
    component.task.status = TaskStatus.COMPLETED;
    component.onTaskCompleteCheckboxChange();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should render task deadline', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    const spanContent = compiled.querySelector('.task-1 .deadline-column span').textContent;
    expect(spanContent).not.toBeNull();
    expect(spanContent.trim()).toBe('in a month');
  });

  it('should highlight overdue task', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    component.task.deadline = moment().subtract(1, 'hour').toDate();
    fixture.detectChanges();
    expect(compiled.querySelector('.task-1 .color-warn')).not.toBeNull();
  });
});
