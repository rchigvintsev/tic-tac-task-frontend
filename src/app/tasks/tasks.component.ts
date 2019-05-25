import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.styl']
})
export class TasksComponent implements OnInit {
  @ViewChild('taskForm')
  taskForm: NgForm;
  formModel = new Task();
  tasks: Array<Task>;

  constructor(private taskService: TaskService) {
  }

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.taskService.saveTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
      });
      this.taskForm.resetForm();
    }
  }

  completeTask(task: Task) {
    task.completed = true;
    this.taskService.saveTask(task).subscribe(savedTask => {
      this.tasks = this.tasks.filter(e => e.id !== savedTask.id);
    });
  }
}
