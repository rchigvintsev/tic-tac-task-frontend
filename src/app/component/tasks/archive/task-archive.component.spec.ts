import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {of} from 'rxjs';

import {TestSupport} from '../../../test/test-support';
import {TaskArchiveComponent} from './task-archive.component';
import {ConfigService} from '../../../service/config.service';
import {TaskService} from '../../../service/task.service';
import {PageRequest} from '../../../service/page-request';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('TaskArchiveComponent', () => {
  let component: TaskArchiveComponent;
  let fixture: ComponentFixture<TaskArchiveComponent>;
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskArchiveComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const tasks = [
      new Task().deserialize({id: 1, title: 'Task 1', status: TaskStatus.COMPLETED}),
      new Task().deserialize({id: 2, title: 'Task 2', status: TaskStatus.COMPLETED})
    ];

    taskService = injector.inject(TaskService);
    spyOn(taskService, 'getArchivedTasks').and.returnValue(of(tasks));
    spyOn(taskService, 'restoreTask').and.callFake(t => of(t));
    spyOn(taskService, 'updateTaskCounters').and.stub();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load archived tasks on init', async () => {
    await fixture.whenStable();
    expect(taskService.getArchivedTasks).toHaveBeenCalled();
  });

  it('should load next task page on task list scroll', async () => {
    await fixture.whenStable();
    component.onTaskListScroll();
    expect(taskService.getArchivedTasks).toHaveBeenCalledWith(new PageRequest(1));
  });

  it('should restore task on task restore button click', async () => {
    await fixture.whenStable();

    const task = component.tasks[0];
    component.onTaskRestoreButtonClick(task);
    fixture.detectChanges();

    expect(taskService.restoreTask).toHaveBeenCalledWith(task);
    expect(component.tasks.length).toEqual(1);
  });

  it('should update task counters on task restore', async () => {
    component.onTaskRestoreButtonClick(component.tasks[0]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });
});
