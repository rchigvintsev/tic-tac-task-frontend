import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';

import {of} from 'rxjs';

import {TestSupport} from '../test/test-support';
import {TasksByTagComponent} from './tasks-by-tag.component';
import {ConfigService} from '../service/config.service';
import {TaskService} from '../service/task.service';
import {PageRequest} from '../service/page-request';
import {TagService} from '../service/tag.service';
import {Tag} from '../model/tag';
import any = jasmine.any;

describe('TasksByTagComponent', () => {
  let component: TasksByTagComponent;
  let fixture: ComponentFixture<TasksByTagComponent>;
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

    const tag = new Tag('Test tag');
    tag.id = 1;

    const tagService = injector.get(TagService);
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
});
