import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as moment from 'moment';

import {I18nService} from '../../../service/i18n.service';
import {Task} from '../../../model/task';
import {TaskGroup} from '../../../model/task-group';
import {TaskStatus} from '../../../model/task-status';
import {TaskGroupService} from '../../../service/task-group.service';
import {TaskService} from '../../../service/task.service';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {HttpRequestError} from '../../../error/http-request.error';
import {PathMatcher} from '../../../util/path-matcher';
import {Dates} from '../../../util/dates';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.scss']
})
export class SidenavMenuComponent implements OnInit, OnDestroy {
  TaskGroup = TaskGroup;

  todayDate = moment().date();
  tomorrowDate = moment().add(1, 'days').date();

  private selectedTaskGroup;
  private pathMatcher: PathMatcher;
  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              private taskGroupService: TaskGroupService,
              private taskService: TaskService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private router: Router) {
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
    this.taskService.resetTaskCounters();
  }

  isRouterLinkActive(path: string, fragment: string = null): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path, fragment);
  }

  isFocused(path: string, fragment: string = null): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path, fragment);
  }

  hasTasks(taskGroup: TaskGroup): Observable<boolean> {
    return this.taskService.hasTasks(taskGroup);
  }

  getTaskCount(taskGroup: TaskGroup): Observable<number> {
    return this.taskService.getTaskCount(taskGroup);
  }

  onListItemClick(taskGroup: TaskGroup = null) {
    if (taskGroup) {
      this.setSelectedTaskGroup(taskGroup);
    }
  }

  onListItemDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  onDrop(event: CustomEvent, taskGroup: TaskGroup) {
    event.preventDefault();
    if (event.detail instanceof Task) {
      this.moveTaskToGroup(event.detail, taskGroup);
    }
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup, false);
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private setSelectedTaskGroup(taskGroup: TaskGroup, sendNotification: boolean = true) {
    if (this.selectedTaskGroup !== taskGroup) {
      this.selectedTaskGroup = taskGroup;
      if (sendNotification) {
        this.taskGroupService.notifyTaskGroupSelected(taskGroup);
      }
    }
  }

  private moveTaskToGroup(task: Task, taskGroup: TaskGroup) {
    switch (taskGroup) {
      case TaskGroup.INBOX:
        task.deadline = null;
        task.status = TaskStatus.UNPROCESSED;
        break;
      case TaskGroup.TODAY:
        task.deadline = Dates.endOfToday();
        task.status = TaskStatus.PROCESSED;
        break;
      case TaskGroup.TOMORROW:
        task.deadline = Dates.endOfTomorrow();
        task.status = TaskStatus.PROCESSED;
        break;
      case TaskGroup.WEEK:
        task.deadline = Dates.endOfWeek();
        task.status = TaskStatus.PROCESSED;
        break;
      case TaskGroup.SOME_DAY:
        task.deadline = null;
        task.status = TaskStatus.PROCESSED;
        break;
      default:
        throw new Error('Unsupported task group: ' + taskGroup);
    }

    task.deadlineTimeExplicitlySet = false;
    this.taskService.updateTask(task).subscribe(_ => this.taskService.updateTaskCounters(),
      (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
  }
}
