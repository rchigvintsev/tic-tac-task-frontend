import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MatDialog, MatDialogModule} from '@angular/material';

import * as moment from 'moment';

import {of} from 'rxjs';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {LoginComponent} from '../login/login.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {TaskCommentsComponent} from './task-comments.component';
import {TaskComment} from '../model/task-comment';
import {TaskCommentService} from '../service/task-comment.service';
import {routes} from '../app-routing.module';
import {TranslateHttpLoaderFactory} from '../app.module';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('TaskCommentsComponent', () => {
  let component: TaskCommentsComponent;
  let fixture: ComponentFixture<TaskCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDialogModule,
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
      declarations: [LoginComponent, DashboardComponent, TaskDetailComponent, TaskCommentsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{provide: MatDialog, useClass: MatDialogMock}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCommentsComponent);

    const commentService = fixture.debugElement.injector.get(TaskCommentService);
    const createdAt = moment().utc().subtract(1, 'days').format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const comments = [];
    for (let i = 0; i < 3; i++) {
      comments.push(new TaskComment().deserialize({id: i + 1, commentText: `Test comment ${i + 1}`, createdAt}));
    }
    spyOn(commentService, 'getCommentsForTaskId').and.returnValue(of(comments));
    spyOn(commentService, 'saveComment').and.callFake(c => {
      const result = new TaskComment().deserialize(c);
      if (!c.id) {
        result.id = 4;
      }
      return of(result);
    });
    spyOn(commentService, 'deleteComment').and.returnValue(of(null));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable new comment form when comment text is not blank', () => {
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = 'New comment';
      component.onNewCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.newCommentFormEnabled).toBeTruthy();
    });
  });

  it('should disable new comment form when comment text is blank', () => {
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = ' ';
      component.onNewCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.newCommentFormEnabled).toBeFalsy();
    });
  });

  it('should create comment', () => {
    const commentText = 'New comment';
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = commentText;
      component.onNewCommentFormSubmit();
      fixture.detectChanges();
      expect(component.comments.length).toBe(4);
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should create comment on Ctrl + Enter', () => {
    const commentText = 'New comment';
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = commentText;
      component.onNewCommentInputKeyDown({ctrlKey: true, code: 'Enter'});
      fixture.detectChanges();
      expect(component.comments.length).toBe(4);
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should not create comment with blank comment text', () => {
    const commentService = fixture.debugElement.injector.get(TaskCommentService);
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = ' ';
      component.onNewCommentFormSubmit();
      fixture.detectChanges();
      expect(commentService.saveComment).not.toHaveBeenCalled();
    });
  });

  it('should hide comment text element on edit comment button click', () => {
    const commentId = component.comments[0].id;
    const spanSelector = By.css('.comment-' + commentId + ' .comment-body span');
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(spanSelector)).toBeFalsy();
    });
  });

  it('should show edit comment form on edit comment button click', () => {
    const commentId = component.comments[0].id;
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      fixture.detectChanges();
      const commentForm = fixture.debugElement.query(By.css('.comment-' + commentId + ' .comment-body form'));
      expect(commentForm).toBeTruthy();
    });
  });

  it('should enable edit comment form when comment text is not blank', () => {
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = 'Edited comment';
      component.onEditCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.editCommentFormEnabled).toBeTruthy();
    });
  });

  it('should disable edit comment form when comment text is blank', () => {
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = ' ';
      component.onEditCommentInputKeyUp();
      fixture.detectChanges();
      expect(component.editCommentFormEnabled).toBeFalsy();
    });
  });

  it('should edit comment', () => {
    const commentText = 'Edited comment';
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = commentText;
      component.onEditCommentFormSubmit();
      fixture.detectChanges();
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should not save edited comment with blank comment text', () => {
    const commentText = component.comments[0].commentText;
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = ' ';
      component.onEditCommentFormSubmit();
      fixture.detectChanges();
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should restore original comment text on cancel edit comment button click', () => {
    const commentText = component.comments[0].commentText;
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = 'Edited comment';
      component.onCancelEditCommentButtonClick();
      fixture.detectChanges();
      expect(component.comments[0].commentText).toEqual(commentText);
    });
  });

  it('should render relative comment date in Russian', () => {
    fixture.whenStable().then(() => {
      const relativeDate = component.getRelativeCommentDate(component.comments[0]);
      expect(relativeDate).toEqual('день назад');
    });
  });

  it('should delete comment', () => {
    fixture.whenStable().then(() => {
      const commentToDelete = component.comments[0];
      component.onDeleteCommentButtonClick(commentToDelete);
      fixture.detectChanges();
      expect(component.comments.length).toBe(2);
      expect(component.comments[0]).not.toEqual(commentToDelete);
    });
  });
});
