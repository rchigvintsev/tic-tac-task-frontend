import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DateAdapter} from '@angular/material/core';
import {NgForm} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePicker} from 'ngx-mat-datetime-picker';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {Task} from '../model/task';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TaskService} from '../service/task.service';
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
  @ViewChild('deadlinePicker')
  deadlinePickerElement: NgxMatDatetimePicker<any>;

  titleEditing = false;
  taskFormModel: Task;
  selectedTaskGroup: TaskGroup;

  errorStateMatchers = new Map<string, ServerErrorStateMatcher>();

  private task: Task;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService,
              private dateAdapter: DateAdapter<any>) {
    super(router, translate, authenticationService, log);
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task), this.onServiceCallError.bind(this));
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.dateAdapter.setLocale(this.translate.currentLang);

    this.errorStateMatchers.set('description', new ServerErrorStateMatcher());
    this.errorStateMatchers.set('deadline', new ServerErrorStateMatcher());
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    this.closeDateTimePickerOnMouseDownOutside(event);
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

  onClearDeadlineButtonClick() {
    this.errorStateMatchers.get('deadline').errorState = false;
    this.taskFormModel.deadline = null;
    this.saveTask();
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.taskDetailForm.controls[fieldName];
    return control ? control.getError('valid') : null;
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.selectedTaskGroup = taskGroup;
  }

  private setTaskModel(task) {
    this.taskFormModel = task;
    this.task = task.clone();
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
        this.setTaskModel(task);
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

  private closeDateTimePickerOnMouseDownOutside(event) {
    const datePickerContent = window.document.getElementsByClassName('mat-datepicker-content')[0];
    if (datePickerContent && !datePickerContent.contains(event.target)) {
      this.deadlinePickerElement._cancel();
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
}
