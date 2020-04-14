import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

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

  private selectedTaskGroup = TaskGroup.INBOX;

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private taskGroupService: TaskGroupService) {
  }

  ngOnInit() {
    this.taskGroupService.notifyTaskGroupSelected(this.selectedTaskGroup);
    this.route.fragment.subscribe((fragment: string) => this.onUrlFragmentChange(fragment));
  }

  anchorFor(taskGroup: TaskGroup) {
    return `/${this.translate.currentLang}#${taskGroup.value}`;
  }

  isTaskGroupSelected(taskGroup: TaskGroup) {
    return this.selectedTaskGroup === taskGroup;
  }

  onListItemClick(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup);
  }

  onUrlFragmentChange(fragment: string) {
    if (fragment) {
      let taskGroup = TaskGroup.valueOf(fragment);
      if (!taskGroup) {
        taskGroup = TaskGroup.TODAY;
      }
      this.setSelectedTaskGroup(taskGroup);
    }
  }

  private setSelectedTaskGroup(taskGroup: TaskGroup) {
    if (this.selectedTaskGroup !== taskGroup) {
      this.selectedTaskGroup = taskGroup;
      this.taskGroupService.notifyTaskGroupSelected(taskGroup);
    }
  }
}
