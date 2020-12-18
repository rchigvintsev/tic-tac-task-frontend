import {Component, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgForm} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';

import {TaskList} from '../../../model/task-list';
import {TaskListService} from '../../../service/task-list.service';
import {AuthenticationService} from '../../../service/authentication.service';
import {LogService} from '../../../service/log.service';
import {WebServiceBasedComponent} from '../../web-service-based.component';
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

  private pathMatcher: PathMatcher;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private taskListService: TaskListService) {
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

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTaskListFormModelNameChange() {
    this.taskListFormSubmitEnabled = !Strings.isBlank(this.taskListFormModel.name);
  }

  onTaskListFormSubmit() {
    this.createTaskList(this.taskListFormModel);
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
}
