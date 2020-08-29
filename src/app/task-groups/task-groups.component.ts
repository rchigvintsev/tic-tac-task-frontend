import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';
import {Observable} from 'rxjs';

import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TaskService} from '../service/task.service';

@Component({
  selector: 'app-task-groups',
  templateUrl: './task-groups.component.html',
  styleUrls: ['./task-groups.component.styl']
})
export class TaskGroupsComponent implements OnInit {
  TaskGroup = TaskGroup;

  todayDate = moment().date();
  tomorrowDate = moment().add(1, 'days').date();

  private selectedTaskGroup;

  constructor(public translate: TranslateService,
              private taskGroupService: TaskGroupService,
              private taskService: TaskService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
  }

  isTaskGroupSelected(taskGroup: TaskGroup): boolean {
    return this.selectedTaskGroup === taskGroup;
  }

  hasTasks(taskGroup: TaskGroup): Observable<boolean> {
    return this.taskService.hasTasks(taskGroup);
  }

  getTaskCount(taskGroup: TaskGroup): Observable<number> {
    return this.taskService.getTaskCount(taskGroup);
  }

  onListItemClick(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup);
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup, false);
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
