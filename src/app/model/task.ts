import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Task extends AbstractEntity<Task> {
  id: number;
  taskListId: number;
  title: string;
  description: string;
  status: string;
  deadline: Date;
  deadlineTimeExplicitlySet = false;

  deserialize(input: any): Task {
    this.id = input.id;
    this.taskListId = input.taskListId;
    this.title = input.title;
    this.description = input.description;
    this.status = input.status;
    if (input.deadline) {
      this.deadline = moment.utc(input.deadline, moment.HTML5_FMT.DATETIME_LOCAL).local().toDate();
    }
    this.deadlineTimeExplicitlySet = input.deadlineTimeExplicitlySet;
    return this;
  }

  serialize(): any {
    return {
      id: this.id,
      taskListId: this.taskListId,
      title: this.title,
      description: this.description,
      status: this.status,
      deadline: this.deadline ? moment(this.deadline).utc().format(moment.HTML5_FMT.DATETIME_LOCAL) : null,
      deadlineTimeExplicitlySet: this.deadlineTimeExplicitlySet
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.taskListId = this.taskListId;
    clone.title = this.title;
    clone.description = this.description;
    clone.status = this.status;
    clone.deadline = this.deadline != null ? new Date(this.deadline.getTime()) : null;
    clone.deadlineTimeExplicitlySet = this.deadlineTimeExplicitlySet;
    return clone;
  }

  equals(other: Task): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.taskListId, other.taskListId)
      && Objects.equals(this.title, other.title)
      && Objects.equals(this.description, other.description)
      && Objects.equals(this.status, other.status)
      && Objects.equals(this.deadline, other.deadline)
      && Objects.equals(this.deadlineTimeExplicitlySet, other.deadlineTimeExplicitlySet);
  }

  isOverdue(): boolean {
    if (this.deadline == null) {
      return false;
    }
    return moment().isAfter(this.deadline, 'minutes');
  }
}
