import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {of} from 'rxjs';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {TaskDetailComponent} from './task-detail.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {Task} from '../model/task';
import {TaskComment} from '../model/task-comment';
import {TaskService} from '../service/task.service';
import {TaskCommentService} from '../service/task-comment.service';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

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
      declarations: [DashboardComponent, TaskDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailComponent);

    const taskService = fixture.debugElement.injector.get(TaskService);
    const task = new Task().deserialize({
      id: 1,
      title: 'Test task',
      description: 'Test description',
      completed: false
    });
    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'saveTask').and.callFake(t => of(t));

    const taskCommentService = fixture.debugElement.injector.get(TaskCommentService);
    const comment = new TaskComment().deserialize({
      id: 1,
      commentText: 'Test comment',
      createdAt: '2019-05-26T23:07:15.154827'
    });
    spyOn(taskCommentService, 'getCommentsForTaskId').and.returnValue(of([comment]));
    spyOn(taskCommentService, 'createComment').and.callFake(c => {
      c.id = 2;
      return of(c);
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin title editing on title span click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title span'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input blur', () => {
    component.titleEditing = true;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.titleElement.nativeElement.dispatchEvent(new Event('blur'));
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should hide title span when title editing is begun', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title span');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form when title editing is begun', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title span'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task when title is changed', () => {
    component.taskFormModel.title = 'New task';
    component.saveTask();
    const taskService = fixture.debugElement.injector.get(TaskService);
    expect(taskService.saveTask).toHaveBeenCalled();
  });

  it('should not save task with blank title', () => {
    component.taskFormModel.title = ' ';
    component.saveTask();
    const taskService = fixture.debugElement.injector.get(TaskService);
    expect(taskService.saveTask).not.toHaveBeenCalled();
  });

  it('should create comment', () => {
    component.commentFormModel.commentText = 'New comment';
    component.createComment();
    const taskCommentService = fixture.debugElement.injector.get(TaskCommentService);
    expect(taskCommentService.createComment).toHaveBeenCalled();
  });

  it('should not create comment with blank comment text', () => {
    component.commentFormModel.commentText = ' ';
    component.createComment();
    const taskCommentService = fixture.debugElement.injector.get(TaskCommentService);
    expect(taskCommentService.createComment).not.toHaveBeenCalled();
  });
});
