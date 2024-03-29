import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TaskListComponent} from './task-list.component';
import {ConfigService} from '../../../service/config.service';
import {Task} from '../../../model/task';
import {TestSupport} from '../../../test/test-support';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;

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
});
