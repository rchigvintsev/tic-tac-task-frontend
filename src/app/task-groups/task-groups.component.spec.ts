import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TaskGroupsComponent} from './task-groups.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {ComponentTestSupport} from '../test/component-test-support';

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
});
