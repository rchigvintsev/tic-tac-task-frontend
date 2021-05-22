import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {EMPTY, of, Subject} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../../test/test-support';
import {SidenavMenuComponent} from './sidenav-menu.component';
import {TaskGroupService} from '../../../service/task-group.service';
import {TaskService} from '../../../service/task.service';
import {ConfigService} from '../../../service/config.service';
import {TagService} from '../../../service/tag.service';
import {TaskListService} from '../../../service/task-list.service';
import {TaskGroup} from '../../../model/task-group';
import {Config} from '../../../model/config';
import {HTTP_RESPONSE_HANDLER} from '../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../handler/default-http-response.handler';

describe('SidenavMenuComponent', () => {
  let component: SidenavMenuComponent;
  let fixture: ComponentFixture<SidenavMenuComponent>;
  let routerEvents: Subject<RouterEvent>;
  let taskService: TaskService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';

    const configService = injector.inject(ConfigService);
    configService.setConfig(new Config());

    taskService = injector.inject(TaskService);
    spyOn(taskService, 'getTaskCount').and.returnValue(of(3));
    spyOn(taskService, 'resetTaskCounters').and.stub();

    const taskGroupService = injector.inject(TaskGroupService);
    spyOn(taskGroupService, 'notifyTaskGroupSelected').and.stub();

    const tagService = injector.inject(TagService);
    spyOn(tagService, 'getTags').and.returnValue(EMPTY);

    const taskListService = injector.inject(TaskListService);
    spyOn(taskListService, 'getUncompletedTaskLists').and.returnValue(EMPTY);

    routerEvents = new Subject();
    const router = injector.inject(Router);
    (router as any).events = routerEvents.asObservable();

    fixture = TestBed.createComponent(SidenavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change selected task group on list item click', () => {
    component.onListItemClick(TaskGroup.TOMORROW);
    const taskGroupService = getTestBed().inject(TaskGroupService);
    expect(taskGroupService.notifyTaskGroupSelected).toHaveBeenCalledWith(TaskGroup.TOMORROW);
  });

  it('should render task counters for groups of tasks', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const badgeSpan = fixture.debugElement.query(By.css('.mat-list .mat-list-item span.mat-badge'));
    expect(badgeSpan).toBeTruthy();
  });

  it('should highlight selected menu item', async () => {
    routerEvents.next(new NavigationEnd(1, '/en/task#all', null));
    await fixture.whenStable();
    fixture.detectChanges();
    const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item.selected[href="/en/task#all"]'));
    expect(selectedItem).toBeTruthy();
  });

  it('should reset task counters on destroy', () => {
    component.ngOnDestroy();
    expect(taskService.resetTaskCounters).toHaveBeenCalled();
  });
});
