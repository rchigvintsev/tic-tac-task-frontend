import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, NgForm} from '@angular/forms';
import {DateAdapter} from '@angular/material/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatDialog} from '@angular/material/dialog';

import * as moment from 'moment';

import {flatMap, map, startWith, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {Task} from '../../model/task';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {TaskList} from '../../model/task-list';
import {TaskGroupService} from '../../service/task-group.service';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {TaskListService} from '../../service/task-list.service';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {ServerErrorStateMatcher} from '../../error/server-error-state-matcher';
import {Strings} from '../../util/strings';
import {HttpErrors} from '../../util/http-errors';

const START_OF_DAY_TIME = '00:00';
const END_OF_DAY_TIME = '23:59';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.styl']
})
export class TaskDetailsComponent extends WebServiceBasedComponent implements OnInit, OnDestroy {
  @ViewChild('title')
  titleElement: ElementRef;
  @ViewChild('taskDetailsForm', {read: NgForm})
  taskDetailsForm: NgForm;
  @ViewChild('tagInput')
  tagInput: ElementRef<HTMLInputElement>;

  titleEditing = false;
  taskFormModel: Task;
  selectedTaskGroup: TaskGroup;
  deadlineTime: string;
  deadlineTimeEnabled = false;
  tagControl = new FormControl();
  tags: Tag[] = [];
  availableTags: Tag[] = [];
  filteredTags: Observable<Tag[]>;
  taskLists: TaskList[] = [];
  errorStateMatchers = new Map<string, ServerErrorStateMatcher>();

  private task: Task;
  private componentDestroyed = new Subject<boolean>();

  constructor(i18nService: I18nService,
              authenticationService: AuthenticationService,
              log: LogService,
              router: Router,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService,
              private tagService: TagService,
              private taskListService: TaskListService,
              private dateAdapter: DateAdapter<any>,
              private dialog: MatDialog) {
    super(i18nService, authenticationService, log, router);
  }

  private static normalizeTagName(name: string): string {
    return name.toLowerCase().replace(/ё/g, 'е');
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');

    this.taskService.getTask(taskId).subscribe(task => this.initTaskModel(task), errorResponse => {
      if (HttpErrors.isNotFound(errorResponse)) {
        this.navigateToNotFoundErrorPage();
      } else {
        this.onServiceCallError(errorResponse);
      }
    });
    this.taskService.getTags(taskId).subscribe(tags => this.initTags(tags), this.onServiceCallError.bind(this));

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

    this.taskListService.getUncompletedTaskLists()
      .subscribe(taskLists => this.taskLists = taskLists, this.onServiceCallError.bind(this));

    this.errorStateMatchers.set('description', new ServerErrorStateMatcher());
    this.errorStateMatchers.set('deadline', new ServerErrorStateMatcher());
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  onBackButtonClick() {
    this.navigateToCurrentTaskGroupPage();
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
    this.errorStateMatchers.get('deadline').errorState = false;
    this.updateDeadlineTime(this.deadlineTimeEnabled ? this.deadlineTime : END_OF_DAY_TIME);
    this.saveTask();
  }

  onClearDeadlineDateButtonClick() {
    this.errorStateMatchers.get('deadline').errorState = false;
    this.taskFormModel.deadline = null;
    this.taskFormModel.deadlineTimeExplicitlySet = false;
    this.saveTask();
  }

  onDeadlineTimeEnabledCheckboxChange(event: MatCheckboxChange) {
    this.errorStateMatchers.get('deadline').errorState = false;
    this.deadlineTimeEnabled = this.taskFormModel.deadlineTimeExplicitlySet = event.checked;
    this.updateDeadlineTime(this.deadlineTimeEnabled ? this.deadlineTime : END_OF_DAY_TIME);
    this.saveTask();
  }

  onDeadlineTimeSet(time) {
    this.updateDeadlineTime(time);
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

  onTagChipRemoved(tag: Tag) {
    this.removeTag(tag);
  }

  onTaskListSelect() {
    const taskListId = this.taskFormModel.taskListId;
    if (taskListId !== this.task.taskListId) {
      if (taskListId) {
        this.taskListService.addTask(taskListId, this.task.id)
          .subscribe(_ => this.task.taskListId = taskListId, errorResponse => this.onServiceCallError(errorResponse));
      }
    }
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

  private onTagUpdate(tag: Tag) {
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

  private onTagDelete(tag: Tag) {
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

  private initTaskModel(task: Task) {
    this.taskFormModel = task;
    this.task = task.clone();

    this.deadlineTimeEnabled = task.deadlineTimeExplicitlySet;
    if (this.deadlineTimeEnabled && task.deadline) {
      this.deadlineTime = moment(task.deadline).format(moment.HTML5_FMT.TIME);
    } else {
      this.deadlineTime = START_OF_DAY_TIME;
    }
  }

  private initTags(tags: Tag[]) {
    this.tags = tags;
    this.initAvailableTags(tags);
  }

  private initAvailableTags(excludedTags: Tag[]) {
    this.tagService.getTags().pipe(
      map(allTags => allTags.filter(tag => excludedTags.findIndex(excludedTag => excludedTag.name === tag.name) < 0))
    ).subscribe(availableTags => this.availableTags = availableTags);
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
      this.taskService.updateTask(this.taskFormModel).subscribe(task => {
        this.clearErrors();
        this.initTaskModel(task);
        this.taskService.updateTaskCounters();
      }, response => {
        this.clearErrors();
        if (HttpErrors.isBadRequest(response)) {
          this.handleBadRequestError(response);
        } else {
          this.onServiceCallError(response);
        }
      });
    }
  }

  private deleteTask() {
    this.taskService.deleteTask(this.taskFormModel)
      .subscribe(() => this.navigateToCurrentTaskGroupPage(), this.onServiceCallError.bind(this));
  }

  private handleBadRequestError(response: any) {
    if (response.error && response.error.fieldErrors) {
      for (const fieldError of response.error.fieldErrors) {
        const fieldName = fieldError.field;
        const controls = [];
        if (fieldName === 'deadline') {
          controls.push(this.taskDetailsForm.controls.deadlineDate);
          controls.push(this.taskDetailsForm.controls.deadlineTime);
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
          this.errorStateMatchers.get(fieldName).errorState = true;
        } else {
          this.log.error(`Field ${fieldName} is not found`);
        }
      }
    }
  }

  private clearErrors() {
    this.errorStateMatchers.forEach(matcher => matcher.errorState = false);
  }

  private updateDeadlineTime(deadlineTime: string) {
    const momentTime = moment(deadlineTime, moment.HTML5_FMT.TIME);
    this.taskFormModel.deadline = moment(this.taskFormModel.deadline).set({
      hour: momentTime.get('hour'),
      minute: momentTime.get('minute')
    }).toDate();
  }

  private filterTagsByName(tagName: string): Tag[] {
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
        this.taskService.assignTag(this.task.id, tag.id).subscribe(_ => {
          this.tags.push(this.availableTags.splice(tagIndex, 1)[0]);
        }, this.onServiceCallError.bind(this));
      } else {
        tagIndex = this.tags.findIndex(taskTag => taskTag.name === trimmedName);
        if (tagIndex < 0) {
          const newTag = new Tag(trimmedName);
          this.tagService.createTag(newTag).pipe(
            flatMap(tag => this.taskService.assignTag(this.task.id, tag.id).pipe(
              map(_ => tag)
            ))
          ).subscribe(tag => this.tags.push(tag), this.onServiceCallError.bind(this));
        }
      }
    }
  }

  private removeTag(tag: Tag) {
    const tagIndex = this.tags.findIndex(t => t.name === tag.name);
    if (tagIndex >= 0) {
      this.taskService.removeTag(this.task.id, tag.id).subscribe(_ => {
        this.tags.splice(tagIndex, 1);
        this.availableTags.push(tag);
      }, this.onServiceCallError.bind(this));
    }
  }

  private navigateToCurrentTaskGroupPage() {
    const currentLang = this.i18nService.currentLanguage;
    const taskGroup = this.selectedTaskGroup || TaskGroup.TODAY;
    this.router.navigate([currentLang.code, 'task'], {fragment: taskGroup.value});
  }
}
