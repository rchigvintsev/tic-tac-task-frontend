import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {of} from 'rxjs';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {TaskDetailComponent} from './task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {NotFoundComponent} from '../not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [SigninComponent, DashboardComponent, TaskDetailComponent, NotFoundComponent, DummyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
    spyOn(taskService, 'saveTask').and.callFake(t => of(t));

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
      expect(taskService.saveTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.saveTask).not.toHaveBeenCalled();
    });
  });

  it('should save task on description input blur', () => {
    const taskService = fixture.debugElement.injector.get(TaskService);
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.saveTask).toHaveBeenCalled();
    });
  });
});
