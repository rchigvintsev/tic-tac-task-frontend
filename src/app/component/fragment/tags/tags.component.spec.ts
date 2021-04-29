import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {TagsComponent} from './tags.component';
import {TestSupport} from '../../../test/test-support';
import {ConfigService} from '../../../service/config.service';
import {TagService} from '../../../service/tag.service';
import {Tag} from '../../../model/tag';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let tagService: TagService;
  let createdTagSource: Subject<Tag>;
  let updatedTagSource: Subject<Tag>;
  let deletedTagSource: Subject<Tag>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);
    const injector = getTestBed();

    tagService = injector.get(TagService);
    const tags = [];
    for (let i = 0; i < 3; i++) {
      tags.push(new Tag().deserialize({id: i + 1, name: `Test tag ${i + 1}`}));
    }
    spyOn(tagService, 'getTags').and.returnValue(of(tags));
    spyOn(tagService, 'createTag').and.callFake(tag => {
      const createdTag = tag.clone();
      createdTagSource.next(createdTag);
      return of(createdTag);
    });

    createdTagSource = new Subject<Tag>();
    spyOn(tagService, 'getCreatedTag').and.returnValue(createdTagSource.asObservable());
    updatedTagSource = new Subject<Tag>();
    spyOn(tagService, 'getUpdatedTag').and.returnValue(updatedTagSource.asObservable());
    deletedTagSource = new Subject<Tag>();
    spyOn(tagService, 'getDeletedTag').and.returnValue(deletedTagSource.asObservable());

    routerEvents = new Subject();
    const router = injector.get(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', () => {
    routerEvents.next(new NavigationEnd(1, '/en/tag/1', null));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item-selected.tag-1'));
      expect(selectedItem).toBeTruthy();
    });
  });

  it('should update tag list on tag create', () => {
    fixture.whenStable().then(() => {
      const newTag = new Tag('New tag');
      createdTagSource.next(newTag);
      fixture.detectChanges();
      expect(component.tags.length).toBe(4);
      expect(component.tags[3]).toEqual(newTag);
    });
  });

  it('should update tag list on tag update', () => {
    fixture.whenStable().then(() => {
      const updatedTag = new Tag().deserialize({id: 1, name: 'Updated tag'});
      updatedTagSource.next(updatedTag);
      fixture.detectChanges();
      expect(component.tags[0].name).toEqual(updatedTag.name);
    });
  });

  it('should update tag list on tag delete', () => {
    fixture.whenStable().then(() => {
      const deletedTag = new Tag().deserialize({id: 1});
      deletedTagSource.next(deletedTag);
      fixture.detectChanges();
      expect(component.tags.length).toBe(2);
    });
  });

  it('should enable tag form submit button when tag name is not blank', () => {
    component.tagFormModel.name = 'New tag';
    component.onTagFormModelChange();
    expect(component.tagFormSubmitEnabled).toBeTruthy();
  });

  it('should disable tag form submit button when tag name is blank', () => {
    component.tagFormModel.name = ' ';
    component.onTagFormModelChange();
    expect(component.tagFormSubmitEnabled).toBeFalsy();
  });

  it('should create tag', () => {
    const tagName = 'New tag';
    fixture.whenStable().then(() => {
      component.tagFormModel.name = tagName;
      component.onTagFormSubmit();
      fixture.detectChanges();
      expect(tagService.createTag).toHaveBeenCalled();
      expect(component.tags.length).toBe(4);
      expect(component.tags[3].name).toEqual(tagName);
    });
  });

  it('should not create tag with blank name', () => {
    fixture.whenStable().then(() => {
      component.tagFormModel.name = ' ';
      component.onTagFormSubmit();
      fixture.detectChanges();
      expect(tagService.createTag).not.toHaveBeenCalled();
    });
  });
});
