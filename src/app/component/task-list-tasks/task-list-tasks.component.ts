import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageRequest} from '../../service/page-request';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {TaskStatus} from '../../model/task-status';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: './task-list-tasks.component.html',
  styleUrls: ['./task-list-tasks.component.styl']
})
export class TaskListTasksComponent extends WebServiceBasedComponent implements OnInit {
  title: string;
  taskFormModel = new Task();
  tasks: Task[];

  @ViewChild('taskForm')
  taskForm: NgForm;

  private taskList: TaskList;
  private pageRequest = new PageRequest();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskListService: TaskListService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(id => this.taskListService.getTaskList(id)),
      flatMap(taskList => {
        this.onTaskListLoad(taskList);
        return this.taskListService.getTasks(taskList.id);
      })
    ).subscribe(tasks => this.onTasksLoad(tasks), this.onServiceCallError.bind(this));

  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll() {
    if (this.taskList) {
      this.pageRequest.page++;
      this.taskListService.getTasks(this.taskList.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }

  private onTaskListLoad(taskList: TaskList) {
    this.taskList = taskList;
    this.title = taskList.name;
  }

  private onTasksLoad(tasks: Task[]) {
    this.tasks = tasks;
  }

  private createTask() {
    if (!Strings.isBlank(this.taskFormModel.title)) {
      this.taskFormModel.status = TaskStatus.PROCESSED;
      this.taskService.createTask(this.taskFormModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
        this.taskService.updateTaskCounters();
      }, this.onServiceCallError.bind(this));
    }
  }
}
