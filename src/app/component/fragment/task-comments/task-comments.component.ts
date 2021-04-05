import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';

import * as moment from 'moment';
import {WebServiceBasedComponentHelper} from '../../web-service-based-component-helper';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {TaskService} from '../../../service/task.service';
import {TaskCommentService} from '../../../service/task-comment.service';
import {I18nService} from '../../../service/i18n.service';
import {TaskComment} from '../../../model/task-comment';
import {PageRequest} from '../../../service/page-request';
import {Strings} from '../../../util/strings';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.styl']
})
export class TaskCommentsComponent implements OnInit {
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

  constructor(private componentHelper: WebServiceBasedComponentHelper,
              private taskService: TaskService,
              private commentService: TaskCommentService,
              private i18nService: I18nService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.setNewCommentFormModel(new TaskComment());
    this.taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getComments(this.taskId, this.pageRequest).subscribe(
      comments => this.comments = comments,
      errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse)
    );
  }

  onNewCommentModelChange() {
    this.newCommentFormEnabled = !Strings.isBlank(this.newCommentFormModel.commentText);
  }

  onEditCommentModelChange() {
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
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('delete_comment_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
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
    this.taskService.getComments(this.taskId, this.pageRequest).subscribe(
      comments => this.comments = this.comments.concat(comments),
      errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse)
    );
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
      this.taskService.addComment(this.taskId, comment).subscribe(createdComment => {
        this.comments.unshift(createdComment);
        this.newCommentForm.resetForm();
      }, errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse));
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
      }, errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse));
    }
  }

  private deleteComment(comment: TaskComment) {
    this.commentService.deleteComment(comment).subscribe(() => {
      this.comments = this.comments.filter(e => e.id !== comment.id);
    }, errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse));
  }
}
