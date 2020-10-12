import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {Task} from '../model/task';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TaskService} from '../service/task.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {PageRequest} from '../service/page-request';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.styl']
})
export class TaskListComponent extends WebServiceBasedComponent implements OnInit {
  tasks: Array<Task>;

  private taskGroup: TaskGroup;
  private pageRequest = new PageRequest();

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
  }

  onTaskListScroll() {
    this.pageRequest.page++;
    this.taskService.getTasks(this.taskGroup, this.pageRequest)
      .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => {
      this.completeTask(task);
    }, 300);
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.taskGroup = taskGroup;
    this.pageRequest.page = 0;

    if (taskGroup != null) {
      this.taskService.getTasks(taskGroup, this.pageRequest)
        .subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
      this.taskService.updateTaskCounters();
    }, this.onServiceCallError.bind(this));
  }
}
