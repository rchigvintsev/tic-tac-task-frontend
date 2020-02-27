import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DateAdapter} from '@angular/material/core';
import {NgForm} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePicker} from 'ngx-mat-datetime-picker';

import {AbstractComponent} from '../abstract-component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {LogService} from '../service/log.service';
import {ServerErrorStateMatcher} from '../error/server-error-state-matcher';
import {Strings} from '../util/strings';
import {HttpErrors} from '../util/http-errors';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent extends AbstractComponent implements OnInit {
  @ViewChild('title')
  titleElement: ElementRef;
  @ViewChild('taskDetailForm', {read: NgForm})
  taskDetailForm: NgForm;
  @ViewChild('deadlinePicker')
  deadlinePickerElement: NgxMatDatetimePicker<any>;

  titleEditing = false;
  taskFormModel: Task;

  errorStateMatchers = new Map<string, ServerErrorStateMatcher>();

  private task: Task;

  constructor(router: Router,
              translate: TranslateService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private dateAdapter: DateAdapter<any>) {
    super(router, translate, log);
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task), this.onServiceCallError.bind(this));
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
    this.taskFormModel.deadline = null;
    this.saveTask();
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.taskDetailForm.controls[fieldName];
    return control ? control.getError('valid') : null;
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
      this.taskService.updateTask(this.taskFormModel).subscribe(task => this.setTaskModel(task), response => {
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
}
