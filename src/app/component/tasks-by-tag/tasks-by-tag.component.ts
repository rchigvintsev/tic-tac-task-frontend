import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {Subject} from 'rxjs';
import {flatMap, map, takeUntil} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {ColorPickerDialogComponent} from '../color-picker-dialog/color-picker-dialog.component';
import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TagService} from '../../service/tag.service';
import {PageRequest} from '../../service/page-request';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {Task} from '../../model/task';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-tasks-by-tag',
  templateUrl: './tasks-by-tag.component.html',
  styleUrls: ['./tasks-by-tag.component.styl']
})
export class TasksByTagComponent extends WebServiceBasedComponent implements OnInit, OnDestroy {
  titleEditing = false;
  tagFormModel: Tag;
  tasks: Array<Task>;

  @ViewChild('title')
  titleElement: ElementRef;

  private tag: Tag;
  private pageRequest = new PageRequest();
  private componentDestroyed = new Subject<boolean>();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private tagService: TagService,
              private dialog: MatDialog) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(tagId => this.tagService.getTag(tagId)),
      flatMap(tag => {
        this.setTagModel(tag);
        return this.tagService.getUncompletedTasks(tag.id, this.pageRequest);
      })
    ).subscribe(tasks => this.onTasksLoad(tasks), this.onServiceCallError.bind(this));
    this.tagService.getDeletedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => {
        if (this.tag && this.tag.id === tag.id) {
          this.router.navigate([this.translate.currentLang, 'task'], {fragment: TaskGroup.TODAY.value}).then();
        }
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    this.endTitleEditing();
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

  private setTagModel(tag: Tag) {
    this.tagFormModel = tag;
    this.tag = tag.clone();
  }

  private onTasksLoad(tasks: Task[]) {
    this.tasks = tasks;
  }

  private saveTag() {
    if (Strings.isBlank(this.tagFormModel.name)) {
      this.tagFormModel.name = this.tag.name;
    }

    if (!this.tagFormModel.equals(this.tag)) {
      this.tagService.updateTag(this.tagFormModel)
        .subscribe(savedTag => this.setTagModel(savedTag), this.onServiceCallError.bind(this));
    }
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tagFormModel).subscribe(_ => {}, this.onServiceCallError.bind(this));
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.saveTag();
    this.titleEditing = false;
  }
}
