import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {MediaMatcher} from '@angular/cdk/layout';

import {I18nService} from '../../../service/i18n.service';
import {TaskService} from '../../../service/task.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {PageRequest} from '../../../service/page-request';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {HttpRequestError} from '../../../error/http-request.error';
import {ResourceNotFoundError} from '../../../error/resource-not-found.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {Strings} from '../../../util/strings';
import {ViewportMediaQueries} from '../../../util/viewport-media-queries';

export class MenuItem {
  constructor(public readonly name: string, public readonly handler: () => void) {
  }
}

@Component({
  selector: 'app-base-tasks',
  templateUrl: './base-tasks.component.html',
  styleUrls: ['./base-tasks.component.scss']
})
export class BaseTasksComponent {
  listIcon = '';
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
  xsQuery: MediaQueryList;

  @ViewChild('titleInput')
  titleElement: ElementRef;
  @ViewChild('taskForm')
  taskForm: NgForm;

  protected pageRequest = new PageRequest();

  constructor(public i18nService: I18nService,
              protected taskService: TaskService,
              protected pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) protected httpResponseHandler: HttpResponseHandler,
              private media: MediaMatcher) {
    this.xsQuery = media.matchMedia(ViewportMediaQueries.XS);
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

  onTaskListItemDragEnded(event: CdkDragEnd, task: Task) {
    const dropPointElement = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (dropPointElement) {
      const dropReceiver = dropPointElement.closest('.drop-receiver');
      if (dropReceiver) {
        const dropEvent = new CustomEvent('_drop', {detail: task});
        dropReceiver.dispatchEvent(dropEvent);
      }
    }
  }

  onTaskCompleteCheckboxChange(task: Task) {
    if (task.isCompleted()) {
      this.restoreCompletedTask(task);
    } else {
      this.completeTask(task);
    }
  }

  protected onTitleEditingBegin() {
  }

  protected onTitleEditingEnd() {
  }

  protected beforeTaskCreate(task: Task) {
    task.status = TaskStatus.PROCESSED;
  }

  protected afterTaskCreate(task: Task) {
    this.tasks.push(task);
    this.taskForm.resetForm();
    this.taskService.updateTaskCounters();
  }

  protected beforeTasksLoad() {
    this.showInlineSpinner = true;
    this.pageRequest.page++;
  }

  protected afterTasksLoad(tasks: Task[]) {
    this.tasks = this.tasks.concat(tasks);
    this.showInlineSpinner = false;
  }

  protected onHttpRequestError(error: HttpRequestError) {
    this.showInlineSpinner = false;
    if (error instanceof ResourceNotFoundError) {
      this.pageNavigationService.navigateToNotFoundErrorPage().then();
    } else {
      this.httpResponseHandler.handleError(error);
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
      this.taskService.createTask(this.taskFormModel).subscribe(
        task => this.afterTaskCreate(task),
        (error: HttpRequestError) => this.onHttpRequestError(error)
      );
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe({
      complete: () => {
        task.status = TaskStatus.COMPLETED;
        this.taskService.updateTaskCounters();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_completed'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private restoreCompletedTask(task: Task) {
    this.taskService.restoreTask(task).subscribe({
      complete: () => {
        task.status = TaskStatus.PROCESSED;
        this.taskService.updateTaskCounters();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_restored'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    })
  }
}
