import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {of} from 'rxjs';

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
    const testComments = [];

    testComments.push(new TaskComment().deserialize({
      id: 2,
      commentText: 'Comment 1',
      createdAt: moment().utc().subtract(1, 'hours').format(DATE_FORMAT),
      updatedAt: moment().utc().format(DATE_FORMAT)
    }));

    testComments.push(new TaskComment().deserialize({
      id: 1,
      commentText: 'Comment 2',
      createdAt: moment().utc().subtract({days: 1, hours: 1}).format(DATE_FORMAT),
      updatedAt: moment().utc().subtract(1, 'days').format(DATE_FORMAT)
    }));

    const taskId = 1;

    taskCommentService.getCommentsForTaskId(taskId).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments).toEqual(testComments);
    });

    const request = httpMock.expectOne(`${taskCommentService.taskCommentUrl}/search/findByTaskId?taskId=${taskId}`);
    expect(request.request.method).toBe('GET');
    request.flush({_embedded: {taskComments: testComments}});
  });

  it('should create comment', () => {
    const commentJson = {
      id: 1,
      commentText: 'Test comment',
      createdAt: moment()
        .utc()
        .format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    };
    const testComment = new TaskComment().deserialize(commentJson);
    const taskId = 1;

    spyOn(taskCommentService, 'saveComment').and.returnValue(of(commentJson));

    taskCommentService.createComment(testComment, taskId).subscribe(comment => {
      expect(comment).toEqual(testComment);
    });

    expect(taskCommentService.saveComment).toHaveBeenCalled();

    const request = httpMock.expectOne(`${taskCommentService.taskCommentUrl}/${testComment.id}/task`);
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('should save comment', () => {
    const testComment = new TaskComment().deserialize({
      commentText: 'Test comment',
      createdAt: moment()
        .utc()
        .format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    });

    taskCommentService.saveComment(testComment).subscribe(comment => {
      expect(comment).toEqual(testComment);
    });

    const request = httpMock.expectOne(taskCommentService.taskCommentUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testComment);
  });
});
