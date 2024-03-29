import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {SidenavTaskTagsComponent} from './sidenav-task-tags.component';
import {TestSupport} from '../../../../test/test-support';
import {ConfigService} from '../../../../service/config.service';
import {TaskTagService} from '../../../../service/task-tag.service';
import {TaskTag} from '../../../../model/task-tag';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';

describe('SidenavTaskTagsComponent', () => {
  let component: SidenavTaskTagsComponent;
  let fixture: ComponentFixture<SidenavTaskTagsComponent>;
  let tagService: TaskTagService;
  let createdTagSource: Subject<TaskTag>;
  let updatedTagSource: Subject<TaskTag>;
  let deletedTagSource: Subject<TaskTag>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavTaskTagsComponent);
    const injector = getTestBed();

    tagService = injector.inject(TaskTagService);
    const tags = [];
    for (let i = 0; i < 3; i++) {
      tags.push(new TaskTag().deserialize({id: i + 1, name: `Test tag ${i + 1}`}));
    }
    spyOn(tagService, 'getTags').and.returnValue(of(tags));
    spyOn(tagService, 'createTag').and.callFake(tag => {
      const createdTag = tag.clone();
      createdTagSource.next(createdTag);
      return of(createdTag);
    });

    createdTagSource = new Subject<TaskTag>();
    spyOn(tagService, 'getCreatedTag').and.returnValue(createdTagSource.asObservable());
    updatedTagSource = new Subject<TaskTag>();
    spyOn(tagService, 'getUpdatedTag').and.returnValue(updatedTagSource.asObservable());
    deletedTagSource = new Subject<TaskTag>();
    spyOn(tagService, 'getDeletedTag').and.returnValue(deletedTagSource.asObservable());

    routerEvents = new Subject();
    const router = injector.inject(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', async () => {
    routerEvents.next(new NavigationEnd(1, '/en/tag/1', null));
    await fixture.whenStable();
    fixture.detectChanges();
    const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item.selected.tag-1'));
    expect(selectedItem).toBeTruthy();
  });

  it('should update tag list on tag create', async () => {
    await fixture.whenStable();
    const newTag = new TaskTag('New tag');
    createdTagSource.next(newTag);
    fixture.detectChanges();
    expect(component.tags.length).toBe(4);
    expect(component.tags[0]).toEqual(newTag);
  });

  it('should update tag list on tag update', async () => {
    await fixture.whenStable();
    const updatedTag = new TaskTag().deserialize({id: 1, name: 'Updated tag'});
    updatedTagSource.next(updatedTag);
    fixture.detectChanges();
    expect(component.tags[0].name).toEqual(updatedTag.name);
  });

  it('should update tag list on tag delete', async () => {
    await fixture.whenStable();
    const deletedTag = new TaskTag().deserialize({id: 1});
    deletedTagSource.next(deletedTag);
    fixture.detectChanges();
    expect(component.tags.length).toBe(2);
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

  it('should create tag', async () => {
    const tagName = 'New tag';
    await fixture.whenStable();
    component.tagFormModel.name = tagName;
    component.onTagFormSubmit();
    fixture.detectChanges();
    expect(tagService.createTag).toHaveBeenCalled();
    expect(component.tags.length).toBe(4);
    expect(component.tags[0].name).toEqual(tagName);
  });

  it('should not create tag with blank name', async () => {
    await fixture.whenStable();
    component.tagFormModel.name = ' ';
    component.onTagFormSubmit();
    fixture.detectChanges();
    expect(tagService.createTag).not.toHaveBeenCalled();
  });
});
