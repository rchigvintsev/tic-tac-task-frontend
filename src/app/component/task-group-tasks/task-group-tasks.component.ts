import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as moment from 'moment';

import {NotificationsService} from 'angular2-notifications';

import {BaseTasksComponent} from '../fragment/base-tasks/base-tasks.component';
import {I18nService} from '../../service/i18n.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskGroupService} from '../../service/task-group.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {Task} from '../../model/task';
import {TaskGroup} from '../../model/task-group';
import {TaskStatus} from '../../model/task-status';
import {HttpRequestError} from '../../error/http-request.error';

@Component({
  selector: 'app-task-group-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TaskGroupTasksComponent extends BaseTasksComponent implements OnInit, OnDestroy {
  private taskGroup: TaskGroup;
  private componentDestroyed = new Subject<boolean>();

  constructor(i18nService: I18nService,
              logService: LogService,
              taskService: TaskService,
              pageNavigationService: PageNavigationService,
              notificationsService: NotificationsService,
              private taskGroupService: TaskGroupService,
              private route: ActivatedRoute) {
    super(i18nService, logService, taskService, pageNavigationService, notificationsService);
    this.taskFormEnabled = true;
    this.titleReadonly = true;
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

  private static getDeadlineDate(taskGroup: TaskGroup): Date {
    if (taskGroup === TaskGroup.TODAY || taskGroup === TaskGroup.WEEK) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return today;
    }

    if (taskGroup === TaskGroup.TOMORROW) {
      const tomorrow = moment().add(1, 'day').toDate();
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow;
    }

    return null;
  }

  private static getTaskStatus(taskGroup: TaskGroup): string {
    return taskGroup === TaskGroup.INBOX ? TaskStatus.UNPROCESSED : TaskStatus.PROCESSED;
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.route.fragment.subscribe(fragment => this.onUrlFragmentChange(fragment));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  onTaskListScroll() {
    this.beforeTasksLoad();
    this.taskService.getTasksByGroup(this.taskGroup, this.pageRequest, false).subscribe(
      tasks => this.afterTasksLoad(tasks),
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }

  protected beforeTaskCreate(task: Task) {
    task.deadline = TaskGroupTasksComponent.getDeadlineDate(this.taskGroup);
    task.status = TaskGroupTasksComponent.getTaskStatus(this.taskGroup);
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    if (taskGroup && this.taskGroup !== taskGroup) {
      this.taskGroup = taskGroup;
      this.title = TaskGroupTasksComponent.getTitle(taskGroup);
      this.tasks = [];
      this.pageRequest.page = 0;
      this.taskService.getTasksByGroup(taskGroup, this.pageRequest).subscribe(
        tasks => this.tasks = tasks,
        (error: HttpRequestError) => this.onHttpRequestError(error)
      );
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
}
