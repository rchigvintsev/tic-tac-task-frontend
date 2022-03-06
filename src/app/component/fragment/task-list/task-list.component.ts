import {Component, EventEmitter, Input, Output} from '@angular/core';

import {IInfiniteScrollEvent} from 'ngx-infinite-scroll/models';

import {Task} from '../../../model/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input()
  tasks: Array<Task>;
  @Input()
  loading: boolean;

  @Output()
  scrolled = new EventEmitter<IInfiniteScrollEvent>();

  onTaskListScroll(event: IInfiniteScrollEvent) {
    this.scrolled.next(event);
  }
}
