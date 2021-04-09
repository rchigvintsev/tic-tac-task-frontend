import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Router} from '@angular/router';

import {of, Subject, throwError} from 'rxjs';
import {skip} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskDetailsComponent} from './task-details.component';
import {Task} from '../../model/task';
import {Tag} from '../../model/tag';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {TaskListService} from '../../service/task-list.service';
import {ConfigService} from '../../service/config.service';
import {LogService} from '../../service/log.service';
import {TaskGroupService} from '../../service/task-group.service';
import {TaskGroup} from '../../model/task-group';
import {TestSupport} from '../../test/test-support';

const CURRENT_LANG = 'en';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({result: true})
    };
  }
}

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let router: Router;
  let taskService: TaskService;
  let tagService: TagService;
  let taskListService: TaskListService;
  let updatedTagSource: Subject<Tag>;
  let deletedTagSource: Subject<Tag>;
  let task: Task;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)},
        MatDatepickerModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsComponent);
    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    task = new Task().deserialize({
      id: 1,
      taskListId: 2,
      title: 'Test task',
      description: 'Test description',
      status: 'PROCESSED',
      deadline: moment().utc().subtract(1, 'month').format(moment.HTML5_FMT.DATETIME_LOCAL),
      deadlineTimeExplicitlySet: true
    });

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    taskService = injector.get(TaskService);
    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'updateTask').and.callFake(t => of(t));
    spyOn(taskService, 'updateTaskCounters').and.stub();
    spyOn(taskService, 'completeTask').and.returnValue(of(true));
    spyOn(taskService, 'deleteTask').and.returnValue(of(true));
    spyOn(taskService, 'getTags').and.returnValue(of([new Tag().deserialize({id: 2, name: 'Red', color: 0xff0000})]));
    spyOn(taskService, 'assignTag').and.returnValue(of());
    spyOn(taskService, 'removeTag').and.returnValue(of());

    updatedTagSource = new Subject<Tag>();
    deletedTagSource = new Subject<Tag>();

    tagService = injector.get(TagService);
    spyOn(tagService, 'getTags').and.returnValue(of([new Tag('Green'), new Tag('Blue')]));
    spyOn(tagService, 'createTag').and.callFake(t => of(t));
    spyOn(tagService, 'getUpdatedTag').and.returnValue(updatedTagSource.asObservable());
    spyOn(tagService, 'getDeletedTag').and.returnValue(deletedTagSource.asObservable());

    taskListService = injector.get(TaskListService);
    spyOn(taskListService, 'getUncompletedTaskLists').and.returnValue(of([]));
    spyOn(taskListService, 'addTask').and.returnValue(of(true));
    spyOn(taskListService, 'removeTask').and.returnValue(of(true));

    const logService = injector.get(LogService);
    spyOn(logService, 'error').and.callThrough();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to current task group on back button click', () => {
    component.onBackButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: component.selectedTaskGroup.value});
  });

  it('should begin title editing on title text click', () => {
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

  it('should end title editing on title input enter keydown', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputEnterKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should not end title editing on title input enter keydown when title is blank', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.taskFormModel.title = ' ';
      component.onTitleInputEnterKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeTruthy();
    });
  });

  it('should end title editing on title input escape keydown', () => {
    fixture.whenStable().then(() => {
      component.titleEditing = true;
      component.onTitleInputEscapeKeydown();
      fixture.detectChanges();
      expect(component.titleEditing).toBeFalsy();
    });
  });

  it('should undo changes in title on title input escape keydown', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputEscapeKeydown();
      fixture.detectChanges();
      expect(component.taskFormModel.title).toEqual(task.title);
    });
  });

  it('should hide title text element on click', () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title .title-text');
    let titleSpan = fixture.debugElement.query(spanSelector);
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      titleSpan = fixture.debugElement.query(spanSelector);
      expect(titleSpan).toBeFalsy();
    });
  });

  it('should show title form on title text element click', () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title .title-text'));
    fixture.whenStable().then(() => {
      titleSpan.nativeElement.click();
      fixture.detectChanges();
      const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
      expect(titleForm).toBeTruthy();
    });
  });

  it('should save task on title input blur', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should not save task with blank title', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = ' ';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).not.toHaveBeenCalled();
    });
  });

  it('should complete task', () => {
    fixture.whenStable().then(() => {
      component.onCompleteTaskButtonClick();
      fixture.detectChanges();
      expect(taskService.completeTask).toHaveBeenCalled();
    });
  });

  it('should update task counters on task complete', () => {
    fixture.whenStable().then(() => {
      component.onCompleteTaskButtonClick();
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  });

  it('should delete task', () => {
    fixture.whenStable().then(() => {
      component.onDeleteTaskButtonClick();
      fixture.detectChanges();
      expect(taskService.deleteTask).toHaveBeenCalled();
    });
  });

  it('should update task counters on task delete', () => {
    fixture.whenStable().then(() => {
      component.onDeleteTaskButtonClick();
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  });

  it('should navigate to current task group page on task delete', () => {
    component.onDeleteTaskButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });

  it('should save task on description input blur', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.description = 'New description';
      component.onDescriptionInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should filter tag options on tag input value change', done => {
    fixture.whenStable().then(() => {
      component.filteredTags.pipe(skip(1)).subscribe(filteredTags => {
          expect(filteredTags).toEqual([new Tag('Green')]);
          done();
      });
      component.tagControl.setValue('Gr');
      fixture.detectChanges();
    });
  });

  it('should assign background color to tag chip according to tag color', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      const chip = compiled.querySelector('mat-chip-list mat-chip');
      expect(chip.style['background-color']).toEqual('rgb(255, 0, 0)');
    });
  });

  it('should display server validation error', () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: [{field: 'deadline', message: 'Must be valid'}]}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      const deadlineError = compiled.querySelector('.deadline-error-container mat-error');
      expect(deadlineError).toBeTruthy();
      expect(deadlineError.textContent.trim()).toEqual('Must be valid');
    });
  });

  it('should ignore validation error when field is not found', () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 400, error: {fieldErrors: {absent: 'Must be present'}}});
    });
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      const deadlineError = compiled.querySelector('mat-error');
      expect(deadlineError).toBeFalsy();
    });
  });

  it('should log service call error when field is not found', () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError({status: 500, error: {errors: ['Something went wrong']}});
    });
    const logService = fixture.debugElement.injector.get(LogService);

    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(logService.error).toHaveBeenCalled();
    });
  });

  it('should save task on "deadlineDate" input change', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should set deadline time to end of day on "deadlineDate" input change when "deadlineTime" input is disabled', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = moment().add(1, 'days').toDate();
      component.deadlineTimeEnabled = false;
      component.onDeadlineDateInputChange();
      fixture.detectChanges();
      const momentTime = moment(component.taskFormModel.deadline);
      expect(momentTime.hours()).toEqual(23);
      expect(momentTime.minutes()).toEqual(59);
    });
  });

  it('should set deadline time to end of day on "deadlineTimeEnabled" checkbox uncheck', () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = false;

    fixture.whenStable().then(() => {
      component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
      fixture.detectChanges();
      const momentTime = moment(component.taskFormModel.deadline);
      expect(momentTime.hours()).toEqual(23);
      expect(momentTime.minutes()).toEqual(59);
    });
  });

  it('should save task on "deadlineDate" input clear', () => {
    fixture.whenStable().then(() => {
      component.onClearDeadlineDateButtonClick();
      fixture.detectChanges();
      expect(component.taskFormModel.deadline).toBeNull();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on "deadlineTimeEnabled" checkbox change', () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = true;

    fixture.whenStable().then(() => {
      component.deadlineTime = '11:35';
      component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should save task on deadline time change', () => {
    fixture.whenStable().then(() => {
      component.onDeadlineTimeSet('11:35');
      fixture.detectChanges();
      expect(taskService.updateTask).toHaveBeenCalled();
    });
  });

  it('should add "color-warn" class to "deadlineDate" input when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      expect(compiled.querySelector('form input[name="deadlineDate"].color-warn')).not.toBeNull();
    });
  });

  it('should add "color-warn" class to "deadlineTime" input when task is overdue', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(compiled.querySelector('form input[name="deadlineTime"].color-warn')).not.toBeNull();
    });
  });

  it('should update task counters on task save', () => {
    fixture.whenStable().then(() => {
      component.taskFormModel.title = 'New title';
      component.onTitleInputBlur();
      fixture.detectChanges();
      expect(taskService.updateTaskCounters).toHaveBeenCalled();
    });
  });

  it('should disable "deadlineTimeEnabled" checkbox when deadline is not defined', () => {
    const compiled = fixture.debugElement.nativeElement;
    fixture.whenStable().then(() => {
      component.taskFormModel.deadline = null;
      fixture.detectChanges();
      expect(compiled.querySelector('.deadline-time-checkbox.mat-checkbox-disabled')).not.toBeNull();
    });
  });

  it('should assign existing tag to task on "tagInput" token end', () => {
    fixture.whenStable().then(() => {
      const event = {value: 'Green', input: {}} as any;
      component.onTagInputTokenEnd(event);
      fixture.detectChanges();
      expect(taskService.assignTag).toHaveBeenCalled();
    });
  });

  it('should assign new tag to task on "tagInput" token end', () => {
    fixture.whenStable().then(() => {
      const event = {value: 'Yellow', input: {}} as any;
      component.onTagInputTokenEnd(event);
      fixture.detectChanges();
      expect(tagService.createTag).toHaveBeenCalled();
      expect(taskService.assignTag).toHaveBeenCalled();
    });
  });

  it('should assign tag to task on tag option select', () => {
    fixture.whenStable().then(() => {
      const event = {option: {viewValue: 'Blue'}} as any;
      component.onTagOptionSelected(event);
      fixture.detectChanges();
      expect(taskService.assignTag).toHaveBeenCalled();
    });
  });

  it('should remove tag from task on tag chip remove', () => {
    fixture.whenStable().then(() => {
      const tag = new Tag('Red');
      component.onTagChipRemoved(tag);
      fixture.detectChanges();
      expect(taskService.removeTag).toHaveBeenCalled();
    });
  });

  it('should update tag lists on tag update', () => {
    fixture.whenStable().then(() => {
      let updatedTag = component.tags[0].clone();
      updatedTag.name = updatedTag.name.toUpperCase();

      updatedTagSource.next(updatedTag);
      fixture.detectChanges();

      expect(component.tags[0]).toEqual(updatedTag);

      updatedTag = component.availableTags[0].clone();
      updatedTag.name = updatedTag.name.toUpperCase();

      updatedTagSource.next(updatedTag);
      fixture.detectChanges();
      expect(component.availableTags[0]).toEqual(updatedTag);
    });
  });

  it('should update tag lists on tag delete', () => {
    fixture.whenStable().then(() => {
      deletedTagSource.next(component.tags[0]);
      fixture.detectChanges();
      expect(component.tags.length).toEqual(0);

      deletedTagSource.next(component.availableTags[0]);
      fixture.detectChanges();
      expect(component.availableTags.length).toEqual(1);
    });
  });

  it('should include task in selected task list on task list select', () => {
    const taskListId = 3;
    fixture.whenStable().then(() => {
      component.taskFormModel.taskListId = taskListId;
      component.onTaskListSelect();
      fixture.detectChanges();
      expect(taskListService.addTask).toHaveBeenCalledWith(taskListId, task.id);
    });
  });

  it('should remove task from current task list on task list unselect', () => {
    const taskListId = component.taskFormModel.taskListId;
    fixture.whenStable().then(() => {
      component.taskFormModel.taskListId = null;
      component.onTaskListSelect();
      fixture.detectChanges();
      expect(taskListService.removeTask).toHaveBeenCalledWith(taskListId, task.id);
    });
  });

  it('should navigate to "not-found" error page when task is not found', () => {
    taskService.getTask = jasmine.createSpy('getTask').and.callFake(() => throwError({status: 404}));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
    });
  });
});
