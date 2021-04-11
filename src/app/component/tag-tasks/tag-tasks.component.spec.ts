import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';

import {of, throwError} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TagTasksComponent} from './tag-tasks.component';
import {ProgressSpinnerService} from '../../service/progress-spinner.service';
import {ConfigService} from '../../service/config.service';
import {PageRequest} from '../../service/page-request';
import {TagService} from '../../service/tag.service';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: ActivatedRoute, useValue: {params: of([{id: 1}])}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTasksComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    tagService = injector.get(TagService);
    spyOn(tagService, 'getTag').and.returnValue(of(tag));
    spyOn(tagService, 'getUncompletedTasks').and.returnValue(of([]));
    spyOn(tagService, 'updateTag').and.callFake(t => of(t));
    spyOn(tagService, 'deleteTag').and.returnValue(of(true));

    const progressSpinnerService = injector.get(ProgressSpinnerService);
    spyOn(progressSpinnerService, 'showUntilExecuted').and.callFake((observable, onSuccess, onError) => {
      observable.subscribe(onSuccess, onError);
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load next task page on task list scroll', () => {
    fixture.whenStable().then(() => {
      component.onTaskListScroll();
      expect(tagService.getUncompletedTasks).toHaveBeenCalledWith(any(Number), new PageRequest(1));
    });
  });

  it('should undo changes in title on title input escape keydown', () => {
    fixture.whenStable().then(() => {
      component.title = 'New name';
      component.onTitleInputEscapeKeydown();
      fixture.detectChanges();
      expect(component.title).toEqual(tag.name);
    });
  });

  it('should save tag on title input blur', () => {
    fixture.whenStable().then(() => {
      component.title = 'New name';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(tagService.updateTag).toHaveBeenCalled();
    });
  });

  it('should not save tag with blank name', () => {
    fixture.whenStable().then(() => {
      component.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(tagService.updateTag).not.toHaveBeenCalled();
    });
  });

  it('should save tag on tag color change', () => {
    fixture.whenStable().then(() => {
      component.onChangeColorButtonClick();
      fixture.detectChanges();
      expect(tagService.updateTag).toHaveBeenCalled();
    });
  });

  it('should delete tag', () => {
    fixture.whenStable().then(() => {
      component.onDeleteTagButtonClick();
      fixture.detectChanges();
      expect(tagService.deleteTag).toHaveBeenCalled();
    });
  });

  it('should navigate to "tasks-for-today" page on tag delete', () => {
    fixture.whenStable().then(() => {
      component.onDeleteTagButtonClick();
      expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
    });
  });

  it('should navigate to "not-found" error page when tag is not found', () => {
    tagService.getTag = jasmine.createSpy('getTag').and.callFake(() => throwError({status: 404}));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
    });
  });
});
