import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';

import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskGroupService} from '../../service/task-group.service';
import {TaskGroup} from '../../model/task-group';
import {PageRequest} from '../../service/page-request';
import {Task} from '../../model/task';
import {TaskStatus} from '../../model/task-status';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-tasks-by-group',
  templateUrl: './tasks-by-group.component.html',
  styleUrls: ['./tasks-by-group.component.styl']
})
export class TasksByGroupComponent extends WebServiceBasedComponent implements OnInit {
  title: string;
  formModel = new Task();
  tasks: Array<Task>;

  @ViewChild('taskForm')
  taskForm: NgForm;

  private taskGroup: TaskGroup;
  private pageRequest = new PageRequest();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskGroupService: TaskGroupService,
              private taskService: TaskService) {
    super(translate, router, authenticationService, log);
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
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.route.fragment.subscribe(fragment => this.onUrlFragmentChange(fragment));
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll() {
    this.pageRequest.page++;
    this.taskService.getTasksByGroup(this.taskGroup, this.pageRequest)
      .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.taskGroup = taskGroup;
    this.pageRequest.page = 0;
    if (taskGroup != null) {
      this.title = TasksByGroupComponent.getTitle(taskGroup);
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

  private createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.formModel.deadline = TasksByGroupComponent.getDeadlineDate(this.taskGroup);
      this.formModel.status = TasksByGroupComponent.getTaskStatus(this.taskGroup);

      this.taskService.createTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
        this.taskService.updateTaskCounters();
      }, this.onServiceCallError.bind(this));
    }
  }
}
