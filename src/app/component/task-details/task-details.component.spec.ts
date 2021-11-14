import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Router} from '@angular/router';

import {EMPTY, of, Subject, throwError} from 'rxjs';
import {delay, skip} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskDetailsComponent} from './task-details.component';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {Tag} from '../../model/tag';
import {TaskGroup} from '../../model/task-group';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {TaskListService} from '../../service/task-list.service';
import {ConfigService} from '../../service/config.service';
import {LogService} from '../../service/log.service';
import {TaskGroupService} from '../../service/task-group.service';
import {TestSupport} from '../../test/test-support';
import {HttpRequestError} from '../../error/http-request.error';
import {BadRequestError} from '../../error/bad-request.error';
import {ResourceNotFoundError} from '../../error/resource-not-found.error';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';
import {
  AnnuallyTaskRecurrenceStrategy,
  DailyTaskRecurrenceStrategy,
  MonthlyTaskRecurrenceStrategy,
  WeeklyTaskRecurrenceStrategy
} from '../../model/task-recurrence-strategy';
import {DayOfWeek} from '../../util/time/day-of-week';
import {Month} from '../../util/time/month';

const CURRENT_LANG = 'en';
const TASK_DEADLINE = '2021-01-01T00:01'

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
  let createdTaskListSource: Subject<TaskList>;
  let task: Task;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: TaskGroupService, useValue: new TaskGroupService(TaskGroup.TODAY)},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler},
        MatDatepickerModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsComponent);
    const injector = getTestBed();

    const translateService = injector.inject(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    task = new Task().deserialize({
      id: 1,
      taskListId: 2,
      title: 'Test task',
      description: 'Test description',
      status: 'PROCESSED',
      deadline: TASK_DEADLINE,
      deadlineTimeExplicitlySet: true
    });

    router = injector.inject(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    taskService = injector.inject(TaskService);
    spyOn(taskService, 'getTask').and.returnValue(of(task));
    spyOn(taskService, 'updateTask').and.callFake(t => of(t));
    spyOn(taskService, 'updateTaskCounters').and.stub();
    spyOn(taskService, 'completeTask').and.returnValue(of(true));
    spyOn(taskService, 'deleteTask').and.returnValue(of(true));
    spyOn(taskService, 'getTags').and.returnValue(of([new Tag().deserialize({id: 2, name: 'Red', color: 0xff0000})]));
    spyOn(taskService, 'assignTag').and.returnValue(of());
    spyOn(taskService, 'removeTag').and.returnValue(of());
    spyOn(taskService, 'getComments').and.returnValue(EMPTY);

    updatedTagSource = new Subject<Tag>();
    deletedTagSource = new Subject<Tag>();

    tagService = injector.inject(TagService);
    spyOn(tagService, 'getTags').and.returnValue(of([new Tag('Green'), new Tag('Blue')]));
    spyOn(tagService, 'createTag').and.callFake(t => of(t));
    spyOn(tagService, 'getUpdatedTag').and.returnValue(updatedTagSource.asObservable());
    spyOn(tagService, 'getDeletedTag').and.returnValue(deletedTagSource.asObservable());

    createdTaskListSource = new Subject<TaskList>();

    taskListService = injector.inject(TaskListService);
    spyOn(taskListService, 'getUncompletedTaskLists').and.returnValue(of([]));
    spyOn(taskListService, 'addTask').and.returnValue(of(true));
    spyOn(taskListService, 'removeTask').and.returnValue(of(true).pipe(delay(500)));
    spyOn(taskListService, 'getCreatedTaskList').and.returnValue(createdTaskListSource.asObservable());

    const logService = injector.inject(LogService);
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

  it('should begin title editing on title text click', async () => {
    await fixture.whenStable();
    component.onTitleTextClick();
    fixture.detectChanges();
    expect(component.titleEditing).toBeTruthy();
  });

  it('should end title editing on title input blur', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should end title editing on title input enter keydown', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.onTitleInputEnterKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should not end title editing on title input enter keydown when title is blank', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.taskFormModel.title = ' ';
    component.onTitleInputEnterKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeTruthy();
  });

  it('should end title editing on title input escape keydown', async () => {
    await fixture.whenStable();
    component.titleEditing = true;
    component.onTitleInputEscapeKeydown();
    fixture.detectChanges();
    expect(component.titleEditing).toBeFalsy();
  });

  it('should undo changes in title on title input escape keydown', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = 'New title';
    component.onTitleInputEscapeKeydown();
    fixture.detectChanges();
    expect(component.taskFormModel.title).toEqual(task.title);
  });

  it('should hide title text element on click', async () => {
    const spanSelector = By.css('.mat-card-header .mat-card-title .title-text');
    let titleSpan = fixture.debugElement.query(spanSelector);
    await fixture.whenStable();
    titleSpan.nativeElement.click();
    fixture.detectChanges();
    titleSpan = fixture.debugElement.query(spanSelector);
    expect(titleSpan).toBeFalsy();
  });

  it('should show title form on title text element click', async () => {
    const titleSpan = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title .title-text'));
    await fixture.whenStable();
    titleSpan.nativeElement.click();
    fixture.detectChanges();
    const titleForm = fixture.debugElement.query(By.css('.mat-card-header .mat-card-title form'));
    expect(titleForm).toBeTruthy();
  });

  it('should save task on title input blur', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = 'New title';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should not save task with blank title', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = ' ';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('should complete task', async () => {
    await fixture.whenStable();
    component.onCompleteTaskButtonClick();
    fixture.detectChanges();
    expect(taskService.completeTask).toHaveBeenCalled();
  });

  it('should update task counters on task complete', async () => {
    await fixture.whenStable();
    component.onCompleteTaskButtonClick();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should delete task', async () => {
    await fixture.whenStable();
    component.onDeleteTaskButtonClick();
    fixture.detectChanges();
    expect(taskService.deleteTask).toHaveBeenCalled();
  });

  it('should update task counters on task delete', async () => {
    await fixture.whenStable();
    component.onDeleteTaskButtonClick();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should navigate to current task group page on task delete', () => {
    component.onDeleteTaskButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: TaskGroup.TODAY.value});
  });

  it('should save task on description input blur', async () => {
    await fixture.whenStable();
    component.taskFormModel.description = 'New description';
    component.onDescriptionInputBlur();
    fixture.detectChanges();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should filter tag options on tag input value change', (done) => {
    fixture.whenStable().then(() => {
      component.filteredTags.pipe(skip(1)).subscribe(filteredTags => {
        expect(filteredTags).toEqual([new Tag('Green')]);
        done();
      });
      component.tagControl.setValue('Gr');
      fixture.detectChanges();
    });
  });

  it('should assign background color to tag chip according to tag color', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    const chip = compiled.querySelector('mat-chip-list mat-chip');
    expect(chip.style['background-color']).toEqual('rgb(255, 0, 0)');
  });

  it('should display server validation error', async () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError(BadRequestError.fromResponse({
          url: '/',
          status: 400,
          error: {fieldErrors: [{field: 'deadline', message: 'Must be valid'}]}
        }
      ));
    });
    await fixture.whenStable();
    component.taskFormModel.deadline = moment().add(1, 'days').toDate();
    component.onDeadlineDateInputChange();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const deadlineError = compiled.querySelector('.deadline-error-container mat-error');
    expect(deadlineError).toBeTruthy();
    expect(deadlineError.textContent.trim()).toEqual('Must be valid');
  });

  it('should ignore validation error when field is not found', async () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError(BadRequestError.fromResponse({
          url: '/',
          status: 400,
          error: {fieldErrors: [{absent: 'Must be present'}]}
        }
      ));
    });
    await fixture.whenStable();
    component.taskFormModel.deadline = moment().add(1, 'days').toDate();
    component.onDeadlineDateInputChange();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const deadlineError = compiled.querySelector('mat-error');
    expect(deadlineError).toBeFalsy();
  });

  it('should log service call error', async () => {
    (taskService.updateTask as jasmine.Spy).and.callFake(() => {
      return throwError(HttpRequestError.fromResponse({url: '/', status: 500, message: 'Something went wrong'}));
    });
    const logService = fixture.debugElement.injector.get(LogService);

    await fixture.whenStable();
    component.taskFormModel.title = 'New title';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(logService.error).toHaveBeenCalled();
  });

  it('should save task on "deadlineDate" input change', async () => {
    await fixture.whenStable();
    component.taskFormModel.deadline = moment().add(1, 'days').toDate();
    component.onDeadlineDateInputChange();
    fixture.detectChanges();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should set deadline time to end of day on "deadlineDate" input change when "deadlineTime" input is disabled', async () => {
    await fixture.whenStable();
    component.taskFormModel.deadline = moment().add(1, 'days').toDate();
    component.deadlineTimeEnabled = false;
    component.onDeadlineDateInputChange();
    fixture.detectChanges();
    const momentTime = moment(component.taskFormModel.deadline);
    expect(momentTime.hours()).toEqual(23);
    expect(momentTime.minutes()).toEqual(59);
  });

  it('should set deadline time to end of day on "deadlineTimeEnabled" checkbox uncheck', async () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = false;

    await fixture.whenStable();
    component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
    fixture.detectChanges();
    const momentTime = moment(component.taskFormModel.deadline);
    expect(momentTime.hours()).toEqual(23);
    expect(momentTime.minutes()).toEqual(59);
  });

  it('should save task on "deadlineDate" input clear', async () => {
    await fixture.whenStable();
    component.onClearDeadlineDateButtonClick();
    fixture.detectChanges();
    expect(component.taskFormModel.deadline).toBeNull();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should save task on "deadlineTimeEnabled" checkbox change', async () => {
    const checkboxChangeEvent = new MatCheckboxChange();
    checkboxChangeEvent.checked = true;

    await fixture.whenStable();
    component.deadlineTime = '11:35';
    component.onDeadlineTimeEnabledCheckboxChange(checkboxChangeEvent);
    fixture.detectChanges();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should save task on deadline time change', async () => {
    await fixture.whenStable();
    component.onDeadlineTimeSet('11:35');
    fixture.detectChanges();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should save task on task recurrence option select', () => {
    component.selectedTaskRecurrenceOption = DailyTaskRecurrenceStrategy.TYPE;
    component.onTaskRecurrenceOptionSelect();
    expect(taskService.updateTask).toHaveBeenCalled();
  });

  it('should take day of week from deadline when weekly task recurrence option is selected', () => {
    component.selectedTaskRecurrenceOption = WeeklyTaskRecurrenceStrategy.TYPE;
    component.onTaskRecurrenceOptionSelect();
    const recurrenceStrategy = component.taskFormModel.recurrenceStrategy as WeeklyTaskRecurrenceStrategy;
    expect(recurrenceStrategy.dayOfWeek).toBe(DayOfWeek.FRIDAY);
  });

  it('should take day of month from deadline when monthly task recurrence option is selected', () => {
    component.selectedTaskRecurrenceOption = MonthlyTaskRecurrenceStrategy.TYPE;
    component.onTaskRecurrenceOptionSelect();
    const recurrenceStrategy = component.taskFormModel.recurrenceStrategy as MonthlyTaskRecurrenceStrategy;
    expect(recurrenceStrategy.dayOfMonth).toBe(1);
  });

  it('should take month and day of month from deadline when annually task recurrence option is selected', () => {
    component.selectedTaskRecurrenceOption = AnnuallyTaskRecurrenceStrategy.TYPE;
    component.onTaskRecurrenceOptionSelect();
    const recurrenceStrategy = component.taskFormModel.recurrenceStrategy as AnnuallyTaskRecurrenceStrategy;
    expect(recurrenceStrategy.month).toBe(Month.JANUARY);
    expect(recurrenceStrategy.dayOfMonth).toBe(1);
  });

  it('should clear task recurrence strategy when never task recurrence option is selected', () => {
    component.taskFormModel.recurrenceStrategy = new DailyTaskRecurrenceStrategy();
    component.selectedTaskRecurrenceOption = null;
    component.onTaskRecurrenceOptionSelect();
    expect(component.taskFormModel.recurrenceStrategy).toBeNull();
  });

  it('should throw error when unsupported task recurrence option is selected', () => {
    component.selectedTaskRecurrenceOption = 'everyCentury';
    expect(() => component.onTaskRecurrenceOptionSelect())
      .toThrowError(`Unsupported task repeat option: ${component.selectedTaskRecurrenceOption}`);
  });

  it('should add "color-warn" class to "deadlineDate" input when task is overdue', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    expect(compiled.querySelector('form input[name="deadlineDate"].color-warn')).not.toBeNull();
  });

  it('should add "color-warn" class to "deadlineTime" input when task is overdue', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.querySelector('form input[name="deadlineTime"].color-warn')).not.toBeNull();
  });

  it('should update task counters on task save', async () => {
    await fixture.whenStable();
    component.taskFormModel.title = 'New title';
    component.onTitleInputBlur();
    fixture.detectChanges();
    expect(taskService.updateTaskCounters).toHaveBeenCalled();
  });

  it('should disable "deadlineTimeEnabled" checkbox when deadline is not defined', async () => {
    const compiled = fixture.debugElement.nativeElement;
    await fixture.whenStable();
    component.taskFormModel.deadline = null;
    fixture.detectChanges();
    expect(compiled.querySelector('.deadline-time-checkbox.mat-checkbox-disabled')).not.toBeNull();
  });

  it('should assign existing tag to task on "tagInput" token end', async () => {
    await fixture.whenStable();
    const event = {value: 'Green', input: {}} as any;
    component.onTagInputTokenEnd(event);
    fixture.detectChanges();
    expect(taskService.assignTag).toHaveBeenCalled();
  });

  it('should assign new tag to task on "tagInput" token end', async () => {
    await fixture.whenStable();
    const event = {value: 'Yellow', input: {}} as any;
    component.onTagInputTokenEnd(event);
    fixture.detectChanges();
    expect(tagService.createTag).toHaveBeenCalled();
    expect(taskService.assignTag).toHaveBeenCalled();
  });

  it('should assign tag to task on tag option select', async () => {
    await fixture.whenStable();
    const event = {option: {viewValue: 'Blue'}} as any;
    component.onTagOptionSelected(event);
    fixture.detectChanges();
    expect(taskService.assignTag).toHaveBeenCalled();
  });

  it('should remove tag from task on tag chip remove', async () => {
    await fixture.whenStable();
    const tag = new Tag('Red');
    component.onTagChipRemoved(tag);
    fixture.detectChanges();
    expect(taskService.removeTag).toHaveBeenCalled();
  });

  it('should update tag lists on tag update', async () => {
    await fixture.whenStable();
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

  it('should update tag lists on tag delete', async () => {
    await fixture.whenStable();
    deletedTagSource.next(component.tags[0]);
    fixture.detectChanges();
    expect(component.tags.length).toEqual(0);

    deletedTagSource.next(component.availableTags[0]);
    fixture.detectChanges();
    expect(component.availableTags.length).toEqual(1);
  });

  it('should include task in selected task list on task list select', async () => {
    const taskListId = 3;
    await fixture.whenStable();
    component.taskFormModel.taskListId = taskListId;
    component.onTaskListSelect();
    fixture.detectChanges();
    expect(taskListService.addTask).toHaveBeenCalledWith(taskListId, task.id);
  });

  it('should remove task from current task list on task list unselect', async () => {
    const taskListId = component.taskFormModel.taskListId;
    await fixture.whenStable();
    component.taskFormModel.taskListId = null;
    component.onTaskListSelect();
    fixture.detectChanges();
    expect(taskListService.removeTask).toHaveBeenCalledWith(taskListId, task.id);
  });

  it('should ignore duplicated task list select event', async () => {
    await fixture.whenStable();
    component.taskFormModel.taskListId = null;
    component.onTaskListSelect();
    component.onTaskListSelect();
    fixture.detectChanges();
    expect(taskListService.removeTask).toHaveBeenCalledTimes(1);
  });

  it('should navigate to "not-found" error page when task is not found', async () => {
    taskService.getTask = jasmine.createSpy('getTask').and.callFake(() => {
      return throwError(ResourceNotFoundError.fromResponse({url: '/'}));
    });
    component.ngOnInit();
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
  });

  it('should set deadline to today using hot button', () => {
    component.onHotDeadlineButtonClick('today');
    expect(component.taskFormModel.deadline).toEqual(moment().endOf('day').toDate());
  });

  it('should set deadline to tomorrow using hot button', () => {
    component.onHotDeadlineButtonClick('tomorrow');
    expect(component.taskFormModel.deadline).toEqual(moment().add(1, 'day').endOf('day').toDate());
  });

  it('should set deadline to week using hot button', () => {
    component.onHotDeadlineButtonClick('in_week');
    expect(component.taskFormModel.deadline).toEqual(moment().add(1, 'week').endOf('day').toDate());
  });

  it('should throw error on deadline hot button click when deadline code is invalid', () => {
    const deadlineCode = 'in_next_century';
    expect(() => component.onHotDeadlineButtonClick(deadlineCode))
      .toThrow(new Error('Unsupported deadline code: ' + deadlineCode));
  });

  it('should update available task lists on task list create', async () => {
    await fixture.whenStable();

    const newTaskList = new TaskList().deserialize({id: 1, name: 'New task list'});
    createdTaskListSource.next(newTaskList);
    fixture.detectChanges();
    expect(component.taskLists.length).toEqual(1);
  });
});
