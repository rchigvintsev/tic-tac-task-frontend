import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {map} from 'rxjs/operators';
import {IInfiniteScrollEvent} from 'ngx-infinite-scroll';

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
import {Task} from '../../model/task';
import {PageRequest} from '../../service/page-request';
import {ResourceNotFoundError} from '../../error/resource-not-found.error';

@Component({
  selector: 'app-tag-tasks',
  templateUrl: './tag-tasks.component.html',
  styleUrls: ['./tag-tasks.component.scss']
})
export class TagTasksComponent implements OnInit {
  tasks: Array<Task>;
  loading: boolean;
  loaded: boolean;

  tagFormModel = new Tag();

  @ViewChild('titleInput')
  titleElement: ElementRef;
  titleEditing = false;

  private tag: Tag;
  private pageRequest = new PageRequest();

  constructor(private i18nService: I18nService,
              private taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private tagService: TagService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.loaded = false;
    this.route.params.pipe(map(params => +params.id)).subscribe(tagId => this.onTagIdChange(tagId));
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.tagFormModel.name)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.tagFormModel.name = this.tag.name;
    this.endTitleEditing();
  }

  onTaskListScroll(_?: IInfiniteScrollEvent) {
    this.loadNextPage();
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

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.titleEditing = false;
    if (!Strings.isBlank(this.tagFormModel.name)) {
      this.saveTag();
    }
  }

  private onTagIdChange(tagId: number) {
    this.loading = true;
    this.tagService.getTag(tagId, false).subscribe({
      next: tag => this.onTagLoad(tag),
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private onTagLoad(tag: Tag) {
    this.tag = tag;
    this.tagFormModel = tag.clone();
    this.reloadTasks();
  }

  private saveTag() {
    if (!this.tagFormModel.equals(this.tag)) {
      this.tagService.updateTag(this.tagFormModel).subscribe({
        next: tag => {
          this.tag = tag;
          this.tagFormModel = tag.clone();
          this.httpResponseHandler.handleSuccess(this.i18nService.translate('tag_saved'));
        },
        error: (error: HttpRequestError) => this.onHttpRequestError(error)
      });
    }
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tagFormModel).subscribe({
      next: _ => {
        this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY).then();
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('tag_deleted'));
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private reloadTasks() {
    this.pageRequest.page = 0;
    this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest, false).subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.loading = false;
        this.loaded = true;
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private loadNextPage() {
    this.loading = true;
    this.pageRequest.page++;

    this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest, false).subscribe({
      next: tasks => {
        this.tasks = this.tasks.concat(tasks);
        this.loading = false;
      },
      error: (error: HttpRequestError) => this.onHttpRequestError(error)
    });
  }

  private onHttpRequestError(error: HttpRequestError) {
    this.loading = false;
    if (error instanceof ResourceNotFoundError) {
      this.pageNavigationService.navigateToNotFoundErrorPage().then();
    } else {
      this.httpResponseHandler.handleError(error);
    }
  }
}
