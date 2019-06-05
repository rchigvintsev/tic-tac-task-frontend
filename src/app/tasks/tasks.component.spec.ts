import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

import {of} from 'rxjs';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {TasksComponent} from './tasks.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TaskService} from '../service/task.service';
import {Task} from '../model/task';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let tasks: Array<Task>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [DashboardComponent, TasksComponent, TaskDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksComponent);

    tasks = [];
    tasks.push(new Task().deserialize({id: 1, title: 'Task 1', completed: false}));
    tasks.push(new Task().deserialize({id: 2, title: 'Task 2', completed: false}));

    const taskService = fixture.debugElement.injector.get(TaskService);
    spyOn(taskService, 'getTasks').and.returnValue(of(tasks));
    spyOn(taskService, 'saveTask').and.callFake(task => of(new Task().deserialize(task)));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.tasks.length).toEqual(tasks.length);
  });

  it('should create task', () => {
    const taskTitle = 'New task';
    fixture.whenStable().then(() => {
      component.formModel.title = taskTitle;
      component.onTaskFormSubmit();
      fixture.detectChanges();
      expect(component.tasks.length).toEqual(3);
      expect(component.tasks[2].title).toEqual(taskTitle);
    });
  });

  it('should not create task with blank title', () => {
    fixture.whenStable().then(() => {
      component.formModel.title = ' ';
      component.onTaskFormSubmit();
      fixture.detectChanges();
      expect(component.tasks.length).toEqual(2);
    });
  });

  it('should complete task', () => {
    const task1 = tasks[0];
    const task2 = tasks[1];

    const task1Copy = new Task().deserialize(task1);

    fixture.whenStable().then(() => {
      component.onTaskCompleteCheckboxChange(task1Copy);
      fixture.detectChanges();
      expect(task1Copy.completed).toBeTruthy();
      expect(component.tasks.length).toEqual(1);
      expect(component.tasks[0].id).toEqual(task2.id);
    });
  });
});
