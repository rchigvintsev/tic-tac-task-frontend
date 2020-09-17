import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Tag} from './tag';
import {Objects} from '../util/objects';

export class Task extends AbstractEntity<Task> {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: Date;
  deadlineTimeExplicitlySet = false;
  tags: Tag[] = [];

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.description = input.description;
    this.status = input.status;
    if (input.deadline) {
      this.deadline = moment.utc(input.deadline, moment.HTML5_FMT.DATETIME_LOCAL).local().toDate();
    }
    this.deadlineTimeExplicitlySet = input.deadlineTimeExplicitlySet;
    if (input.tags) {
      const tags = [];
      for (const tag of input.tags) {
        tags.push(new Tag().deserialize(tag));
      }
      this.tags = tags;
    }
    return this;
  }

  serialize(): any {
    const tags = [];
    for (const tag of this.tags) {
      tags.push(tag.serialize());
    }
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      deadline: this.deadline ? moment(this.deadline).utc().format(moment.HTML5_FMT.DATETIME_LOCAL) : null,
      deadlineTimeExplicitlySet: this.deadlineTimeExplicitlySet,
      tags
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.title = this.title;
    clone.description = this.description;
    clone.status = this.status;
    clone.deadline = this.deadline != null ? new Date(this.deadline.getTime()) : null;
    clone.deadlineTimeExplicitlySet = this.deadlineTimeExplicitlySet;
    clone.tags = this.tags.slice();
    return clone;
  }

  equals(other: Task): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.title, other.title)
      && Objects.equals(this.description, other.description)
      && Objects.equals(this.status, other.status)
      && Objects.equals(this.deadline, other.deadline)
      && Objects.equals(this.deadlineTimeExplicitlySet, other.deadlineTimeExplicitlySet)
      && Objects.equals(this.tags, other.tags);
  }

  isOverdue(): boolean {
    if (this.deadline == null) {
      return false;
    }
    return moment().isAfter(this.deadline, 'days');
  }
}
