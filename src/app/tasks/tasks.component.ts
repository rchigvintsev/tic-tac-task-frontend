import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
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

  constructor(router: Router, translate: TranslateService, private taskService: TaskService) {
    super(router, translate);
  }

  ngOnInit() {
    this.taskService.getTasks(false).subscribe(tasks => this.tasks = tasks, error => this.onServiceCallError(error));
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskCompleteCheckboxChange(task: Task) {
    this.completeTask(task);
  }

  private createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.taskService.saveTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
      }, error => this.onServiceCallError(error));
    }
  }

  private completeTask(task: Task) {
    task.completed = true;
    this.taskService.saveTask(task).subscribe(savedTask => {
      this.tasks = this.tasks.filter(e => e.id !== savedTask.id);
    }, error => this.onServiceCallError(error));
  }
}
