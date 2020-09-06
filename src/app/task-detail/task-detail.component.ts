import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, NgForm} from '@angular/forms';
import {DateAdapter} from '@angular/material/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TaskService} from '../service/task.service';
import {TagService} from '../service/tag.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {ServerErrorStateMatcher} from '../error/server-error-state-matcher';
import {Strings} from '../util/strings';
import {HttpErrors} from '../util/http-errors';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('title')
  titleElement: ElementRef;
  @ViewChild('taskDetailForm', {read: NgForm})
  taskDetailForm: NgForm;
  @ViewChild('tagInput')
  tagInput: ElementRef<HTMLInputElement>;

  titleEditing = false;
  taskFormModel: Task;
  selectedTaskGroup: TaskGroup;
  deadlineTime: string;
  deadlineTimeEnabled = false;
  tagControl = new FormControl();
  availableTags: Tag[] = [];
  filteredTags: Observable<Tag[]>;
  errorStateMatchers = new Map<string, ServerErrorStateMatcher>();

  private task: Task;

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService,
              private tagService: TagService,
              private dateAdapter: DateAdapter<any>) {
    super(translate, router, authenticationService, log);
  }

  private static normalizeTagName(name: string): string {
    return name.toLowerCase().replace(/ё/g, 'е');
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task), this.onServiceCallError.bind(this));
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.dateAdapter.setLocale(this.translate.currentLang);

    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(null),
      map((tagName: string | null) => tagName ? this.filterTagsByName(tagName) : this.availableTags)
    );

    this.errorStateMatchers.set('description', new ServerErrorStateMatcher());
    this.errorStateMatchers.set('deadline', new ServerErrorStateMatcher());
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onDescriptionInputBlur() {
    this.saveTask();
  }

  onDeadlineDateInputChange() {
    this.saveTask();
  }

  onClearDeadlineDateButtonClick() {
    this.errorStateMatchers.get('deadline').errorState = false;
    this.taskFormModel.deadlineDate = null;
    this.saveTask();
  }

  onDeadlineTimeEnabledCheckboxChange(event: MatCheckboxChange) {
    this.deadlineTimeEnabled = event.checked;
    this.errorStateMatchers.get('deadline').errorState = false;
    this.saveTask();
  }

  onDeadlineTimeSet(time) {
    this.deadlineTime = time;
    this.saveTask();
  }

  onTagChipInputTokenEnd(event: MatChipInputEvent) {
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

  getFieldErrorMessage(...fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      const control = this.taskDetailForm.controls[fieldName];
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

  private setTaskModel(task: Task) {
    this.taskFormModel = task;
    this.task = task.clone();

    if (task.deadlineTime) {
      this.deadlineTime = moment(task.deadlineTime).format(moment.HTML5_FMT.TIME);
      this.deadlineTimeEnabled = true;
    } else {
      this.deadlineTime = '';
      this.deadlineTimeEnabled = false;
    }

    this.tagService.getTags().pipe(
      map(tags => tags.filter(tag => task.tags.findIndex(taskTag => taskTag.name === tag.name) < 0))
    ).subscribe(tags => this.availableTags = tags);
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

    if (this.deadlineTimeEnabled && !Strings.isBlank(this.deadlineTime)) {
      this.taskFormModel.deadlineTime = moment(this.deadlineTime, moment.HTML5_FMT.TIME).toDate();
    } else {
      this.taskFormModel.deadlineTime = null;
    }

    if (!this.taskFormModel.equals(this.task)) {
      this.taskService.updateTask(this.taskFormModel).subscribe(task => {
        this.clearErrors();
        this.setTaskModel(task);
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

  private handleBadRequestError(response: any) {
    if (response.error && response.error.fieldErrors) {
      for (const fieldName of Object.keys(response.error.fieldErrors)) {
        const control = this.taskDetailForm.controls[fieldName];
        if (control) {
          const message = response.error.fieldErrors[fieldName];
          this.log.error(`Constraint violation on field ${fieldName}: ${message}`);
          control.setErrors({valid: message});
          if (fieldName === 'deadlineDate' || fieldName === 'deadlineTime') {
            this.errorStateMatchers.get('deadline').errorState = true;
          } else {
            this.errorStateMatchers.get(fieldName).errorState = true;
          }
        } else {
          this.log.error(`Field ${fieldName} is not found`);
        }
      }
    }
  }

  private clearErrors() {
    this.errorStateMatchers.forEach(matcher => matcher.errorState = false);
  }

  private filterTagsByName(tagName: string): Tag[] {
    const normalizedTagName = TaskDetailComponent.normalizeTagName(tagName);
    return this.availableTags.filter(tag => {
      return TaskDetailComponent.normalizeTagName(tag.name).indexOf(normalizedTagName) === 0;
    });
  }

  private addTag(tagName: string) {
    const trimmedName = (tagName || '').trim();
    if (trimmedName) {
      const availableTagIndex = this.availableTags.findIndex(tag => tag.name === trimmedName);
      if (availableTagIndex >= 0) {
        this.taskFormModel.tags.push(this.availableTags.splice(availableTagIndex, 1)[0]);
      } else {
        const taskTagIndex = this.taskFormModel.tags.findIndex(taskTag => taskTag.name === trimmedName);
        if (taskTagIndex < 0) {
          this.taskFormModel.tags.push(new Tag(trimmedName));
        }
      }
    }
  }

  private removeTag(tag: Tag) {
    const index = this.taskFormModel.tags.findIndex(t => t.name === tag.name);
    if (index >= 0) {
      this.taskFormModel.tags.splice(index, 1);
      if (tag.id) {
        this.availableTags.push(tag);
      }
    }
  }
}
