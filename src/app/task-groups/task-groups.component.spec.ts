import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TaskGroupsComponent} from './task-groups.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {ComponentTestSupport} from '../test/component-test-support';
import {ConfigService} from '../service/config.service';
import {Config} from '../model/config';
import {TaskService} from '../service/task.service';

describe('TaskGroupsComponent', () => {
  let component: TaskGroupsComponent;
  let fixture: ComponentFixture<TaskGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: ComponentTestSupport.IMPORTS,
      declarations: ComponentTestSupport.DECLARATIONS,
      providers: [
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    const taskService = injector.get(TaskService);
    spyOn(taskService, 'getTaskCount').and.returnValue(of(3));

    fixture = TestBed.createComponent(TaskGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change selected task group on list item click', () => {
    component.onListItemClick(TaskGroup.TOMORROW);
    expect(component.isTaskGroupSelected(TaskGroup.TOMORROW)).toBeTruthy();
  });

  it('should render task counters for groups of tasks', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const badgeSpan = fixture.debugElement.query(By.css('.mat-list .mat-list-item span.mat-badge'));
      expect(badgeSpan).toBeTruthy();
    });
  });
});
