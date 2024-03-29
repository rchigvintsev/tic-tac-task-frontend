import {Component, Inject, OnDestroy, OnInit} from '@angular/core';

import * as moment from 'moment';

import {takeUntil} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';

import {GetTasksRequest, TaskService} from '../../../../service/task.service';
import {PageRequest} from '../../../../service/page-request';
import {Task} from '../../../../model/task';
import {TaskStatus} from '../../../../model/task-status';
import {DateTimeUtils} from '../../../../util/time/date-time-utils';
import {WeekDay} from '../../../../util/time/week-day';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../../handler/http-response.handler';
import {HttpRequestError} from '../../../../error/http-request.error';
import {DailyTaskRecurrenceStrategy} from '../../../../model/task-recurrence-strategy';

@Component({
  selector: 'app-task-list-for-week',
  templateUrl: './task-list-for-week.component.html',
  styleUrls: ['./task-list-for-week.component.scss']
})
export class TaskListForWeekComponent implements OnInit, OnDestroy {
  taskGroups: TaskGroup[];

  private componentDestroyed = new Subject<boolean>();

  constructor(private taskService: TaskService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
  }

  private static getTaskGroupName(i: number, dayNumber: number): string {
    return i === 0 ? 'today' : (i === 1 ? 'tomorrow' : WeekDay.forNumber(dayNumber).name.toLowerCase());
  }

  private static isDailyTask(task: Task) {
    return (task.deadlineDate || task.deadlineDateTime)
      && task.recurrenceStrategy
      && task.recurrenceStrategy.getType() === DailyTaskRecurrenceStrategy.TYPE;
  }

  ngOnInit() {
    this.initTaskGroups();
    // Subscribe to task update events in order to refresh task list after task is dragged and dropped to another group
    this.taskService.getUpdatedTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskUpdate(task));
    this.taskService.getCompletedTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskCompleteOrRestore(task));
    this.taskService.getRestoredTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskCompleteOrRestore(task));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();

    this.taskGroups.forEach(taskGroup => taskGroup.onDestroy());
    this.taskGroups = [];
  }

  onLoadMoreButtonClick(taskGroup: TaskGroup) {
    taskGroup.loadNextPage();
  }

  private initTaskGroups() {
    let dayNumber = DateTimeUtils.weekDay();

    this.taskGroups = [];
    for (let i = 0; i < 7; i++, dayNumber++) {
      if (dayNumber === 8) {
        dayNumber = 1;
      }
      this.taskGroups[i] = this.createTaskGroup(i, dayNumber);
    }
  }

  private createTaskGroup(n: number, dayNumber: number): TaskGroup {
    const taskRequest = new GetTasksRequest();
    taskRequest.statuses = [TaskStatus.PROCESSED, TaskStatus.COMPLETED];
    taskRequest.completedAtFrom = DateTimeUtils.startOfToday();
    if (n === 0) {
      taskRequest.deadlineDateTo = DateTimeUtils.today();
      taskRequest.deadlineDateTimeTo = DateTimeUtils.endOfToday();
    } else {
      const deadlineDate = moment().add(n, 'day').toDate();
      taskRequest.deadlineDateFrom = deadlineDate;
      taskRequest.deadlineDateTo = deadlineDate;

      taskRequest.deadlineDateTimeFrom = moment().add(n, 'day').startOf('day').toDate();
      taskRequest.deadlineDateTimeTo = moment().add(n, 'day').endOf('day').toDate();
    }
    const groupName = TaskListForWeekComponent.getTaskGroupName(n, dayNumber);
    return new TaskGroup(groupName, taskRequest, this.taskService, this.httpResponseHandler);
  }

  private onTaskUpdate(task: Task) {
    if (this.findTaskGroupIndex(task) >= 0) {
      this.reloadTasks();
    }
  }

  private onTaskCompleteOrRestore(task: Task) {
    if (TaskListForWeekComponent.isDailyTask(task)) {
      const taskGroupIndex = this.findTaskGroupIndex(task);
      if (taskGroupIndex >= 0) {
        this.taskGroups[taskGroupIndex].reloadTasks();
        if (taskGroupIndex < this.taskGroups.length - 1) {
          this.taskGroups[taskGroupIndex + 1].reloadTasks();
        }
      }
    }
  }

  private findTaskGroupIndex(task: Task): number {
    for (let i = 0; i < this.taskGroups.length; i++) {
      const taskIndex = this.taskGroups[i].tasks.findIndex(t => t.id === task.id);
      if (taskIndex >= 0) {
        return i;
      }
    }
    return -1;
  }

  private reloadTasks() {
    this.taskGroups.forEach(taskGroup => taskGroup.reloadTasks());
  }
}

class TaskGroup {
  tasks: Task[] = [];
  size = 0;
  pageRequest: PageRequest;

  loading: boolean;
  initialized: boolean;

  private loadingSubscription: Subscription;

  constructor(public name: string,
              private taskRequest: GetTasksRequest,
              private taskService: TaskService,
              private httpResponseHandler: HttpResponseHandler) {
    this.pageRequest = taskService.newPageRequest();
    this.reloadTasks();
  }

  onDestroy() {
    if (this.loading) {
      this.loadingSubscription.unsubscribe();
      this.loadingSubscription = null;
      this.loading = false;
    }
    this.initialized = false;
  }

  reloadTasks() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.loadingSubscription = this.taskService.getTaskCount(this.taskRequest).subscribe({
      next: taskCount => {
        this.size = taskCount;
        if (taskCount > 0) {
          this.loadingSubscription = this.taskService.getTasks(this.taskRequest, this.pageRequest, false).subscribe(tasks => {
            this.tasks = tasks;
            this.loading = false;
            this.initialized = true;
          });
        } else {
          this.tasks = [];
          this.loading = false;
          this.initialized = true;
        }
      },
      error: error => this.onHttpRequestError(error)
    });
  }

  loadNextPage() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.pageRequest.page++;

    this.loadingSubscription = this.taskService.getTasks(this.taskRequest, this.pageRequest, false).subscribe(tasks => {
      this.tasks = this.tasks.concat(tasks);
      this.loading = false;
    });
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.loading = false;
    this.httpResponseHandler.handleError(error);
  }
}
