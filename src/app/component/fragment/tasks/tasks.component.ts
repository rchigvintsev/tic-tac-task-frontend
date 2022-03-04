import {Component, EventEmitter, Input, Output} from '@angular/core';

import {IInfiniteScrollEvent} from 'ngx-infinite-scroll/models';

import {Task} from '../../../model/task';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
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
