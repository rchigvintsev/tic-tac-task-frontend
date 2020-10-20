import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {TaskComment} from '../../model/task-comment';
import {TaskCommentService} from '../../service/task-comment.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {Strings} from '../../util/strings';
import {PageRequest} from '../../service/page-request';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.styl']
})
export class TaskCommentsComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('newCommentForm')
  newCommentForm: NgForm;
  newCommentFormModel: TaskComment;
  newCommentFormEnabled: boolean;
  editCommentFormModel: TaskComment;
  editCommentFormEnabled: boolean;
  comments: Array<TaskComment>;
  taskId: number;
  selectedComment: TaskComment;

  private pageRequest = new PageRequest();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private commentService: TaskCommentService,
              private dialog: MatDialog) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.setNewCommentFormModel(new TaskComment());
    this.taskId = +this.route.snapshot.paramMap.get('id');
    this.commentService.getComments(this.taskId, this.pageRequest)
      .subscribe(comments => this.comments = comments, this.onServiceCallError.bind(this));
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
    this.updateComment(this.editCommentFormModel);
  }

  onEditCommentButtonClick(comment: TaskComment) {
    this.setEditCommentFormModel(comment.clone());
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

  onCommentContainerMouseOver(comment: TaskComment) {
    this.selectedComment = comment;
  }

  onCommentContainerMouseOut(_: TaskComment) {
    this.selectedComment = null;
  }

  onCommentListScroll() {
    this.pageRequest.page++;
    this.commentService.getComments(this.taskId, this.pageRequest)
      .subscribe(comments => this.comments = this.comments.concat(comments), this.onServiceCallError.bind(this));
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
      this.commentService.createComment(comment).subscribe(createdComment => {
        this.comments.unshift(createdComment);
        this.newCommentForm.resetForm();
      }, this.onServiceCallError.bind(this));
    }
  }

  private updateComment(comment: TaskComment) {
    if (!Strings.isBlank(comment.commentText)) {
      this.commentService.updateComment(comment).subscribe(savedComment => {
        const idx = this.comments.findIndex(e => e.id === savedComment.id);
        if (idx < 0) {
          throw new Error(`Comment with id ${savedComment.id} is not found`);
        }
        this.comments[idx] = savedComment;
        this.setEditCommentFormModel(null);
      }, this.onServiceCallError.bind(this));
    }
  }

  private deleteComment(comment: TaskComment) {
    this.commentService.deleteComment(comment).subscribe(() => {
      this.comments = this.comments.filter(e => e.id !== comment.id);
    }, this.onServiceCallError.bind(this));
  }
}
