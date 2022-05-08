import {Component, Inject, Input} from '@angular/core';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {MediaMatcher} from '@angular/cdk/layout';

import {I18nService} from '../../../../service/i18n.service';
import {TaskService} from '../../../../service/task.service';
import {Task} from '../../../../model/task';
import {TaskStatus} from '../../../../model/task-status';
import {HttpRequestError} from '../../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../../handler/http-response.handler';
import {MediaQueries} from '../../../../util/media-queries';

@Component({
  selector: 'app-task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss']
})
export class TaskListItemComponent {
  @Input()
  task: Task;
  @Input()
  showOnlyExpiredDeadline = false;

  private xsQuery: MediaQueryList;

  constructor(public i18nService: I18nService,
              private taskService: TaskService,
              private media: MediaMatcher,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
    this.xsQuery = media.matchMedia(MediaQueries.XS);
  }

  onTaskListItemDragEnded(event: CdkDragEnd) {
    const dropPointElement = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y);
    if (dropPointElement) {
      const dropReceiver = dropPointElement.closest('.drop-receiver');
      if (dropReceiver) {
        const dropEvent = new CustomEvent('_drop', {detail: this.task});
        dropReceiver.dispatchEvent(dropEvent);
      }
    }
  }

  onTaskCompleteCheckboxChange() {
    if (this.task.isCompleted()) {
      this.restoreCompletedTask();
    } else {
      this.completeTask();
    }
  }

  isShowDeadline(task: Task): boolean {
    return (task.deadlineDate || task.deadlineDateTime) && (!this.showOnlyExpiredDeadline || task.isOverdue()) && !this.xsQuery.matches;
  }

  private completeTask() {
    this.taskService.completeTask(this.task).subscribe({
      complete: () => {
        this.task.status = TaskStatus.COMPLETED;
        this.taskService.updateTaskCounters();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_completed'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private restoreCompletedTask() {
    this.taskService.restoreTask(this.task).subscribe({
      complete: () => {
        this.task.status = TaskStatus.PROCESSED;
        this.taskService.updateTaskCounters();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_restored'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    })
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.httpResponseHandler.handleError(error);
  }
}
