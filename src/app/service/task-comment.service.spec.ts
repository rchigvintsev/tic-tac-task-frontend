import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import * as moment from 'moment';

import {TaskCommentService} from './task-comment.service';
import {TaskComment} from '../model/task-comment';

const DATE_FORMAT = moment.HTML5_FMT.DATETIME_LOCAL_MS;

describe('TaskCommentService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let taskCommentService: TaskCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    taskCommentService = injector.get(TaskCommentService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(taskCommentService).toBeTruthy();
  });

  it('should return comments for task id', () => {
    const taskId = 1;
    const testComments = [];

    testComments.push(new TaskComment().deserialize({
      id: 2,
      taskId,
      commentText: 'Comment 1',
      createdAt: moment().utc().subtract(1, 'hours').format(DATE_FORMAT),
      updatedAt: moment().utc().format(DATE_FORMAT)
    }));

    testComments.push(new TaskComment().deserialize({
      id: 1,
      taskId,
      commentText: 'Comment 2',
      createdAt: moment().utc().subtract({days: 1, hours: 1}).format(DATE_FORMAT),
      updatedAt: moment().utc().subtract(1, 'days').format(DATE_FORMAT)
    }));

    taskCommentService.getCommentsForTaskId(taskId).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments).toEqual(testComments);
    });

    const request = httpMock.expectOne(`${taskCommentService.taskCommentUrl}?taskId=${taskId}`);
    expect(request.request.method).toBe('GET');
    request.flush(testComments);
  });

  it('should save comment', () => {
    const testComment = new TaskComment().deserialize({
      commentText: 'Test comment',
      createdAt: moment().utc().format(DATE_FORMAT)
    });

    taskCommentService.saveComment(testComment).subscribe(comment => {
      expect(comment).toEqual(testComment);
    });

    const request = httpMock.expectOne(taskCommentService.taskCommentUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testComment);
  });

  it('should delete comment', () => {
    const testComment = new TaskComment().deserialize({id: 1});
    taskCommentService.deleteComment(testComment).subscribe(() => {});
    const request = httpMock.expectOne(`${taskCommentService.taskCommentUrl}/${testComment.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
