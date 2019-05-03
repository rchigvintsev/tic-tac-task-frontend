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
  tasks: Array<Task>;

  @ViewChild("taskForm")
  taskForm: NgForm;
  formModel = new Task();

  constructor(private taskService: TaskService) {
  }

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks
    })
  }

  onSubmit() {
    if (this.validateTaskForm()) {
      this.taskService.createTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
      });
      this.taskForm.resetForm();
    }
  }

  private validateTaskForm() {
    if (!this.taskForm.valid)
      return false;

    if (Strings.isBlank(this.formModel.title)) {
      this.taskForm.form.controls['title'].setErrors({'incorrect': true});
      return false;
    }

    return true;
  }
}
