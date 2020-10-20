import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {Task} from '../../model/task';
import {TaskService} from '../../service/task.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.styl']
})
export class TaskListComponent extends WebServiceBasedComponent {
  @Input()
  tasks: Array<Task>;

  @Output()
  taskListScroll = new EventEmitter();

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private taskService: TaskService) {
    super(translate, router, authenticationService, log);
  }

  onTaskListScroll(event: any) {
    this.taskListScroll.emit(event);
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => {
      this.completeTask(task);
    }, 300);
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
      this.taskService.updateTaskCounters();
    }, this.onServiceCallError.bind(this));
  }
}
