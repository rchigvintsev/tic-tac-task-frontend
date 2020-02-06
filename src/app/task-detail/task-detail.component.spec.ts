import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {of} from 'rxjs';

import * as moment from 'moment';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {TaskDetailComponent} from './task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {ConfigService} from '../service/config.service';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        NgxMatDatetimePickerModule
      ],
      declarations: [SigninComponent, DashboardComponent, TaskDetailComponent, NotFoundComponent, DummyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailComponent);

    const taskService = fixture.debugElement.injector.get(TaskService);
    const task = new Task().deserialize({
      id: 1,
      title: 'Test task',
      description: 'Test description',
      completed: false
    });
    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'updateTask').and.callFake(t => of(t));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin title editing on title span click', () => {
    fixture.whenStable().then(() => {
      component.onTitleTextClick();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input blur', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should hide title text element on click', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title span');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form on title text element click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title span'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task on title input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).not.toHaveBeenCalled();
    });
  });

  it('should save task on description input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on deadline date input change', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should close deadline date picker on mouse down outside date picker', () => {
    spyOn(component.deadlinePickerElement, 'close').and.callThrough();
    component.deadlinePickerElement.open();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.onMouseDown({target: fixture.debugElement.nativeElement});
      expect(component.deadlinePickerElement.close).toHaveBeenCalled();
    });
  });

  it('should not close deadline date picker on mouse down on date picker itself', () => {
    spyOn(component.deadlinePickerElement, 'close').and.callThrough();
    component.deadlinePickerElement.open();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const datePickerContent = fixture.debugElement.query(By.css('ngx-mat-datetime-content'));
      component.onMouseDown({target: datePickerContent.nativeElement});
      expect(component.deadlinePickerElement.close).not.toHaveBeenCalled();
    });
  });
});
