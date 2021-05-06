import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as moment from 'moment';

import {I18nService} from '../../../service/i18n.service';
import {TaskGroup} from '../../../model/task-group';
import {TaskGroupService} from '../../../service/task-group.service';
import {TaskService} from '../../../service/task.service';
import {PathMatcher} from '../../../util/path-matcher';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.styl']
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
              private router: Router,
              private cdr: ChangeDetectorRef) {
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

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup, false);
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private setSelectedTaskGroup(taskGroup: TaskGroup, sendNotification: boolean = true) {
    if (this.selectedTaskGroup !== taskGroup) {
      this.selectedTaskGroup = taskGroup;
      this.cdr.detectChanges();
      if (sendNotification) {
        this.taskGroupService.notifyTaskGroupSelected(taskGroup);
      }
    }
  }
}
