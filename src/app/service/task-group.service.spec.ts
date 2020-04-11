import {TestBed} from '@angular/core/testing';

import {TaskGroupService} from './task-group.service';

describe('TaskGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: TaskGroupService, useValue: new TaskGroupService()}]
    });
  });

  it('should be created', () => {
    const service: TaskGroupService = TestBed.get(TaskGroupService);
    expect(service).toBeTruthy();
  });
});
