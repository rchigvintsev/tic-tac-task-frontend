import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {TaskRecurrenceStrategy} from './task-recurrence-strategy';
import {Objects} from '../util/objects';
import {TaskStatus} from './task-status';
import {DateTimeUtils} from '../util/time/date-time-utils';

export class Task extends AbstractEntity {
  id: number;
  taskListId: number;
  title: string;
  description: string;
  status: string;
  deadlineDate: Date;
  deadlineDateTime: Date;
  recurrenceStrategy: TaskRecurrenceStrategy;

  deserialize(input: any): Task {
    this.id = input.id;
    this.taskListId = input.taskListId;
    this.title = input.title;
    this.description = input.description;
    this.status = input.status;
    this.deadlineDate = DateTimeUtils.parseDate(input.deadlineDate);
    this.deadlineDateTime = DateTimeUtils.parseDateTime(input.deadlineDateTime);
    if (input.recurrenceStrategy) {
      this.recurrenceStrategy = TaskRecurrenceStrategy.create(input.recurrenceStrategy);
    }
    return this;
  }

  serialize(): any {
    return {
      id: this.id,
      taskListId: this.taskListId,
      title: this.title,
      description: this.description,
      status: this.status,
      deadlineDate: DateTimeUtils.formatDate(this.deadlineDate),
      deadlineDateTime: DateTimeUtils.formatDateTime(this.deadlineDateTime),
      recurrenceStrategy: this.recurrenceStrategy ? this.recurrenceStrategy.serialize() : null
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.taskListId = this.taskListId;
    clone.title = this.title;
    clone.description = this.description;
    clone.status = this.status;
    clone.deadlineDate = this.deadlineDate != null ? new Date(this.deadlineDate.getTime()) : null;
    clone.deadlineDateTime = this.deadlineDateTime != null ? new Date(this.deadlineDateTime.getTime()) : null;
    clone.recurrenceStrategy = this.recurrenceStrategy;
    return clone;
  }

  equals(other: Task): boolean {
    if (!other) {
      return false;
    }
    return Objects.equal(this.id, other.id)
      && Objects.equal(this.taskListId, other.taskListId)
      && Objects.equal(this.title, other.title)
      && Objects.equal(this.description, other.description)
      && Objects.equal(this.status, other.status)
      && Objects.equal(this.deadlineDate, other.deadlineDate)
      && Objects.equal(this.deadlineDateTime, other.deadlineDateTime)
      && Objects.equal(this.recurrenceStrategy, other.recurrenceStrategy);
  }

  isOverdue(): boolean {
    if (!this.deadlineDate && !this.deadlineDateTime) {
      return false;
    }
    return this.deadlineDate ? moment().isAfter(this.deadlineDate, 'days') : moment().isAfter(this.deadlineDateTime, 'minutes');
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED
  }
}
