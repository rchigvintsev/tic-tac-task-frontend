import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import * as moment from 'moment';

import {Task} from '../model/task';
import {TaskComment} from '../model/task-comment';
import {TaskService} from '../service/task.service';
import {TaskCommentService} from '../service/task-comment.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent implements OnInit {
  @ViewChild('title')
  titleElement: ElementRef;
  titleEditing = false;
  taskFormModel: Task;
  @ViewChild('commentForm')
  commentForm: NgForm;
  commentFormModel: TaskComment;
  comments: Array<TaskComment>;

  private task: Task;

  constructor(private route: ActivatedRoute,
              private taskService: TaskService,
              private taskCommentService: TaskCommentService) {
  }

  ngOnInit() {
    this.setCommentModel(new TaskComment());
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task));
    this.taskCommentService.getCommentsForTaskId(taskId).subscribe(comments => this.comments = comments);
  }

  beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  endTitleEditing() {
    this.saveTask();
    this.titleEditing = false;
  }

  saveTask() {
    if (Strings.isBlank(this.taskFormModel.title)) {
      this.taskFormModel.title = this.task.title;
    }
    if (!this.taskFormModel.equals(this.task)) {
      this.taskService.saveTask(this.taskFormModel).subscribe(task => this.setTaskModel(task));
    }
  }

  getRelativeCommentDate(comment: TaskComment) {
    return moment(comment.createdAt, 'YYYY-MM-DD\'T\'HH:mm:ss.SSS').fromNow();
  }

  createComment() {
    if (!Strings.isBlank(this.commentFormModel.commentText)) {
      this.commentFormModel.createdAt = new Date();
      this.taskCommentService.createComment(this.commentFormModel, this.task.id).subscribe(comment => {
        this.comments.unshift(comment);
        this.commentForm.resetForm();
      });
    }
  }

  private setTaskModel(task) {
    this.taskFormModel = task;
    this.task = task.clone();
  }

  private setCommentModel(comment) {
    this.commentFormModel = comment;
  }
}
