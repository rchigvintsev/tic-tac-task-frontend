import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {TagService} from './tag.service';
import {Tag} from '../model/tag';
import {TestSupport} from '../test/test-support';
import {ConfigService} from './config.service';

describe('TagService', () => {
  let httpMock: HttpTestingController;
  let tagService: TagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    });
    const injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    tagService = injector.get(TagService);
  });

  it('should be created', () => {
    const service: TagService = TestBed.get(TagService);
    expect(service).toBeTruthy();
  });

  it('should return all tags', () => {
    const testTags = [];
    testTags.push(new Tag().deserialize({id: 1, name: 'Tag 1'}));
    testTags.push(new Tag().deserialize({id: 2, name: 'Tag 2'}));

    const subscription = tagService.getTags().subscribe(tags => {
      expect(tags.length).toBe(2);
      expect(tags).toEqual(testTags);
    });

    const request = httpMock.expectOne(`${tagService.baseUrl}`);
    expect(request.request.method).toBe('GET');
    request.flush(testTags.map(tag => tag.serialize()));

    return subscription;
  });

  it('should return tag by id', () => {
    const testTag = new Tag().deserialize({id: 1, name: 'Test tag'});
    const subscription = tagService.getTag(testTag.id).subscribe(tag => {
      expect(tag).toEqual(testTag);
    });

    const tagRequest = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(tagRequest.request.method).toBe('GET');
    tagRequest.flush(testTag.serialize());

    return subscription;
  });

  it('should update tag', () => {
    const testTag = new Tag().deserialize({id: 1, name: 'Updated test tag'});
    tagService.updateTag(testTag).subscribe(tag => {
      expect(tag).toEqual(testTag);
    });

    const request = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(testTag.serialize());
  });

  it('should delete tag', () => {
    const testTag = new Tag().deserialize({id: 1});
    tagService.deleteTag(testTag).subscribe(() => {});
    const request = httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('should notify about deleted tag', done => {
    const testTag = new Tag().deserialize({id: 1});
    tagService.getDeletedTag().subscribe(tag => {
      expect(tag).toEqual(testTag);
      done();
    });
    tagService.deleteTag(testTag).subscribe(() => {});
    httpMock.expectOne(`${tagService.baseUrl}/${testTag.id}`).flush(null);
  });
});
