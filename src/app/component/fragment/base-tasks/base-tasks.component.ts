import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {Observable} from 'rxjs';

import {NotificationsService} from 'angular2-notifications';

import {I18nService} from '../../../service/i18n.service';
import {LogService} from '../../../service/log.service';
import {TaskService} from '../../../service/task.service';
import {ProgressSpinnerDialogService} from '../../../service/progress-spinner-dialog.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {PageRequest} from '../../../service/page-request';
import {HttpRequestError} from '../../../error/http-request.error';
import {ResourceNotFoundError} from '../../../error/resource-not-found.error';
import {Strings} from '../../../util/strings';

export class MenuItem {
  constructor(public readonly name: string, public readonly handler: () => void) {
  }
}

@Component({
  selector: 'app-base-tasks',
  templateUrl: './base-tasks.component.html',
  styleUrls: ['./base-tasks.component.styl']
})
export class BaseTasksComponent {
  title = '';
  titleReadonly = false;
  titleMaxLength = 255;
  titlePlaceholder = 'title';
  titleEditing = false;
  taskListMenuItems: MenuItem[] = [];
  taskFormEnabled = false;
  taskFormSubmitEnabled = false;
  taskFormModel = new Task();
  tasks: Array<Task>;
  showInlineSpinner: boolean;

  @ViewChild('titleInput')
  titleElement: ElementRef;
  @ViewChild('taskForm')
  taskForm: NgForm;

  protected pageRequest = new PageRequest();

  constructor(public i18nService: I18nService,
              protected logService: LogService,
              protected taskService: TaskService,
              protected progressSpinnerDialogService: ProgressSpinnerDialogService,
              protected pageNavigationService: PageNavigationService,
              protected notificationsService: NotificationsService) {
  }

  onTitleTextClick() {
    if (!this.titleReadonly) {
      this.beginTitleEditing();
    }
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.title)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.endTitleEditing();
  }

  onTaskFormModelChange() {
    this.taskFormSubmitEnabled = !Strings.isBlank(this.taskFormModel.title);
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll(event: any) {
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => this.completeTask(task), 300);
  }

  protected onTitleEditingBegin() {
  }

  protected onTitleEditingEnd() {
  }

  protected reloadTasks(loadFunction: () => Observable<Task[]>) {
    this.pageRequest.page = 0;
    this.progressSpinnerDialogService.showUntilExecuted(loadFunction(), tasks => this.tasks = tasks,
      (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  protected loadMoreTasks(loadFunction: () => Observable<Task[]>) {
    this.showInlineSpinner = true;
    this.pageRequest.page++;
    loadFunction().subscribe(tasks => {
      this.tasks = this.tasks.concat(tasks);
      this.showInlineSpinner = false;
    }, (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  protected beforeTaskCreate(task: Task) {
    task.status = TaskStatus.PROCESSED;
  }

  protected afterTaskCreate(task: Task) {
    this.tasks.push(task);
    this.taskForm.resetForm();
    this.taskService.updateTaskCounters();
  }

  protected onHttpRequestError(error: HttpRequestError) {
    this.showInlineSpinner = false;
    if (error instanceof ResourceNotFoundError) {
      this.pageNavigationService.navigateToNotFoundErrorPage().then();
    } else {
      this.logService.error(error.message);
      if (error.localizedMessage) {
        this.notificationsService.error(null, error.localizedMessage);
      }
    }
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
    this.onTitleEditingBegin();
  }

  private endTitleEditing() {
    this.titleEditing = false;
    this.onTitleEditingEnd();
  }

  private createTask() {
    if (!Strings.isBlank(this.taskFormModel.title)) {
      this.beforeTaskCreate(this.taskFormModel);
      this.taskService.createTask(this.taskFormModel).subscribe(task => this.afterTaskCreate(task),
        (error: HttpRequestError) => this.onHttpRequestError(error));
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
      this.taskService.updateTaskCounters();
    }, (error: HttpRequestError) => this.onHttpRequestError(error));
  }
}
