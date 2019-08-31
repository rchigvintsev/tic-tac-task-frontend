import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {AbstractComponent} from '../abstract-component';
import {TaskComment} from '../model/task-comment';
import {TaskCommentService} from '../service/task-comment.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.styl']
})
export class TaskCommentsComponent extends AbstractComponent implements OnInit {
  @ViewChild('newCommentForm')
  newCommentForm: NgForm;
  newCommentFormModel: TaskComment;
  newCommentFormEnabled: boolean;
  editCommentFormModel: TaskComment;
  editCommentFormEnabled: boolean;
  comments: Array<TaskComment>;
  taskId: number;

  constructor(router: Router,
              translate: TranslateService,
              private route: ActivatedRoute,
              private commentService: TaskCommentService,
              private dialog: MatDialog) {
    super(router, translate);
  }

  ngOnInit() {
    this.setNewCommentFormModel(new TaskComment());
    this.taskId = +this.route.snapshot.paramMap.get('id');
    this.commentService.getCommentsForTaskId(this.taskId)
      .subscribe(comments => this.comments = comments, error => this.onServiceCallError(error));
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

  private setNewCommentFormModel(comment) {
    this.newCommentFormModel = comment;
  }

  private setEditCommentFormModel(comment) {
    this.editCommentFormModel = comment;
  }

  private createComment(comment: TaskComment) {
    if (!Strings.isBlank(comment.commentText)) {
      comment.taskId = this.taskId;
      comment.createdAt = new Date();
      this.commentService.saveComment(comment).subscribe(savedComment => {
        this.comments.unshift(savedComment);
        this.newCommentForm.resetForm();
      }, error => this.onServiceCallError(error));
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
      }, error => this.onServiceCallError(error));
    }
  }

  private deleteComment(comment: TaskComment) {
    this.commentService.deleteComment(comment).subscribe(() => {
      this.comments = this.comments.filter(e => e.id !== comment.id);
    }, error => this.onServiceCallError(error));
  }
}
