import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';

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
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
  }

  isTaskGroupSelected(taskGroup: TaskGroup) {
    return this.selectedTaskGroup === taskGroup;
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
