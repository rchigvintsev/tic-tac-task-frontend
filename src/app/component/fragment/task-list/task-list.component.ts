import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {MediaMatcher} from '@angular/cdk/layout';

import {IInfiniteScrollEvent} from 'ngx-infinite-scroll/models';

import {I18nService} from '../../../service/i18n.service';
import {TaskService} from '../../../service/task.service';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {ViewportMediaQueries} from '../../../util/viewport-media-queries';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input()
  tasks: Array<Task>;
  @Input()
  loading: boolean;

  @Output()
  scrolled = new EventEmitter<IInfiniteScrollEvent>();

  xsQuery: MediaQueryList;

  constructor(public i18nService: I18nService,
              private taskService: TaskService,
              private media: MediaMatcher,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
    this.xsQuery = media.matchMedia(ViewportMediaQueries.XS);
  }

  onTaskListScroll(event: IInfiniteScrollEvent) {
    this.scrolled.next(event);
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

  private onHttpRequestError(error: HttpRequestError) {
    this.loading = false;
    this.httpResponseHandler.handleError(error);
  }
}
