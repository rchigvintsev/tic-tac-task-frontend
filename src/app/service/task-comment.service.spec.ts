import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import {TaskCommentService} from './task-comment.service';

describe('TaskCommentService', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [HttpClientTestingModule]}));

  it('should be created', () => {
    const service: TaskCommentService = TestBed.get(TaskCommentService);
    expect(service).toBeTruthy();
  });
});
