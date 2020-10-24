import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';

import {of} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../test/test-support';
import {TasksByTagComponent} from './tasks-by-tag.component';
import {ConfigService} from '../../service/config.service';
import {TaskService} from '../../service/task.service';
import {PageRequest} from '../../service/page-request';
import {TagService} from '../../service/tag.service';
import {TaskGroup} from '../../service/task-group';
import {Tag} from '../../model/tag';
import {HttpTestingController} from '@angular/common/http/testing';
import any = jasmine.any;

const CURRENT_LANG = 'en';

describe('TasksByTagComponent', () => {
  const tag = new Tag().deserialize({id: 1, name: 'Test tag'});

  let fixture: ComponentFixture<TasksByTagComponent>;
  let component: TasksByTagComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let tagService: TagService;
  let taskService: TaskService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: ActivatedRoute, useValue: {params: of([{id: 1}])}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksByTagComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    httpMock = injector.get(HttpTestingController);

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    tagService = injector.get(TagService);
    spyOn(tagService, 'getTag').and.returnValue(of(tag));

    taskService = injector.get(TaskService);
    spyOn(taskService, 'getTasksByTag').and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load next task page on task list scroll', () => {
    fixture.whenStable().then(() => {
      component.onTaskListScroll();
      expect(taskService.getTasksByTag).toHaveBeenCalledWith(any(Tag), new PageRequest(1));
    });
  });

  it('should navigate to tasks-for-today page when current tag is deleted', () => {
    tagService.deleteTag(tag).subscribe(() => {});
    httpMock.expectOne(`${tagService.baseUrl}/${tag.id}`).flush(null);
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });
});
