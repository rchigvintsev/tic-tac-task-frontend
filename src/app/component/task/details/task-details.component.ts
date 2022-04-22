import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, NgForm} from '@angular/forms';
import {DateAdapter} from '@angular/material/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatDialog} from '@angular/material/dialog';

import * as moment from 'moment';

import {map, mergeMap, startWith, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

import {ConfirmationDialogComponent} from '../../fragment/confirmation-dialog/confirmation-dialog.component';
import {TaskService} from '../../../service/task.service';
import {TaskGroupService} from '../../../service/task-group.service';
import {TaskListService} from '../../../service/task-list.service';
import {TaskTagService} from '../../../service/task-tag.service';
import {LogService} from '../../../service/log.service';
import {I18nService} from '../../../service/i18n.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {Task} from '../../../model/task';
import {TaskGroup} from '../../../model/task-group';
import {TaskList} from '../../../model/task-list';
import {TaskTag} from '../../../model/task-tag';
import {HttpRequestError} from '../../../error/http-request.error';
import {BadRequestError} from '../../../error/bad-request.error';
import {ResourceNotFoundError} from '../../../error/resource-not-found.error';
import {ServerErrorStateMatcher} from '../../../error/server-error-state-matcher';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {Strings} from '../../../util/strings';
import {DateTimeUtils} from '../../../util/time/date-time-utils';
import {
  AnnuallyTaskRecurrenceStrategy,
  DailyTaskRecurrenceStrategy,
  MonthlyTaskRecurrenceStrategy,
  WeeklyTaskRecurrenceStrategy
} from '../../../model/task-recurrence-strategy';
import {WeekDay} from '../../../util/time/week-day';
import {Month} from '../../../util/time/month';
import {ColorPalette} from '../../../util/color-palette';

const START_OF_DAY_TIME = '00:00';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('title')
  titleElement: ElementRef;
  @ViewChild('taskDetailsForm', {read: NgForm})
  taskDetailsForm: NgForm;
  @ViewChild('tagInput')
  tagInput: ElementRef<HTMLInputElement>;

  titleEditing = false;
  taskFormModel: Task;
  selectedTaskGroup: TaskGroup;

  deadlineDate: string;
  deadlineTime: string;
  deadlineTimeEnabled = false;

  tagControl = new FormControl();
  tags: TaskTag[] = [];
  availableTags: TaskTag[] = [];
  filteredTags: Observable<TaskTag[]>;

  taskLists: TaskList[] = [];

  errorStateMatchers = new Map<string, ServerErrorStateMatcher>();

  selectedTaskRecurrenceOption: string;
  taskRecurrenceOptions = [
    DailyTaskRecurrenceStrategy.TYPE,
    WeeklyTaskRecurrenceStrategy.TYPE,
    MonthlyTaskRecurrenceStrategy.TYPE,
    AnnuallyTaskRecurrenceStrategy.TYPE
  ];

  private task: Task;
  private componentDestroyed = new Subject<boolean>();

  constructor(private log: LogService,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService,
              private taskListService: TaskListService,
              private tagService: TaskTagService,
              private i18nService: I18nService,
              private pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private route: ActivatedRoute,
              private dateAdapter: DateAdapter<any>,
              private dialog: MatDialog) {
  }

  private static normalizeTagName(name: string): string {
    return name.toLowerCase().replace(/ё/g, 'е');
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');

    this.taskService.getTask(taskId)
      .subscribe({next: task => this.initTaskModel(task), error: error => this.handleHttpRequestError(error)});
    this.taskService.getTags(taskId)
      .subscribe({next: tags => this.initTags(tags), error: error => this.handleHttpRequestError(error)});

    this.taskGroupService.getSelectedTaskGroup()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));

    this.tagService.getUpdatedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => this.onTagUpdate(tag));
    this.tagService.getDeletedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => this.onTagDelete(tag));

    const currentLang = this.i18nService.currentLanguage;
    this.dateAdapter.setLocale(currentLang.code);

    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(null),
      map((tagName: string | null) => tagName ? this.filterTagsByName(tagName) : this.availableTags)
    );

    this.taskListService.getUncompletedTaskLists().subscribe({
      next: taskLists => this.taskLists = taskLists,
      error: error => this.handleHttpRequestError(error)
    });
    this.taskListService.getCreatedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(createdTaskList => this.onTaskListCreate(createdTaskList));

    this.errorStateMatchers.set('description', new ServerErrorStateMatcher());
    this.errorStateMatchers.set('deadlineDate', new ServerErrorStateMatcher());
    this.errorStateMatchers.set('deadlineTime', new ServerErrorStateMatcher());
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  onBackButtonClick() {
    this.pageNavigationService.navigateToTaskGroupPage(this.selectedTaskGroup || TaskGroup.TODAY).then();
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.taskFormModel.title)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.taskFormModel.title = this.task.title;
    this.endTitleEditing();
  }

  onDescriptionInputBlur() {
    this.saveTask();
  }

  onDeadlineDateInputChange() {
    this.errorStateMatchers.get('deadlineDate').errorState = false;
    this.updateTaskModelDeadline();
    this.saveTask();
  }

  onClearDeadlineDateButtonClick() {
    this.errorStateMatchers.get('deadlineDate').errorState = false;
    this.errorStateMatchers.get('deadlineTime').errorState = false;

    this.deadlineDate = null;
    this.deadlineTime = START_OF_DAY_TIME;

    this.taskFormModel.deadlineDate = null;
    this.taskFormModel.deadlineDateTime = null;

    this.saveTask();
  }

  onDeadlineTimeEnabledCheckboxChange(event: MatCheckboxChange) {
    this.errorStateMatchers.get('deadlineDate').errorState = false;
    this.errorStateMatchers.get('deadlineTime').errorState = false;

    this.deadlineTimeEnabled = event.checked;

    this.updateTaskModelDeadline();
    this.saveTask();
  }

  onDeadlineTimeSet(deadlineTime: string) {
    this.updateTaskModelDeadline(deadlineTime);
    this.saveTask();
  }

  onTagInputTokenEnd(event: MatChipInputEvent) {
    this.addTag(event.value);
    if (event.input) {
      event.input.value = '';
    }
    this.tagControl.setValue(null);
  }

  onTagOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.addTag(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagControl.setValue(null);
  }

  onTagChipRemoved(tag: TaskTag) {
    this.removeTag(tag);
  }

  onTaskListSelect() {
    const taskListId = this.taskFormModel.taskListId;
    if (taskListId !== this.task.taskListId) {
      if (taskListId) {
        this.taskListService.addTask(taskListId, this.task.id).subscribe({
          next: _ => this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved')),
          error: error => this.handleHttpRequestError(error)
        });
      } else {
        this.taskListService.removeTask(this.task.taskListId, this.task.id).subscribe({
          next: _ => this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved')),
          error: error => this.handleHttpRequestError(error)
        });
      }
      this.task.taskListId = taskListId;
    }
  }

  onTaskRecurrenceOptionSelect() {
    if (this.selectedTaskRecurrenceOption) {
      switch (this.selectedTaskRecurrenceOption) {
        case DailyTaskRecurrenceStrategy.TYPE: {
          this.taskFormModel.recurrenceStrategy = new DailyTaskRecurrenceStrategy();
          break;
        }
        case WeeklyTaskRecurrenceStrategy.TYPE: {
          const recurrenceStrategy = new WeeklyTaskRecurrenceStrategy();
          recurrenceStrategy.dayOfWeek = WeekDay.forNumber(moment(this.deadlineDate, moment.HTML5_FMT.DATE).isoWeekday());
          this.taskFormModel.recurrenceStrategy = recurrenceStrategy;
          break;
        }
        case MonthlyTaskRecurrenceStrategy.TYPE: {
          const recurrenceStrategy = new MonthlyTaskRecurrenceStrategy();
          recurrenceStrategy.dayOfMonth = moment(this.deadlineDate, moment.HTML5_FMT.DATE).date();
          this.taskFormModel.recurrenceStrategy = recurrenceStrategy;
          break;
        }
        case AnnuallyTaskRecurrenceStrategy.TYPE: {
          const recurrenceStrategy = new AnnuallyTaskRecurrenceStrategy();
          recurrenceStrategy.month = Month.forCode(moment(this.deadlineDate, moment.HTML5_FMT.DATE).month() + 1);
          recurrenceStrategy.dayOfMonth = moment(this.deadlineDate, moment.HTML5_FMT.DATE).date();
          this.taskFormModel.recurrenceStrategy = recurrenceStrategy;
          break;
        }
        default:
          throw new Error('Unsupported task repeat option: ' + this.selectedTaskRecurrenceOption);
      }
    } else {
      this.taskFormModel.recurrenceStrategy = null;
    }
    this.saveTask();
  }

  onCompleteTaskButtonClick() {
    this.completeTask();
  }

  onDeleteTaskButtonClick() {
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('delete_task_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.deleteTask();
      }
    });
  }

  onHotDeadlineButtonClick(deadline: string) {
    switch (deadline) {
      case 'today':
        this.taskFormModel.deadlineDate = DateTimeUtils.today();
        this.taskFormModel.deadlineDateTime = null;
        break;
      case 'tomorrow':
        this.taskFormModel.deadlineDate = DateTimeUtils.tomorrow();
        this.taskFormModel.deadlineDateTime = null;
        break;
      case 'in_week':
        this.taskFormModel.deadlineDate = DateTimeUtils.endOfWeek();
        this.taskFormModel.deadlineDateTime = null
        break;
      default:
        throw new Error('Unsupported deadline code: ' + deadline);
    }
    this.saveTask();
  }

  getTagColorStyle(tag: TaskTag): string {
    return ColorPalette.isDark(tag.color) ? 'white' : 'inherit';
  }

  getFirstFieldErrorMessage(...fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      const control = this.taskDetailsForm.controls[fieldName];
      if (control) {
        const message = control.getError('valid');
        if (message) {
          return message;
        }
      }
    }
    return null;
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.selectedTaskGroup = taskGroup;
  }

  private onTagUpdate(tag: TaskTag) {
    let tagIndex = this.tags.findIndex(t => t.id === tag.id);
    if (tagIndex >= 0) {
      this.tags[tagIndex] = tag;
    } else {
      tagIndex = this.availableTags.findIndex(t => t.id === tag.id);
      if (tagIndex >= 0) {
        this.availableTags[tagIndex] = tag;
      }
    }
  }

  private onTagDelete(tag: TaskTag) {
    let tagIndex = this.tags.findIndex(t => t.id === tag.id);
    if (tagIndex >= 0) {
      this.tags.splice(tagIndex, 1);
    } else {
      tagIndex = this.availableTags.findIndex(t => t.id === tag.id);
      if (tagIndex >= 0) {
        this.availableTags.splice(tagIndex, 1);
      }
    }
  }

  private onTaskListCreate(taskList: TaskList) {
    this.taskLists.push(taskList);
  }

  private initTaskModel(task: Task) {
    this.task = task;
    this.taskFormModel = task.clone();

    if (task.deadlineDate) {
      this.deadlineDate = DateTimeUtils.formatDate(task.deadlineDate);
      this.deadlineTime = START_OF_DAY_TIME;
      this.deadlineTimeEnabled = false;
    } else if (task.deadlineDateTime) {
      this.deadlineDate = DateTimeUtils.formatDate(task.deadlineDateTime);
      this.deadlineTime = DateTimeUtils.formatTime(task.deadlineDateTime);
      this.deadlineTimeEnabled = true;
    } else {
      this.deadlineDate = null;
      this.deadlineTime = START_OF_DAY_TIME;
      this.deadlineTimeEnabled = false;
    }

    this.selectedTaskRecurrenceOption = task.recurrenceStrategy ? task.recurrenceStrategy.getType() : null;
  }

  private updateTaskModelDeadline(deadlineTime?: string) {
    const momentDate = moment(this.deadlineDate, moment.HTML5_FMT.DATE);
    if (this.deadlineTimeEnabled) {
      const momentTime = moment(deadlineTime || this.deadlineTime, moment.HTML5_FMT.TIME);
      this.taskFormModel.deadlineDateTime = momentDate.set({
        hour: momentTime.get('hour'),
        minute: momentTime.get('minute')
      }).toDate();
      this.taskFormModel.deadlineDate = null;
    } else {
      this.taskFormModel.deadlineDate = momentDate.toDate();
      this.taskFormModel.deadlineDateTime = null;
    }
  }

  private initTags(tags: TaskTag[]) {
    this.tags = tags;
    this.initAvailableTags(tags);
  }

  private initAvailableTags(excludedTags: TaskTag[]) {
    this.tagService.getTags().pipe(
      map(allTags => allTags.filter(tag => excludedTags.findIndex(excludedTag => excludedTag.name === tag.name) < 0))
    ).subscribe({
      next: availableTags => this.availableTags = availableTags,
      error: (error: HttpRequestError) => this.httpResponseHandler.handleError(error)
    });
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.saveTask();
    this.titleEditing = false;
  }

  private saveTask() {
    if (Strings.isBlank(this.taskFormModel.title)) {
      this.taskFormModel.title = this.task.title;
    }

    if (!this.taskFormModel.equals(this.task)) {
      this.taskService.updateTask(this.taskFormModel).subscribe({next: task => {
        this.clearErrors();
        this.initTaskModel(task);
        this.taskService.updateTaskCounters();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved'));
      }, error: (error: HttpRequestError) => {
        this.clearErrors();
        this.handleHttpRequestError(error)
      }});
    }
  }

  private completeTask() {
    this.taskService.completeTask(this.taskFormModel).subscribe({
      next: () => {
        this.taskService.updateTaskCounters();
        this.pageNavigationService.navigateToTaskGroupPage(this.selectedTaskGroup || TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_completed'));
      },
      error: error => this.handleHttpRequestError(error)
    });
  }

  private deleteTask() {
    this.taskService.deleteTask(this.taskFormModel).subscribe({
      next: () => {
        this.taskService.updateTaskCounters();
        this.pageNavigationService.navigateToTaskGroupPage(this.selectedTaskGroup || TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_deleted'));
      },
      error: error => this.handleHttpRequestError(error)
    });
  }

  private clearErrors() {
    this.errorStateMatchers.forEach(matcher => matcher.errorState = false);
  }

  private filterTagsByName(tagName: string): TaskTag[] {
    const normalizedTagName = TaskDetailsComponent.normalizeTagName(tagName);
    return this.availableTags.filter(tag => {
      return TaskDetailsComponent.normalizeTagName(tag.name).indexOf(normalizedTagName) === 0;
    });
  }

  private addTag(tagName: string) {
    const trimmedName = (tagName || '').trim();
    if (trimmedName) {
      let tagIndex = this.availableTags.findIndex(tag => tag.name === trimmedName);
      if (tagIndex >= 0) {
        const tag = this.availableTags[tagIndex];
        this.taskService.assignTag(this.task.id, tag.id).subscribe({next: _ => {
          this.tags.push(this.availableTags.splice(tagIndex, 1)[0]);
          this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved'));
        }, error: error => this.handleHttpRequestError(error)});
      } else {
        tagIndex = this.tags.findIndex(taskTag => taskTag.name === trimmedName);
        if (tagIndex < 0) {
          const newTag = new TaskTag(trimmedName);
          this.tagService.createTag(newTag).pipe(
            mergeMap(tag => this.taskService.assignTag(this.task.id, tag.id).pipe(map(_ => tag)))
          ).subscribe({
            next: tag => {
              this.tags.push(tag);
              this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved'));
            },
            error: error => this.handleHttpRequestError(error)
          });
        }
      }
    }
  }

  private removeTag(tag: TaskTag) {
    const tagIndex = this.tags.findIndex(t => t.name === tag.name);
    if (tagIndex >= 0) {
      this.taskService.removeTag(this.task.id, tag.id).subscribe({next: _ => {
        this.tags.splice(tagIndex, 1);
        this.availableTags.push(tag);
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_saved'));
      }, error: error => this.handleHttpRequestError(error)});
    }
  }

  private handleHttpRequestError(error: HttpRequestError) {
    if (error instanceof ResourceNotFoundError) {
      this.handleResourceNotFoundError(error);
    } else if (error instanceof BadRequestError) {
      this.handleBadRequestError(error);
    } else {
      this.httpResponseHandler.handleError(error);
    }
  }

  private handleResourceNotFoundError(_: ResourceNotFoundError) {
    this.pageNavigationService.navigateToNotFoundErrorPage().then();
  }

  private handleBadRequestError(error: BadRequestError) {
    for (const fieldError of error.fieldErrors) {
      const controls = [];
      const fieldName = fieldError.field;

      if (fieldName === 'deadlineDate') {
        controls.push(this.taskDetailsForm.controls.deadlineDate);
        this.errorStateMatchers.get('deadlineDate').errorState = true;
      } else if (fieldName === 'deadlineDateTime') {
        controls.push(this.taskDetailsForm.controls.deadlineDate);
        controls.push(this.taskDetailsForm.controls.deadlineTime);
        this.errorStateMatchers.get('deadlineDate').errorState = true;
        this.errorStateMatchers.get('deadlineTime').errorState = true;
      } else {
        const control = this.taskDetailsForm.controls[fieldName];
        if (control) {
          controls.push(control);
        }
      }

      if (controls.length > 0) {
        const message = fieldError.message;
        this.log.error(`Constraint violation on field ${fieldName}: ${message}`);
        for (const control of controls) {
          control.setErrors({valid: message});
        }
        const errorStateMatcher = this.errorStateMatchers.get(fieldName);
        if (errorStateMatcher) {
          errorStateMatcher.errorState = true;
        }
      } else {
        this.log.error(`Field ${fieldName} is not found`);
      }
    }
  }
}
