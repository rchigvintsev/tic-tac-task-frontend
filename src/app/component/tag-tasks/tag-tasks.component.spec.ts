import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TagTasksComponent} from './tag-tasks.component';
import {ConfigService} from '../../service/config.service';
import {PageRequest} from '../../service/page-request';
import {TagService} from '../../service/tag.service';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {ResourceNotFoundError} from '../../error/resource-not-found.error';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';
import any = jasmine.any;

const CURRENT_LANG = 'en';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({result: true})
    };
  }
}

describe('TagTasksComponent', () => {
  const tag = new Tag().deserialize({id: 1, name: 'Test tag'});

  let fixture: ComponentFixture<TagTasksComponent>;
  let component: TagTasksComponent;
  let router: Router;
  let tagService: TagService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: ActivatedRoute, useValue: {params: of([{id: 1}])}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTasksComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.inject(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    tagService = injector.inject(TagService);
    spyOn(tagService, 'getTag').and.returnValue(of(tag));
    spyOn(tagService, 'getUncompletedTasks').and.returnValue(of([]));
    spyOn(tagService, 'updateTag').and.callFake(t => of(t));
    spyOn(tagService, 'deleteTag').and.returnValue(of(true));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load next task page on task list scroll', async () => {
    await fixture.whenStable();
    component.onTaskListScroll();
    expect(tagService.getUncompletedTasks).toHaveBeenCalledWith(any(Number), new PageRequest(1), false);
  });

  it('should undo changes in title on title input escape keydown', async () => {
    await fixture.whenStable();
    component.title = 'New name';
    component.onTitleInputEscapeKeydown();
    fixture.detectChanges();
    expect(component.title).toEqual(tag.name);
  });

  it('should save tag on title input blur', async () => {
    await fixture.whenStable();
    component.title = 'New name';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(tagService.updateTag).toHaveBeenCalled();
  });

  it('should not save tag on title input blur when tag name is not changed', async () => {
    await fixture.whenStable();
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(tagService.updateTag).not.toHaveBeenCalled();
  });

  it('should not save tag with blank name', async () => {
    await fixture.whenStable();
    component.title = ' ';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(tagService.updateTag).not.toHaveBeenCalled();
  });

  it('should save tag on tag color change', async () => {
    await fixture.whenStable();
    component.onChangeColorButtonClick();
    fixture.detectChanges();
    expect(tagService.updateTag).toHaveBeenCalled();
  });

  it('should delete tag', async () => {
    await fixture.whenStable();
    component.onDeleteTagButtonClick();
    fixture.detectChanges();
    expect(tagService.deleteTag).toHaveBeenCalled();
  });

  it('should navigate to "tasks-for-today" page on tag delete', async () => {
    await fixture.whenStable();
    component.onDeleteTagButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });

  it('should navigate to "not-found" error page when tag is not found', async () => {
    tagService.getTag = jasmine.createSpy('getTag').and.callFake(() => {
      return throwError(ResourceNotFoundError.fromResponse({url: `/tag/${tag.id}`}));
    });
    component.ngOnInit();
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
  });
});
