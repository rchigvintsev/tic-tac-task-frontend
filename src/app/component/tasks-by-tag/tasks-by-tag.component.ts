import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {Subject} from 'rxjs';
import {flatMap, map, takeUntil} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TagService} from '../../service/tag.service';
import {PageRequest} from '../../service/page-request';
import {TaskGroup} from '../../model/task-group';
import {Tag} from '../../model/tag';
import {Task} from '../../model/task';

@Component({
  selector: 'app-tasks-by-tag',
  templateUrl: './tasks-by-tag.component.html',
  styleUrls: ['./tasks-by-tag.component.styl']
})
export class TasksByTagComponent extends WebServiceBasedComponent implements OnInit, OnDestroy {
  title: string;
  tasks: Array<Task>;

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
        this.onTagLoad(tag);
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

  onTaskListScroll() {
    if (this.tag) {
      this.pageRequest.page++;
      this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
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
      if (result) {
        this.deleteTag();
      }
    });
  }

  private onTagLoad(tag: Tag) {
    this.tag = tag;
    this.title = tag.name;
  }

  private onTasksLoad(tasks: Task[]) {
    this.tasks = tasks;
  }

  private deleteTag() {
    this.tagService.deleteTag(this.tag).subscribe(_ => {}, this.onServiceCallError.bind(this));
  }
}
