import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map} from 'rxjs/operators';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../fragment/color-picker-dialog/color-picker-dialog.component';
import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {I18nService} from '../../service/i18n.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {Strings} from '../../util/strings';
import {HttpErrors} from '../../util/http-errors';

@Component({
  selector: 'app-tag-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TagTasksComponent extends BaseTasksComponent implements OnInit {
  tagFormModel = new Tag();

  private tag: Tag;

  constructor(i18nService: I18nService,
              componentHelper: WebServiceBasedComponentHelper,
              taskService: TaskService,
              private pageNavigationService: PageNavigationService,
              private route: ActivatedRoute,
              private tagService: TagService,
              private dialog: MatDialog) {
    super(i18nService, taskService, componentHelper);
    this.titlePlaceholder = 'tag_name';
    this.titleMaxLength = 50;
    this.taskListMenuItems = [
      new MenuItem('change_color', this.onChangeColorButtonClick.bind(this)),
      new MenuItem('delete', this.onDeleteTagButtonClick.bind(this))
    ];
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(tagId => this.tagService.getTag(tagId)),
      flatMap(tag => {
        this.setTag(tag);
        return this.tagService.getUncompletedTasks(tag.id, this.pageRequest);
      })
    ).subscribe(tasks => this.tasks = tasks, errorResponse => {
      if (HttpErrors.isNotFound(errorResponse)) {
        this.pageNavigationService.navigateToNotFoundErrorPage();
      } else {
        const messageToDisplay = this.i18nService.translate('failed_to_load_tasks');
        this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
      }
    });
  }

  onTitleInputEscapeKeydown() {
    if (this.tag) {
      this.title = this.tag.name;
    }
    super.onTitleInputEscapeKeydown();
  }

  onTaskListScroll() {
    if (this.tag) {
      this.pageRequest.page++;
      this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest).subscribe(
        tasks => this.tasks = this.tasks.concat(tasks),
        errorResponse => {
          const messageToDisplay = this.i18nService.translate('failed_to_load_tasks');
          this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
        }
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
    if (!Strings.isBlank(this.title)) {
      this.tagFormModel.name = this.title;
      this.saveTag();
    }
  }

  private setTag(tag: Tag) {
    this.tag = tag;
    this.tagFormModel = tag.clone();
    this.title = tag.name;
  }

  private saveTag() {
    if (!this.tagFormModel.equals(this.tag)) {
      this.tagService.updateTag(this.tagFormModel).subscribe(
        savedTag => this.setTag(savedTag),
        errorResponse => {
          const messageToDisplay = this.i18nService.translate('failed_to_save_tag');
          this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
        }
      );
    }
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tagFormModel).subscribe(
      _ => this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY),
      errorResponse => {
        const messageToDisplay = this.i18nService.translate('failed_to_delete_tag');
        this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
      }
    );
  }
}
