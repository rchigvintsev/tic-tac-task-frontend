import {Component, Inject, OnInit} from '@angular/core';

import {Task} from '../../model/task';
import {TaskService} from '../../service/task.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {PageRequest} from '../../service/page-request';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {
  tasks: Array<Task>;
  showInlineSpinner: boolean;

  private pageRequest = new PageRequest();

  constructor(private taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
  }

  ngOnInit() {
    this.taskService.getArchivedTasks(this.pageRequest)
      .subscribe(tasks => this.tasks = tasks, (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  onTaskListScroll() {
    this.beforeTasksLoad();
    this.taskService.getArchivedTasks(this.pageRequest, false).subscribe(
      tasks => this.afterTasksLoad(tasks),
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
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
    this.httpResponseHandler.handleError(error);
  }
}
