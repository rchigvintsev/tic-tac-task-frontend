import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as moment from 'moment';

import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {BaseTasksComponent} from '../fragment/base-tasks/base-tasks.component';
import {TaskService} from '../../service/task.service';
import {TaskGroupService} from '../../service/task-group.service';
import {I18nService} from '../../service/i18n.service';
import {PageNavigationService} from '../../service/page-navigation.service';
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

  constructor(i18nService: I18nService,
              componentHelper: WebServiceBasedComponentHelper,
              taskService: TaskService,
              private taskGroupService: TaskGroupService,
              private pageNavigationService: PageNavigationService,
              private route: ActivatedRoute) {
    super(i18nService, taskService, componentHelper);
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
    this.taskService.getTasksByGroup(this.taskGroup, this.pageRequest).subscribe(
      tasks => this.tasks = this.tasks.concat(tasks),
      errorResponse => {
        const messageToDisplay = this.i18nService.translate('task_loading_error');
        this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
      }
    );
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
      this.taskService.getTasksByGroup(taskGroup, this.pageRequest).subscribe(
        tasks => this.tasks = tasks,
        errorResponse => {
          const messageToDisplay = this.i18nService.translate('task_loading_error');
          this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
        }
      );
    }
  }

  private onUrlFragmentChange(fragment: string) {
    let taskGroup = TaskGroup.valueOf(fragment);
    if (!taskGroup) {
      taskGroup = TaskGroup.TODAY;
      this.pageNavigationService.navigateToTaskGroupPage(taskGroup);
    }
    this.taskGroupService.notifyTaskGroupSelected(taskGroup);
  }
}
