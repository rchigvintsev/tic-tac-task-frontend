import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import * as moment from 'moment';

import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

import {GetTasksRequest, TaskService} from '../../../../service/task.service';
import {PageRequest} from '../../../../service/page-request';
import {Task} from '../../../../model/task';
import {TaskStatus} from '../../../../model/task-status';
import {DateTimeUtils} from '../../../../util/time/date-time-utils';
import {WeekDay} from '../../../../util/time/week-day';

@Component({
  selector: 'app-task-list-for-week',
  templateUrl: './task-list-for-week.component.html',
  styleUrls: ['./task-list-for-week.component.scss']
})
export class TaskListForWeekComponent implements OnInit, OnDestroy {
  @Input()
  loading: boolean;

  taskGroups: TaskGroup[];

  private componentDestroyed = new Subject<boolean>();

  constructor(private taskService: TaskService) {
  }

  private static getTaskGroupName(i: number, dayNumber: number): string {
    return i === 0 ? 'today' : (i === 1 ? 'tomorrow' : WeekDay.forNumber(dayNumber).name.toLowerCase());
  }

  ngOnInit() {
    this.initTaskGroups();
    // Subscribe to task update events in order to refresh task list after task is dragged and dropped to another group
    this.taskService.getUpdatedTask()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(task => this.onTaskUpdate(task));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  private initTaskGroups() {
    let dayNumber = DateTimeUtils.weekDay();

    this.taskGroups = [];
    for (let i = 0; i < 7; i++, dayNumber++) {
      if (dayNumber === 8) {
        dayNumber = 1;
      }
      this.taskGroups[i] = this.createTaskGroup(i, dayNumber);
    }
  }

  private createTaskGroup(i: number, dayNumber: number): TaskGroup {
    const taskRequest = new GetTasksRequest();
    taskRequest.statuses = [TaskStatus.PROCESSED];
    if (i === 0) {
      taskRequest.statuses.push(TaskStatus.COMPLETED);
      taskRequest.deadlineTo = DateTimeUtils.endOfToday();
      taskRequest.completedAtFrom = DateTimeUtils.startOfToday();
    } else {
      taskRequest.deadlineFrom = moment().add(i, 'day').startOf('day').toDate();
      taskRequest.deadlineTo = moment().add(i, 'day').endOf('day').toDate();
    }
    return new TaskGroup(TaskListForWeekComponent.getTaskGroupName(i, dayNumber), taskRequest, this.taskService);
  }

  private onTaskUpdate(updatedTask: Task) {
    for (const taskGroup of this.taskGroups) {
      const index = taskGroup.tasks.findIndex(task => task.id === updatedTask.id);
      if (index >= 0) {
        this.reloadTasks();
        break;
      }
    }
  }

  private reloadTasks() {
    this.taskGroups.forEach(taskGroup => taskGroup.reloadTasks());
  }
}

class TaskGroup {
  tasks: Task[] = [];
  size: number;
  pageRequest = new PageRequest();

  constructor(public name: string, private taskRequest: GetTasksRequest, private taskService: TaskService) {
    this.reloadTasks();
  }

  reloadTasks() {
    this.taskService.getTaskCount(this.taskRequest).subscribe({
      next: taskCount => {
        this.size = taskCount;
        if (taskCount > 0) {
          this.taskService.getTasks(this.taskRequest, this.pageRequest, false)
            .subscribe(tasks => this.tasks = tasks);
        }
      }
    })
  }
}
