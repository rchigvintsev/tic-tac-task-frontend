import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgForm} from '@angular/forms';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {I18nService} from '../../../service/i18n.service';
import {TaskListService} from '../../../service/task-list.service';
import {TaskService} from '../../../service/task.service';
import {TaskList} from '../../../model/task-list';
import {Task} from '../../../model/task';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {Strings} from '../../../util/strings';
import {PathMatcher} from '../../../util/path-matcher';

@Component({
  selector: 'app-task-lists',
  templateUrl: './task-lists.component.html',
  styleUrls: ['./task-lists.component.scss']
})
export class TaskListsComponent implements OnInit, OnDestroy {
  @ViewChild('taskListForm')
  taskListForm: NgForm;
  taskListFormModel = new TaskList();
  taskListFormSubmitEnabled = false;
  taskLists: TaskList[] = [];

  private pathMatcher: PathMatcher;
  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              private taskListService: TaskListService,
              private taskService: TaskService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private router: Router) {
  }

  ngOnInit() {
    this.taskListService.getUncompletedTaskLists().subscribe(
      taskLists => this.taskLists = taskLists,
      (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    this.taskListService.getUpdatedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListUpdate(taskList));
    this.taskListService.getCompletedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListComplete(taskList));
    this.taskListService.getDeletedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListDelete(taskList));

    this.taskService.getRestoredTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskRestore(task));

    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTaskListFormModelNameChange() {
    this.taskListFormSubmitEnabled = !Strings.isBlank(this.taskListFormModel.name);
  }

  onTaskListFormSubmit() {
    this.createTaskList();
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private createTaskList() {
    if (!Strings.isBlank(this.taskListFormModel.name)) {
      this.taskListService.createTaskList(this.taskListFormModel).subscribe(createdTaskList => {
        this.taskLists.push(createdTaskList);
        this.taskListForm.resetForm();
      }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    }
  }

  private onTaskListUpdate(updatedTaskList: TaskList) {
    const index = this.findTaskListIndex(updatedTaskList.id);
    if (index >= 0) {
      this.taskLists[index] = updatedTaskList;
    }
  }

  private onTaskListComplete(completedTaskList: TaskList) {
    this.removeTaskList(completedTaskList);
  }

  private onTaskListDelete(deletedTaskList: TaskList) {
    this.removeTaskList(deletedTaskList);
  }

  private onTaskRestore(restoredTask: Task) {
    const taskListId = restoredTask.taskListId;
    if (taskListId) {
      const index = this.findTaskListIndex(taskListId);
      if (index < 0) {
        this.taskListService.getTaskList(taskListId, false).subscribe(taskList => this.taskLists.push(taskList));
      }
    }
  }

  private removeTaskList(taskList: TaskList) {
    const index = this.findTaskListIndex(taskList.id);
    if (index >= 0) {
      this.taskLists.splice(index, 1);
    }
  }

  private findTaskListIndex(id: number): number {
    return this.taskLists.findIndex(taskList => taskList.id === id);
  }
}
