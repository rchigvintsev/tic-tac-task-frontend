import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {Router} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';
import {BaseTasksComponent} from './base-tasks.component';
import {TaskGroup} from '../../../model/task-group';
import {TaskGroupService} from '../../../service/task-group.service';
import {ConfigService} from '../../../service/config.service';
import {TaskService} from '../../../service/task.service';
import {Task} from '../../../model/task';
import {TestSupport} from '../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('BaseTasksComponent', () => {
  let component: BaseTasksComponent;
  let fixture: ComponentFixture<BaseTasksComponent>;
  let taskService: TaskService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.INBOX)},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();

    const injector = getTestBed();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';

    moment.locale(translate.currentLang);

    const router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseTasksComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));
    spyOn(taskService, 'completeTask').and.callFake(_ => of(true));
    spyOn(taskService, 'restoreTask').and.callFake(task => of(new Task().deserialize(task)));
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
      deadline: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL)
    }));
    tasks.push(new Task().deserialize({
      id: 4,
      title: 'Task 4',
      status: 'COMPLETED',
      deadline: moment().utc().subtract(1, 'hour').format(moment.HTML5_FMT.DATETIME_LOCAL)
    }));

    component = fixture.componentInstance;
    component.title = 'Test title';
    component.tasks = tasks;
    component.taskFormEnabled = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin title editing on title text click', async () => {
    await fixture.whenStable();
    component.onTitleTextClick();
    fixture.detectChanges();
    expect(component.titleEditing).toBeTruthy();
  });

  it('should end title editing on title input blur', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should end title editing on title input enter keydown', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.title = 'New title';
    component.onTitleInputEnterKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should not end title editing on title input enter keydown when title is blank', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.title = ' ';
    component.onTitleInputEnterKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeTruthy();
  });

  it('should end title editing on title input escape keydown', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.onTitleInputEscapeKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should hide title text element on click', async () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title .title-text');
    let titleSpan = fixture.debugElement.query(spanSelector);
    await fixture.whenStable();
    titleSpan.nativeElement.click();
    fixture.detectChanges();
    titleSpan = fixture.debugElement.query(spanSelector);
    expect(titleSpan).toBeFalsy();
  });

  it('should show title form on title text element click', async () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title .title-text'));
    await fixture.whenStable();
    titleSpan.nativeElement.click();
    fixture.detectChanges();
    const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
    expect(titleForm).toBeTruthy();
  });

  it('should enable task form submit button when task title is not blank', () => {
    component.taskFormModel.title = 'New task';
    component.onTaskFormModelChange();
    expect(component.taskFormSubmitEnabled).toBeTruthy();
  });

  it('should disable task form submit button when task title is blank', () => {
    component.taskFormModel.title = ' ';
    component.onTaskFormModelChange();
    expect(component.taskFormSubmitEnabled).toBeFalsy();
  });

  it('should create task', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = 'New task';
    component.onTaskFormSubmit();
    fixture.detectChanges();
    expect(taskService.createTask).toHaveBeenCalled();
  });

  it('should not create task with blank title', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = ' ';
    component.onTaskFormSubmit();
    fixture.detectChanges();
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it('should update task counters on task create', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = 'New task';
    component.onTaskFormSubmit();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
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

  it('should restore complete task', async () => {
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

  it('should add "color-warn" class to deadline label when task is overdue', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    expect(compiled.querySelector('.task-3 .deadline-column span.color-warn')).not.toBeNull();
  });
});
