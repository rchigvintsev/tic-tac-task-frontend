import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';
import {BaseTasksComponent} from '../fragment/base-tasks/base-tasks.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskGroupService} from '../../service/task-group.service';
import {Task} from '../../model/task';
import {TaskGroup} from '../../model/task-group';
import {TaskStatus} from '../../model/task-status';

@Component({
  selector: 'app-task-group-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TaskGroupTasksComponent extends BaseTasksComponent implements OnInit, OnDestroy {
  private taskGroup: TaskGroup;
  private componentDestroyed = new Subject<boolean>();

  constructor(router: Router,
              private route: ActivatedRoute,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              taskService: TaskService,
              private taskGroupService: TaskGroupService) {
    super(router, translate, authenticationService, log, taskService);
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
    this.pageRequest.page++;
    this.taskService.getTasksByGroup(this.taskGroup, this.pageRequest)
      .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
  }

  protected beforeTaskCreate(task: Task) {
    task.deadline = TaskGroupTasksComponent.getDeadlineDate(this.taskGroup);
    task.status = TaskGroupTasksComponent.getTaskStatus(this.taskGroup);
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.taskGroup = taskGroup;
    this.pageRequest.page = 0;
    if (taskGroup != null) {
      this.title = TaskGroupTasksComponent.getTitle(taskGroup);
      this.taskService.getTasksByGroup(taskGroup, this.pageRequest)
        .subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
    }
  }

  private onUrlFragmentChange(fragment: string) {
    let taskGroup = TaskGroup.valueOf(fragment);
    if (!taskGroup) {
      taskGroup = TaskGroup.TODAY;
      this.router.navigate([this.translate.currentLang, 'task'], {fragment: taskGroup.value}).then();
    }
    this.taskGroupService.notifyTaskGroupSelected(taskGroup);
  }
}
