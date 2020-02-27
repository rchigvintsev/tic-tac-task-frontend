import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {LogService} from '../service/log.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.styl']
})
export class TasksComponent extends AbstractComponent implements OnInit {
  @ViewChild('taskForm')
  taskForm: NgForm;
  formModel = new Task();
  tasks: Array<Task>;

  constructor(router: Router, translate: TranslateService, log: LogService, private taskService: TaskService) {
    super(router, translate, log);
  }

  ngOnInit() {
    this.taskService.getTasks(false).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => {
      this.completeTask(task);
    }, 300);
  }

  private createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.taskService.createTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
      }, this.onServiceCallError.bind(this));
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
    }, this.onServiceCallError.bind(this));
  }
}
