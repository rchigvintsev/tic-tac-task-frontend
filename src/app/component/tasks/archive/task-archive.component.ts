import {Component, Inject, OnInit} from '@angular/core';

import {Task} from '../../../model/task';
import {I18nService} from '../../../service/i18n.service';
import {TaskService} from '../../../service/task.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {PageRequest} from '../../../service/page-request';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';

@Component({
  selector: 'app-task-archive',
  templateUrl: './task-archive.component.html',
  styleUrls: ['./task-archive.component.scss']
})
export class TaskArchiveComponent implements OnInit {
  tasks: Array<Task>;
  showInlineSpinner: boolean;

  private pageRequest: PageRequest;

  constructor(private i18nService: I18nService,
              private taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
    this.pageRequest = taskService.newPageRequest();
  }

  ngOnInit() {
    this.taskService.getArchivedTasks(this.pageRequest).subscribe({
      next: tasks => this.tasks = tasks,
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  onTaskRestoreButtonClick(task: Task) {
    this.restoreTask(task)
  }

  onTaskListScroll() {
    this.beforeTasksLoad();
    this.taskService.getArchivedTasks(this.pageRequest, false).subscribe({
      next: tasks => this.afterTasksLoad(tasks),
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private restoreTask(task: Task) {
    this.taskService.restoreTask(task).subscribe({
      next: restoredTask => this.onTaskRestore(restoredTask),
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private onTaskRestore(task: Task) {
    const index = this.tasks.findIndex(e => e.id === task.id);
    if (index >= 0) {
      this.tasks.splice(index, 1);
    }
    this.taskService.updateTaskCounters();
    this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_restored'));
  }

  private beforeTasksLoad() {
    this.showInlineSpinner = true;
    this.pageRequest.page++;
  }

  private afterTasksLoad(tasks: Task[]) {
    this.tasks = this.tasks.concat(tasks);
    this.showInlineSpinner = false;
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.showInlineSpinner = false;
    this.httpResponseHandler.handleError(error);
  }
}
