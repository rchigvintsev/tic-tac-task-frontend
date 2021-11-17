import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MediaMatcher} from '@angular/cdk/layout';

import {map, mergeMap, tap} from 'rxjs/operators';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../fragment/color-picker-dialog/color-picker-dialog.component';
import {I18nService} from '../../service/i18n.service';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-tag-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.scss']
})
export class TagTasksComponent extends BaseTasksComponent implements OnInit {
  tagFormModel = new Tag();

  private tag: Tag;

  constructor(i18nService: I18nService,
              taskService: TaskService,
              pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) httpResponseHandler: HttpResponseHandler,
              media: MediaMatcher,
              private tagService: TagService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    super(i18nService, taskService, pageNavigationService, httpResponseHandler, media);
    this.titlePlaceholder = 'tag_name';
    this.titleMaxLength = 50;
    this.taskListMenuItems = [
      new MenuItem('change_color', this.onChangeColorButtonClick.bind(this)),
      new MenuItem('delete', this.onDeleteTagButtonClick.bind(this))
    ];
  }

  ngOnInit() {
    this.route.params.pipe(map(params => +params.id)).subscribe(tagId => this.onTagIdChange(tagId));
  }

  onTitleInputEscapeKeydown() {
    if (this.tag) {
      this.title = this.tag.name;
    }
    super.onTitleInputEscapeKeydown();
  }

  onTaskListScroll() {
    if (this.tag) {
      this.beforeTasksLoad();
      this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest, false).subscribe(
        tasks => this.afterTasksLoad(tasks),
        (error: HttpRequestError) => this.onHttpRequestError(error)
      );
    }
  }

  onChangeColorButtonClick() {
    const title = this.i18nService.translate('tag_color');
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '248px',
      restoreFocus: false,
      data: {title, color: this.tag.color}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.tagFormModel.color = result.color;
        this.saveTag();
      }
    });
  }

  onDeleteTagButtonClick() {
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('delete_tag_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.deleteTag();
      }
    });
  }

  protected onTitleEditingEnd() {
    if (!Strings.isBlank(this.title) && this.tagFormModel.name !== this.title) {
      this.tagFormModel.name = this.title;
      this.saveTag();
    }
  }

  private onTagIdChange(tagId: number) {
    this.pageRequest.page = 0;
    this.tagService.getTag(tagId).pipe(
      tap(tag => this.onTagLoad(tag)),
      mergeMap(tag => this.tagService.getUncompletedTasks(tag.id, this.pageRequest, false))
    ).subscribe(tasks => this.tasks = tasks, (error: HttpRequestError) => this.onHttpRequestError(error));
  }

  private onTagLoad(tag: Tag) {
    this.tag = tag;
    this.tagFormModel = tag.clone();
    this.title = tag.name;
  }

  private saveTag() {
    if (!this.tagFormModel.equals(this.tag)) {
      this.tagService.updateTag(this.tagFormModel).subscribe(
        savedTag => {
          this.onTagLoad(savedTag);
          this.httpResponseHandler.handleSuccess(this.i18nService.translate('tag_saved'));
        },
        (error: HttpRequestError) => this.onHttpRequestError(error)
      );
    }
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tagFormModel).subscribe(
      _ => {
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('tag_deleted'));
      },
      (error: HttpRequestError) => this.onHttpRequestError(error)
    );
  }
}
