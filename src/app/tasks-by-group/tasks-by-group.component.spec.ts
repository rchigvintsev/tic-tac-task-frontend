import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {TasksByGroupComponent} from './tasks-by-group.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {ConfigService} from '../service/config.service';
import {TestSupport} from '../test/test-support';

describe('TasksByGroupComponent', () => {
  let component: TasksByGroupComponent;
  let fixture: ComponentFixture<TasksByGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.INBOX)}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksByGroupComponent);
    const injector = getTestBed();

    const router = injector.get(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve());

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
