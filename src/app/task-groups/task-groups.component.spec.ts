import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {TaskGroupsComponent} from './task-groups.component';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TranslateHttpLoaderFactory} from '../app.module';

describe('TaskGroupsComponent', () => {
  let component: TaskGroupsComponent;
  let fixture: ComponentFixture<TaskGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatDividerModule,
        MatListModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [TaskGroupsComponent],
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
