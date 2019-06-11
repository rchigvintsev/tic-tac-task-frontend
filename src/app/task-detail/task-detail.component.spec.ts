import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {of} from 'rxjs';

import * as moment from 'moment';

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
    const oneDayAgo = moment().utc().subtract(1, 'days');
    const comment = new TaskComment().deserialize({
      id: 1,
      commentText: 'Test comment',
      createdAt: oneDayAgo.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    });
    spyOn(taskCommentService, 'getCommentsForTaskId').and.returnValue(of([comment]));
    spyOn(taskCommentService, 'createComment').and.callFake(c => {
      const result = new TaskComment().deserialize(c);
      result.id = 2;
      return of(result);
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin title editing on title span click', () => {
    fixture.whenStable().then(() => {
      component.onTitleTextClick();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input blur', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should hide title text element on click', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title span');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form on title text element click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title span'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task on title input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.saveTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.saveTask).not.toHaveBeenCalled();
    });
  });

  it('should save task on description input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.saveTask).toHaveBeenCalled();
    });
  });

  it('should enable comment form when comment text is not blank', () => {
    fixture.whenStable().then(() => {
      component.commentFormModel.commentText = 'New comment';
      component.onCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.commentFormEnabled).toBeTruthy();
    });
  });

  it('should disable comment form when comment text is blank', () => {
    fixture.whenStable().then(() => {
      component.commentFormModel.commentText = ' ';
      component.onCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.commentFormEnabled).toBeFalsy();
    });
  });

  it('should create comment', () => {
    const taskCommentService = fixture.debugElement.injector.get(TaskCommentService);
    fixture.whenStable().then(() => {
      component.commentFormModel.commentText = 'New comment';
      component.onCommentFormSubmit();
      fixture.detectChanges();
      expect(taskCommentService.createComment).toHaveBeenCalled();
    });
  });

  it('should place new comment at top of comment list', () => {
    const commentText = 'New comment';
    fixture.whenStable().then(() => {
      component.commentFormModel.commentText = commentText;
      component.onCommentFormSubmit();
      expect(component.comments.length).toBe(2);
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should not create comment with blank comment text', () => {
    const taskCommentService = fixture.debugElement.injector.get(TaskCommentService);
    fixture.whenStable().then(() => {
      component.commentFormModel.commentText = ' ';
      component.onCommentFormSubmit();
      fixture.detectChanges();
      expect(taskCommentService.createComment).not.toHaveBeenCalled();
    });
  });

  it('should render relative comment date in Russian', () => {
    fixture.whenStable().then(() => {
      const relativeDate = component.getRelativeCommentDate(component.comments[0]);
      expect(relativeDate).toEqual('день назад');
    });
  });
});
