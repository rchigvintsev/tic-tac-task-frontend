import {Injectable, Optional} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';

import {TaskGroup} from '../model/task-group';

@Injectable()
export class TaskGroupService {
  private readonly selectedTaskGroupSource: BehaviorSubject<TaskGroup>;
  private readonly selectedTaskGroup: Observable<TaskGroup>;

  constructor(@Optional() taskGroup: TaskGroup = null) {
    this.selectedTaskGroupSource  = new BehaviorSubject<TaskGroup>(taskGroup);
    this.selectedTaskGroup = this.selectedTaskGroupSource.asObservable();
  }

  getSelectedTaskGroup(): Observable<TaskGroup> {
    return this.selectedTaskGroup;
  }

  notifyTaskGroupSelected(taskGroup: TaskGroup) {
    this.selectedTaskGroupSource.next(taskGroup);
  }
}
