import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {of, Subject} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {SidenavMenuComponent} from './sidenav-menu.component';
import {TaskGroup} from '../../service/task-group';
import {TaskGroupService} from '../../service/task-group.service';
import {TestSupport} from '../../test/test-support';
import {ConfigService} from '../../service/config.service';
import {Config} from '../../model/config';
import {TaskService} from '../../service/task.service';

describe('SidenavMenuComponent', () => {
  let component: SidenavMenuComponent;
  let fixture: ComponentFixture<SidenavMenuComponent>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    const taskService = injector.get(TaskService);
    spyOn(taskService, 'getTaskCount').and.returnValue(of(3));

    const taskGroupService = injector.get(TaskGroupService);
    spyOn(taskGroupService, 'notifyTaskGroupSelected').and.stub();

    routerEvents = new Subject();
    const router = injector.get(Router);
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
    const taskGroupService = getTestBed().get(TaskGroupService);
    expect(taskGroupService.notifyTaskGroupSelected).toHaveBeenCalledWith(TaskGroup.TOMORROW);
  });

  it('should render task counters for groups of tasks', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const badgeSpan = fixture.debugElement.query(By.css('.mat-list .mat-list-item span.mat-badge'));
      expect(badgeSpan).toBeTruthy();
    });
  });

  it('should highlight selected menu item', () => {
    routerEvents.next(new NavigationEnd(1, '/en/task#all', null));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item-selected[href="/en/task#all"]'));
      expect(selectedItem).toBeTruthy();
    });
  });
});
