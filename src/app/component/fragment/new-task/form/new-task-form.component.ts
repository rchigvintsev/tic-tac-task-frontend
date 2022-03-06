import {Component, EventEmitter, Inject, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {TaskService} from '../../../../service/task.service';
import {Task} from '../../../../model/task';
import {TaskStatus} from '../../../../model/task-status';
import {HttpRequestError} from '../../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../../handler/http-response.handler';
import {Strings} from '../../../../util/strings';

@Component({
  selector: 'app-new-task-form',
  templateUrl: './new-task-form.component.html',
  styleUrls: ['./new-task-form.component.scss']
})
export class NewTaskFormComponent {
  @Input()
  taskDeadline: Date;
  @Input()
  taskStatus = TaskStatus.PROCESSED;

  @Output()
  taskCreate = new EventEmitter<Task>()

  @ViewChild('newTaskForm')
  form: NgForm;

  formModel = new Task();
  formSubmitEnabled = false;

  constructor(private taskService: TaskService, @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler) {
  }

  onFormModelChange() {
    this.formSubmitEnabled = !Strings.isBlank(this.formModel.title);
  }

  onFormSubmit() {
    this.createTask();
  }

  private createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.formModel.deadline = this.taskDeadline;
      this.formModel.status = this.taskStatus;

      this.taskService.createTask(this.formModel).subscribe({
        next: task => this.onTaskCreate(task),
        error: (error: HttpRequestError) => this.httpResponseHandler.handleError(error)
      });
    }
  }

  private onTaskCreate(task: Task) {
    this.form.resetForm();
    this.taskService.updateTaskCounters();
    this.taskCreate.next(task);
  }
}
