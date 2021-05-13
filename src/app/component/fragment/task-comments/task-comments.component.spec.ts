import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskCommentsComponent} from './task-comments.component';
import {TaskComment} from '../../../model/task-comment';
import {TaskService} from '../../../service/task.service';
import {TaskCommentService} from '../../../service/task-comment.service';
import {ConfigService} from '../../../service/config.service';
import {TestSupport} from '../../../test/test-support';
import {PageRequest} from '../../../service/page-request';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';
import any = jasmine.any;

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({result: true})
    };
  }
}

describe('TaskCommentsComponent', () => {
  let component: TaskCommentsComponent;
  let fixture: ComponentFixture<TaskCommentsComponent>;
  let taskService: TaskService;
  let taskCommentService: TaskCommentService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCommentsComponent);

    const injector = getTestBed();

    taskService = injector.get(TaskService);
    const comments = [];
    const createdAt = moment().utc().subtract(1, 'days').format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    for (let i = 0; i < 3; i++) {
      comments.push(new TaskComment().deserialize({id: i + 1, commentText: `Test comment ${i + 1}`, createdAt}));
    }
    comments[0].updatedAt = comments[0].createdAt;

    spyOn(taskService, 'getComments').and.returnValue(of(comments));
    spyOn(taskService, 'addComment').and.callFake((taskId, c) => {
      const comment = new TaskComment().deserialize(c);
      comment.id = 4;
      comment.taskId = taskId;
      return of(comment);
    });

    taskCommentService = injector.get(TaskCommentService);
    spyOn(taskCommentService, 'updateComment').and.callFake(c => of(new TaskComment().deserialize(c)));
    spyOn(taskCommentService, 'deleteComment').and.returnValue(of(null));

    const translate = injector.get(TranslateService);
    translate.currentLang = 'ru';

    moment.locale(translate.currentLang);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable new comment form when comment text is not blank', () => {
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = 'New comment';
      component.onNewCommentModelChange();
      fixture.detectChanges();
      expect(component.newCommentFormEnabled).toBeTruthy();
    });
  });

  it('should disable new comment form when comment text is blank', () => {
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = ' ';
      component.onNewCommentModelChange();
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
    fixture.whenStable().then(() => {
      component.newCommentFormModel.commentText = ' ';
      component.onNewCommentFormSubmit();
      fixture.detectChanges();
      expect(taskService.addComment).not.toHaveBeenCalled();
    });
  });

  it('should hide comment text element on edit comment button click', () => {
    const commentId = component.comments[0].id;
    const spanSelector = By.css('.comment-' + commentId + ' .comment-body .comment-text');
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
      component.onEditCommentModelChange();
      fixture.detectChanges();
      expect(component.editCommentFormEnabled).toBeTruthy();
    });
  });

  it('should disable edit comment form when comment text is blank', () => {
    fixture.whenStable().then(() => {
      component.onEditCommentButtonClick(component.comments[0]);
      component.editCommentFormModel.commentText = ' ';
      component.onEditCommentModelChange();
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

  it('should render annotation when comment was changed', () => {
    fixture.whenStable().then(() => {
      const commentId = component.comments[0].id;
      const selector = By.css('.comment-' + commentId + ' .comment-header .comment-date-annotation');
      const annotation = fixture.debugElement.query(selector);
      expect(annotation).toBeTruthy();
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

  it('should load next comment page on comment list scroll', () => {
    fixture.whenStable().then(() => {
      component.onCommentListScroll();
      expect(taskService.getComments).toHaveBeenCalledWith(any(Number), new PageRequest(1));
    });
  });
});
