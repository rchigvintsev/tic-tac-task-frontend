import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';
import {Observable} from 'rxjs';

import {TaskGroup} from '../../service/task-group';
import {TaskGroupService} from '../../service/task-group.service';
import {TaskService} from '../../service/task.service';
import {PathMatcher} from '../../util/path-matcher';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.styl']
})
export class SidenavMenuComponent implements OnInit {
  TaskGroup = TaskGroup;

  todayDate = moment().date();
  tomorrowDate = moment().add(1, 'days').date();

  private selectedTaskGroup;
  private pathMatcher: PathMatcher;

  constructor(public translate: TranslateService,
              private taskGroupService: TaskGroupService,
              private taskService: TaskService,
              private router: Router,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
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
