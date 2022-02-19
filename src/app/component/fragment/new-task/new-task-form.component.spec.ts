import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {of} from 'rxjs';

import * as moment from 'moment';

import {NewTaskFormComponent} from './new-task-form.component';
import {ConfigService} from '../../../service/config.service';
import {TaskService} from '../../../service/task.service';
import {Task} from '../../../model/task';
import {TestSupport} from '../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('NewTaskFormComponent', () => {
  let component: NewTaskFormComponent;
  let fixture: ComponentFixture<NewTaskFormComponent>;
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
    fixture = TestBed.createComponent(NewTaskFormComponent);

    taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'createTask').and.callFake(task => of(new Task().deserialize(task)));
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
    component.formSubmitEnabled = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable task form submit button when task title is not blank', () => {
    component.formModel.title = 'New task';
    component.onFormModelChange();
    expect(component.formSubmitEnabled).toBeTruthy();
  });

  it('should disable form submit button when task title is blank', () => {
    component.formModel.title = ' ';
    component.onFormModelChange();
    expect(component.formSubmitEnabled).toBeFalsy();
  });

  it('should create task', async () => {
    await fixture.whenStable();
    component.formModel.title = 'New task';
    component.onFormSubmit();
    fixture.detectChanges();
    expect(taskService.createTask).toHaveBeenCalled();
  });

  it('should not create task with blank title', async () => {
    await fixture.whenStable();
    component.formModel.title = ' ';
    component.onFormSubmit();
    fixture.detectChanges();
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it('should update task counters on task create', async () => {
    await fixture.whenStable();
    component.formModel.title = 'New task';
    component.onFormSubmit();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });
});
