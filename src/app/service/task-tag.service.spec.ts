import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {TaskTagService} from './task-tag.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {TaskTag} from '../model/task-tag';
import {Task} from '../model/task';
import {TestSupport} from '../test/test-support';
import {ConfigService} from './config.service';

describe('TaskTagService', () => {
  let httpMock: HttpTestingController;
  let tagService: TaskTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}}]
    });

    const injector = getTestBed();

    const loadingIndicatorService = injector.inject(LoadingIndicatorService);
    spyOn(loadingIndicatorService, 'showUntilExecuted').and.callFake((observable) => observable);

    httpMock = injector.inject(HttpTestingController);
    tagService = injector.inject(TaskTagService);
  });

  it('should be created', () => {
    const service: TaskTagService = TestBed.inject(TaskTagService);
    expect(service).toBeTruthy();
  });

  it('should return all tags', done => {
    const testTags = [];
    testTags.push(new TaskTag().deserialize({id: 1, name: 'Tag 1'}));
    testTags.push(new TaskTag().deserialize({id: 2, name: 'Tag 2'}));

    tagService.getTags().subscribe(tags => {
      expect(tags.length).toBe(2);
      expect(tags).toEqual(testTags);
      done();
    });

    const request = httpMock.expectOne(tagService.baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush(testTags.map(tag => tag.serialize()));
  });

  it('should return tag by id', done => {
    const testTag = new TaskTag().deserialize({id: 1, name: 'Test tag'});
    tagService.getTag(testTag.id).subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });

    const tagRequest = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(tagRequest.request.method).toBe('GET');
    tagRequest.flush(testTag.serialize());
  });

  it('should create tag', done => {
    const newTag = new TaskTag().deserialize({name: 'New tag'});
    tagService.createTag(newTag).subscribe(tag => {
      expect(tag).toEqual(newTag);
      done();
    });

    const request = httpMock.expectOne(tagService.baseUrl);
    expect(request.request.method).toBe('POST');
    request.flush(newTag.serialize());
  });

  it('should notify about created tag', done => {
    const testTag = new TaskTag().deserialize({name: 'Test tag'});
    tagService.getCreatedTag().subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });
    tagService.createTag(testTag).subscribe(() => {});
    httpMock.expectOne(tagService.baseUrl).flush(testTag.serialize());
  });

  it('should throw error on tag create when tag is null', () => {
    expect(() => tagService.createTag(null)).toThrow(new Error('Tag must not be null or undefined'));
  });

  it('should update tag', done => {
    const testTag = new TaskTag().deserialize({id: 1, name: 'Updated test tag'});
    tagService.updateTag(testTag).subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });

    const request = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTag.serialize());
  });

  it('should notify about updated tag', done => {
    const testTag = new TaskTag().deserialize({id: 1, name: 'Test tag'});
    tagService.getUpdatedTag().subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });
    tagService.updateTag(testTag).subscribe(() => {});
    httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`).flush(testTag.serialize());
  });

  it('should throw error on tag update when tag is null', () => {
    expect(() => tagService.updateTag(null)).toThrow(new Error('Tag must not be null or undefined'));
  });

  it('should delete tag', done => {
    const testTag = new TaskTag().deserialize({id: 1});
    tagService.deleteTag(testTag).subscribe(() => done());
    const request = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('should notify about deleted tag', done => {
    const testTag = new TaskTag().deserialize({id: 1});
    tagService.getDeletedTag().subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });
    tagService.deleteTag(testTag).subscribe(() => {});
    httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`).flush(null);
  });

  it('should throw error on tag delete when tag is null', () => {
    expect(() => tagService.deleteTag(null)).toThrow(new Error('Tag must not be null or undefined'));
  });

  it('should return uncompleted tasks for tag', done => {
    const tagId = 3;

    const testTasks = [];
    testTasks.push(new Task().deserialize({id: 1, title: 'Task 1', status: 'PROCESSED'}));
    testTasks.push(new Task().deserialize({id: 2, title: 'Task 2', status: 'UNPROCESSED'}));

    tagService.getUncompletedTasks(tagId).subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(testTasks);
      done();
    });

    const request = httpMock.expectOne(`${tagService.baseUrl}/${tagId}/tasks/uncompleted?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(testTasks.map(task => task.serialize()));
  });
});
