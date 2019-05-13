import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent implements OnInit {
  @ViewChild("taskTitleForm")
  titleForm: NgForm;
  @ViewChild("title")
  titleElement: ElementRef;

  titleEditing = false;

  formModel: Task;

  private task: Task;

  constructor(private route: ActivatedRoute, private taskService: TaskService) {
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setModel(task));
  }

  beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  endTitleEditing() {
    if (Strings.isBlank(this.formModel.title))
      this.formModel.title = this.task.title;
    else
      this.saveTask();
    this.titleEditing = false;
  }

  saveTask() {
    if (!this.formModel.equals(this.task))
      this.taskService.saveTask(this.formModel).subscribe(task => this.setModel(task));
  }

  private setModel(task) {
    this.formModel = task;
    this.task = task.clone();
  }
}
