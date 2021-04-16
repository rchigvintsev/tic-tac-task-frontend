import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map, tap} from 'rxjs/operators';

import {NotificationsService} from 'angular2-notifications';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {I18nService} from '../../service/i18n.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {ProgressSpinnerDialogService} from '../../service/progress-spinner-dialog.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {TaskGroup} from '../../model/task-group';
import {HttpRequestError} from '../../error/http-request.error';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TaskListTasksComponent extends BaseTasksComponent implements OnInit {
  private taskList: TaskList;

  constructor(i18nService: I18nService,
              logService: LogService,
              taskService: TaskService,
              progressSpinnerDialogService: ProgressSpinnerDialogService,
              pageNavigationService: PageNavigationService,
              notificationsService: NotificationsService,
              private taskListService: TaskListService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    super(i18nService, logService, taskService, progressSpinnerDialogService, pageNavigationService, notificationsService);
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
      this.loadMoreTasks(() => this.taskListService.getTasks(this.taskList.id, this.pageRequest));
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
    this.reloadTasks(() => this.taskListService.getTaskList(taskListId).pipe(
      tap(taskList => this.onTaskListLoad(taskList)),
      flatMap(taskList => this.taskListService.getTasks(taskList.id, this.pageRequest))
    ));
  }

  private onTaskListLoad(taskList: TaskList) {
    this.taskList = taskList;
    this.title = taskList.name;
  }

  private saveTaskList() {
    this.taskListService.updateTaskList(this.taskList).subscribe(
      updatedTaskList => this.onTaskListLoad(updatedTaskList),
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }

  private completeTaskList() {
    this.taskListService.completeTaskList(this.taskList).subscribe(
      _ => this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY),
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskList).subscribe(
      _ => this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY),
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }
}
