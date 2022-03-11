import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {IInfiniteScrollEvent} from 'ngx-infinite-scroll';
import * as moment from 'moment';

import {TaskService} from '../../../service/task.service';
import {TaskGroupService} from '../../../service/task-group.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {PageRequest} from '../../../service/page-request';
import {Task} from '../../../model/task';
import {TaskGroup} from '../../../model/task-group';
import {TaskStatus} from '../../../model/task-status';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';

@Component({
  selector: 'app-tasks-by-group',
  templateUrl: './tasks-by-group.component.html',
  styleUrls: ['./tasks-by-group.component.scss']
})
export class TasksByGroupComponent implements OnInit, OnDestroy {
  title: string;
  tasks: Array<Task>;
  tasksForWeek: boolean;

  loading: boolean;
  initialized: boolean;
  createdAt: number;

  private loadingSubscription: Subscription;
  private taskGroup: TaskGroup;
  private componentDestroyed = new Subject<boolean>();
  private pageRequest = new PageRequest();

  constructor(private taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              private taskGroupService: TaskGroupService,
              private route: ActivatedRoute,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
  }

  private static getTitle(taskGroup: TaskGroup): string {
    switch (taskGroup) {
      case TaskGroup.INBOX:
        return 'inbox';
      case TaskGroup.TODAY:
        return 'scheduled_for_today';
      case TaskGroup.TOMORROW:
        return 'scheduled_for_tomorrow';
      case TaskGroup.WEEK:
        return 'scheduled_for_week';
      case TaskGroup.SOME_DAY:
        return 'scheduled_for_some_day';
      case TaskGroup.ALL:
        return 'all_tasks';
    }
    return null;
  }

  ngOnInit() {
    this.initialized = false;
    this.title = '';
    this.taskGroupService.getSelectedTaskGroup()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    // Subscribe to task update events in order to refresh task list after task is dragged and dropped to another group
    this.taskService.getUpdatedTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskUpdate(task));
    this.route.fragment.subscribe(fragment => this.onUrlFragmentChange(fragment));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();

    if (this.loading) {
      this.loadingSubscription.unsubscribe();
      this.loadingSubscription = null;
      this.loading = false;
    }
    this.initialized = false;
  }

  get taskDeadline(): Date {
    if (this.taskGroup === TaskGroup.TODAY || this.taskGroup === TaskGroup.WEEK) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return today;
    }

    if (this.taskGroup === TaskGroup.TOMORROW) {
      const tomorrow = moment().add(1, 'day').toDate();
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow;
    }

    return null;
  }

  get taskStatus(): string {
    return this.taskGroup ? (this.taskGroup === TaskGroup.INBOX ? TaskStatus.UNPROCESSED : TaskStatus.PROCESSED) : null;
  }

  onTaskCreate(task: Task) {
    this.tasks.push(task);
  }

  onTaskListScroll(_?: IInfiniteScrollEvent) {
    this.loadNextPage();
  }

  private reloadTasks() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.loadingSubscription = this.taskService.getTasksForTaskGroup(this.taskGroup, this.pageRequest, false).subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.loading = false;
        this.initialized = true;
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private loadNextPage() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.pageRequest.page++;

    this.loadingSubscription = this.taskService.getTasksForTaskGroup(this.taskGroup, this.pageRequest, false).subscribe({
      next: tasks => {
        this.tasks = this.tasks.concat(tasks);
        this.loading = false;
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    if (taskGroup && this.taskGroup !== taskGroup) {
      this.taskGroup = taskGroup;
      this.title = TasksByGroupComponent.getTitle(taskGroup);
      this.tasks = [];
      this.pageRequest.page = 0;
      this.tasksForWeek = taskGroup === TaskGroup.WEEK;
      if (!this.tasksForWeek) {
        this.reloadTasks();
      }
    }
  }

  private onTaskUpdate(updatedTask: Task) {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index >= 0) {
      this.reloadTasks();
    }
  }

  private onUrlFragmentChange(fragment: string) {
    let taskGroup = TaskGroup.valueOf(fragment);
    if (!taskGroup) {
      taskGroup = TaskGroup.TODAY;
      this.pageNavigationService.navigateToTaskGroupPage(taskGroup).then();
    }
    this.taskGroupService.notifyTaskGroupSelected(taskGroup);
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.loading = false;
    this.httpResponseHandler.handleError(error);
  }
}
