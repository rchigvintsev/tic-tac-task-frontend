import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {map} from 'rxjs/operators';
import {IInfiniteScrollEvent} from 'ngx-infinite-scroll/models';

import {ConfirmationDialogComponent} from '../../fragment/confirmation-dialog/confirmation-dialog.component';
import {I18nService} from '../../../service/i18n.service';
import {TaskService} from '../../../service/task.service';
import {TaskListService} from '../../../service/task-list.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {Task} from '../../../model/task';
import {TaskList} from '../../../model/task-list';
import {TaskGroup} from '../../../model/task-group';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {Strings} from '../../../util/strings';
import {PageRequest} from '../../../service/page-request';
import {ResourceNotFoundError} from '../../../error/resource-not-found.error';

@Component({
  selector: 'app-tasks-from-list',
  templateUrl: './tasks-from-list.component.html',
  styleUrls: ['./tasks-from-list.component.scss']
})
export class TasksFromListComponent implements OnInit, OnDestroy {
  tasks: Array<Task>;
  loading: boolean;
  loaded: boolean;

  taskListFormModel = new TaskList();

  @ViewChild('titleInput')
  titleElement: ElementRef;
  titleEditing = false;

  private taskList: TaskList;
  private pageRequest: PageRequest;
  private recentlyCreatedTasks = new Map<number, Task>();

  constructor(private i18nService: I18nService,
              private taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private taskListService: TaskListService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.pageRequest = taskListService.newPageRequest();
  }

  ngOnInit() {
    this.route.params.pipe(map(params => +params.id)).subscribe(taskListId => this.onTaskListIdChange(taskListId));
  }

  ngOnDestroy(): void {
    this.recentlyCreatedTasks.clear();
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.taskListFormModel.name)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.taskListFormModel.name = this.taskList.name;
    this.endTitleEditing();
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

  onTaskCreate(task: Task) {
    this.taskListService.addTask(this.taskList.id, task.id).subscribe({
      next: _ => {
        task.taskListId = this.taskList.id;
        this.tasks.unshift(task);
        this.recentlyCreatedTasks.set(task.id, task);
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  onTaskListScroll(_?: IInfiniteScrollEvent) {
    this.loadNextPage();
  }

  private onTaskListIdChange(taskListId: number) {
    this.loading = true;
    this.taskListService.getTaskList(taskListId, false).subscribe({
      next: taskList => this.onTaskListLoad(taskList),
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private onTaskListLoad(taskList: TaskList) {
    this.taskList = taskList;
    this.taskListFormModel = taskList.clone();
    this.reloadTasks();
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.loading = false;
    if (error instanceof ResourceNotFoundError) {
      this.pageNavigationService.navigateToNotFoundErrorPage().then();
    } else {
      this.httpResponseHandler.handleError(error);
    }
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.titleEditing = false;
    if (Strings.isBlank(this.taskListFormModel.name)) {
      this.taskListFormModel.name = this.taskList.name;
    } else {
      this.saveTaskList();
    }
  }

  private saveTaskList() {
    if (!this.taskListFormModel.equals(this.taskList)) {
      this.taskListService.updateTaskList(this.taskListFormModel).subscribe({
        next: taskList => {
          this.taskList = taskList;
          this.taskListFormModel = taskList.clone();
          this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_saved'));
        },
        error: (error: HttpRequestError) => this.onHttpRequestError(error)
      });
    }
  }

  private completeTaskList() {
    this.taskListService.completeTaskList(this.taskList).subscribe({
      next: _ => {
        this.taskService.updateTaskCounters();
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_completed'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskListFormModel).subscribe({
      next: _ => {
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('task_list_deleted'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private reloadTasks() {
    this.pageRequest.page = 0;
    this.taskListService.getTasks(this.taskList.id, this.pageRequest).subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.recentlyCreatedTasks.clear();
        this.loading = false;
        this.loaded = true;
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private loadNextPage() {
    if (this.taskList) {
      this.pageRequest.page++;
      this.taskListService.getTasks(this.taskList.id, this.pageRequest, false).subscribe({
        next: tasks => this.tasks = this.tasks.concat(tasks.filter(t => !this.recentlyCreatedTasks.has(t.id))),
        error: (error: HttpRequestError) => this.onHttpRequestError(error)
      });
    }
  }
}
