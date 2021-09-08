import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map, tap} from 'rxjs/operators';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {I18nService} from '../../service/i18n.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {TaskGroup} from '../../model/task-group';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.scss']
})
export class TaskListTasksComponent extends BaseTasksComponent implements OnInit {
  private taskList: TaskList;

  constructor(i18nService: I18nService,
              taskService: TaskService,
              pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) httpResponseHandler: HttpResponseHandler,
              private taskListService: TaskListService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    super(i18nService, taskService, pageNavigationService, httpResponseHandler);
    this.titlePlaceholder = 'task_list_name';
    this.taskFormEnabled = true;
    this.taskListMenuItems = [
      new MenuItem('complete', this.onCompleteTaskListButtonClick.bind(this)),
      new MenuItem('delete', this.onDeleteTaskListButtonClick.bind(this))
    ];
  }

  ngOnInit() {
    this.route.params.pipe(map(params => +params.id)).subscribe(taskListId => this.onTaskListIdChange(taskListId));
  }

  onTitleInputEscapeKeydown() {
    if (this.taskList) {
      this.title = this.taskList.name;
    }
    super.onTitleInputEscapeKeydown();
  }

  onTaskListScroll() {
    if (this.taskList) {
      this.beforeTasksLoad();
      this.taskListService.getTasks(this.taskList.id, this.pageRequest, false).subscribe(
        tasks => this.afterTasksLoad(tasks),
        (error: HttpRequestError) => this.onHttpRequestError(error)
      );
    }
  }

  onCompleteTaskListButtonClick() {
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('complete_task_list_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.completeTaskList();
      }
    });
  }

  onDeleteTaskListButtonClick() {
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('delete_task_list_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.deleteTaskList();
      }
    });
  }

  protected afterTaskCreate(task: Task) {
    this.taskListService.addTask(this.taskList.id, task.id).subscribe(_ => {
      task.taskListId = this.taskList.id;
      super.afterTaskCreate(task);
    }, (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  protected onTitleEditingEnd() {
    if (!Strings.isBlank(this.title) && this.title !== this.taskList.name) {
      this.taskList.name = this.title;
      this.saveTaskList();
    }
  }

  private onTaskListIdChange(taskListId: number) {
    this.pageRequest.page = 0;
    this.taskListService.getTaskList(taskListId).pipe(
      tap(taskList => this.onTaskListLoad(taskList)),
      flatMap(taskList => this.taskListService.getTasks(taskList.id, this.pageRequest))
    ).subscribe(tasks => this.tasks = tasks, (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  private onTaskListLoad(taskList: TaskList) {
    this.taskList = taskList;
    this.title = taskList.name;
  }

  private saveTaskList() {
    this.taskListService.updateTaskList(this.taskList).subscribe(
      updatedTaskList => {
        this.onTaskListLoad(updatedTaskList);
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_saved'));
      },
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }

  private completeTaskList() {
    this.taskListService.completeTaskList(this.taskList).subscribe(
      _ => {
        this.taskService.updateTaskCounters();
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_completed'));
      },
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskList).subscribe(
      _ => {
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_deleted'));
      },
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }
}
