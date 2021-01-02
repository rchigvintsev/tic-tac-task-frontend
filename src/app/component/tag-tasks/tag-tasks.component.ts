import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../fragment/color-picker-dialog/color-picker-dialog.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TagService} from '../../service/tag.service';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-tag-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TagTasksComponent extends BaseTasksComponent implements OnInit {
  tagFormModel = new Tag();

  private tag: Tag;

  constructor(router: Router,
              private route: ActivatedRoute,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              taskService: TaskService,
              private tagService: TagService,
              private dialog: MatDialog) {
    super(router, translate, authenticationService, log, taskService);
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
    ).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
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
      this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }

  onChangeColorButtonClick() {
    const title = this.translate.instant('tag_color');
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
    const title = this.translate.instant('attention');
    const content = this.translate.instant('delete_tag_question');
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
      this.tagService.updateTag(this.tagFormModel)
        .subscribe(savedTag => this.setTag(savedTag), this.onServiceCallError.bind(this));
    }
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tagFormModel)
      .subscribe(_ => this.navigateToTodayTaskGroupPage(), this.onServiceCallError.bind(this));
  }

  private navigateToTodayTaskGroupPage() {
    this.router.navigate([this.translate.currentLang, 'task'], {fragment: TaskGroup.TODAY.value}).then();
  }
}
