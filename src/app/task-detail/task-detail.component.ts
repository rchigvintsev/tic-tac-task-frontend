import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {Task} from '../model/task';
import {TaskService} from '../service/task.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent extends AbstractComponent implements OnInit {
  @ViewChild('title')
  titleElement: ElementRef;
  titleEditing = false;
  taskFormModel: Task;

  private task: Task;

  constructor(router: Router,
              translate: TranslateService,
              private route: ActivatedRoute,
              private taskService: TaskService) {
    super(router, translate);
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task), this.onServiceCallError.bind(this));
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onDescriptionInputBlur() {
    this.saveTask();
  }

  private setTaskModel(task) {
    this.taskFormModel = task;
    this.task = task.clone();
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.saveTask();
    this.titleEditing = false;
  }

  private saveTask() {
    if (Strings.isBlank(this.taskFormModel.title)) {
      this.taskFormModel.title = this.task.title;
    }
    if (!this.taskFormModel.equals(this.task)) {
      this.taskService.updateTask(this.taskFormModel)
        .subscribe(task => this.setTaskModel(task), this.onServiceCallError.bind(this));
    }
  }
}
