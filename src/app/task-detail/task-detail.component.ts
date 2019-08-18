import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
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
  @ViewChild('newCommentForm')
  newCommentForm: NgForm;
  newCommentFormModel: TaskComment;
  newCommentFormEnabled: boolean;
  editCommentFormModel: TaskComment;
  editCommentFormEnabled: boolean;
  comments: Array<TaskComment>;

  private task: Task;

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private taskService: TaskService,
              private commentService: TaskCommentService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.setNewCommentFormModel(new TaskComment());
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.setTaskModel(task));
    this.commentService.getCommentsForTaskId(taskId).subscribe(comments => this.comments = comments);
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

  onNewCommentInputKeyUp() {
    this.newCommentFormEnabled = !Strings.isBlank(this.newCommentFormModel.commentText);
  }

  onEditCommentInputKeyUp() {
    this.editCommentFormEnabled = !Strings.isBlank(this.editCommentFormModel.commentText);
  }

  onNewCommentInputKeyDown(e) {
    if (e.ctrlKey && e.code === 'Enter') {
      this.createComment(this.newCommentFormModel);
    }
  }

  onNewCommentFormSubmit() {
    this.createComment(this.newCommentFormModel);
  }

  onEditCommentFormSubmit() {
    this.saveComment(this.editCommentFormModel);
  }

  onEditCommentButtonClick(comment: TaskComment) {
      this.setEditCommentFormModel(new TaskComment(comment));
      this.editCommentFormEnabled = true;
  }

  onCancelEditCommentButtonClick() {
    this.setEditCommentFormModel(null);
  }

  onDeleteCommentButtonClick(comment: TaskComment) {
    const title = this.translate.instant('attention');
    const content = this.translate.instant('delete_comment_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteComment(comment);
      }
    });
  }

  getRelativeCommentDate(comment: TaskComment) {
    return moment(comment.createdAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow();
  }

  private setTaskModel(task) {
    this.taskFormModel = task;
    this.task = task.clone();
  }

  private setNewCommentFormModel(comment) {
    this.newCommentFormModel = comment;
  }

  private setEditCommentFormModel(comment) {
    this.editCommentFormModel = comment;
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
      this.taskService.saveTask(this.taskFormModel).subscribe(task => this.setTaskModel(task));
    }
  }

  private createComment(comment: TaskComment) {
    if (!Strings.isBlank(comment.commentText)) {
      comment.taskId = this.task.id;
      comment.createdAt = new Date();
      this.commentService.saveComment(comment).subscribe(savedComment => {
        this.comments.unshift(savedComment);
        this.newCommentForm.resetForm();
      });
    }
  }

  private saveComment(comment: TaskComment) {
    if (!Strings.isBlank(comment.commentText)) {
      comment.updatedAt = new Date();
      this.commentService.saveComment(comment).subscribe(savedComment => {
        const idx = this.comments.findIndex(e => e.id === savedComment.id);
        if (idx < 0) {
          throw new Error(`Comment with id ${savedComment.id} is not found`);
        }
        this.comments[idx] = savedComment;
        this.setEditCommentFormModel(null);
      });
    }
  }

  private deleteComment(comment: TaskComment) {
    this.commentService.deleteComment(comment).subscribe(() => {
      this.comments = this.comments.filter(e => e.id !== comment.id);
    });
  }
}
