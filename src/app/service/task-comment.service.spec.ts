import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {TestSupport} from '../test/test-support';
import {TaskCommentService} from './task-comment.service';
import {ConfigService} from './config.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {TaskComment} from '../model/task-comment';

describe('TaskCommentService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let taskCommentService: TaskCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    });

    injector = getTestBed();

    const loadingIndicatorService = injector.get(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    httpMock = injector.get(HttpTestingController);
    taskCommentService = injector.get(TaskCommentService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(taskCommentService).toBeTruthy();
  });

  it('should update comment', () => {
    const testComment = new TaskComment().deserialize({
      id: 1,
      commentText: 'Updated test comment'
    });
    taskCommentService.updateComment(testComment).subscribe(comment => {
      expect(comment).toEqual(testComment);
    });

    const request = httpMock.expectOne(`${taskCommentService.baseUrl}/${testComment.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testComment);
  });

  it('should delete comment', () => {
    const testComment = new TaskComment().deserialize({id: 1});
    taskCommentService.deleteComment(testComment).subscribe(() => {});
    const request = httpMock.expectOne(`${taskCommentService.baseUrl}/${testComment.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
