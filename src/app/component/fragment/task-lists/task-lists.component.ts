import {Component, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';

import {TranslateService} from '@ngx-translate/core';

import {TaskList} from '../../../model/task-list';
import {TaskListService} from '../../../service/task-list.service';
import {AuthenticationService} from '../../../service/authentication.service';
import {LogService} from '../../../service/log.service';
import {WebServiceBasedComponent} from '../../web-service-based.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {PathMatcher} from '../../../util/path-matcher';
import {Strings} from '../../../util/strings';

@Component({
  selector: 'app-task-lists',
  templateUrl: './task-lists.component.html',
  styleUrls: ['./task-lists.component.styl']
})
export class TaskListsComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('taskListForm')
  taskListForm: NgForm;
  taskListFormModel = new TaskList();
  taskListFormSubmitEnabled = false;

  taskLists: TaskList[];
  taskListMenuOpened: boolean;

  private selectedTaskList: TaskList;
  private pathMatcher: PathMatcher;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private taskListService: TaskListService,
              private dialog: MatDialog) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.taskListService.getUncompletedTaskLists()
      .subscribe(taskLists => this.taskLists = taskLists, this.onServiceCallError.bind(this));
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  isTaskListSelected(taskList: TaskList): boolean {
    return this.selectedTaskList && this.selectedTaskList.id === taskList.id;
  }

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTaskListFormModelNameChange() {
    this.taskListFormSubmitEnabled = !Strings.isBlank(this.taskListFormModel.name);
  }

  onTaskListFormSubmit() {
    this.createTaskList(this.taskListFormModel);
  }

  onTaskListListItemMouseOver(taskList: TaskList) {
    this.selectedTaskList = taskList;
  }

  onTaskListListItemMouseOut() {
    if (!this.taskListMenuOpened) {
      this.selectedTaskList = null;
    }
  }

  onTaskListMenuOpened() {
    this.taskListMenuOpened = true;
  }

  onTaskListMenuClosed() {
    this.taskListMenuOpened = false;
    this.selectedTaskList = null;
  }

  onDeleteTaskListButtonClick(taskList: TaskList) {
    const title = this.translate.instant('attention');
    const content = this.translate.instant('delete_task_list_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.deleteTaskList(taskList);
      }
    });
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private createTaskList(taskList: TaskList) {
    if (!Strings.isBlank(taskList.name)) {
      this.taskListService.createTaskList(taskList).subscribe(createdTaskList => {
        this.taskLists.unshift(createdTaskList);
        this.taskListForm.resetForm();
      }, this.onServiceCallError.bind(this));
    }
  }

  private deleteTaskList(taskList: TaskList) {
    this.taskListService.deleteTaskList(taskList).subscribe(_ => {
      this.taskLists = this.taskLists.filter(tl => tl.id !== taskList.id);
    }, this.onServiceCallError.bind(this));
  }
}
