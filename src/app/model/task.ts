import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Tag} from './tag';
import {Objects} from '../util/objects';

export class Task extends AbstractEntity<Task> {
  id: number;
  title: string;
  description: string;
  status: string;
  deadlineDate: Date;
  deadlineTime: Date;
  tags: Tag[] = [];

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.description = input.description;
    this.status = input.status;
    if (input.deadlineDate) {
      this.deadlineDate = moment.utc(input.deadlineDate, moment.HTML5_FMT.DATE)
        .endOf('day')
        .local()
        .startOf('day')
        .toDate();
    }
    if (input.deadlineTime) {
      this.deadlineTime = moment(input.deadlineTime, moment.HTML5_FMT.TIME).toDate();
    }
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
      deadlineDate: this.deadlineDate ? moment(this.deadlineDate).utc().format(moment.HTML5_FMT.DATE) : null,
      deadlineTime: this.deadlineTime ? moment(this.deadlineTime).utc().format(moment.HTML5_FMT.TIME) : null,
      tags
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.title = this.title;
    clone.description = this.description;
    clone.status = this.status;
    clone.deadlineDate = this.deadlineDate != null ? new Date(this.deadlineDate.getTime()) : null;
    clone.deadlineTime = this.deadlineTime != null ? new Date(this.deadlineTime.getTime()) : null;
    clone.tags = this.tags.slice();
    return clone;
  }

  equals(other: Task): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.title, other.title)
      && Objects.equals(this.description, other.description)
      && Objects.equals(this.status, other.status)
      && Objects.equals(this.deadlineDate, other.deadlineDate)
      && Objects.equals(this.deadlineTime, other.deadlineTime)
      && Objects.equals(this.tags, other.tags);
  }

  isOverdue(): boolean {
    if (this.deadlineDate == null) {
      return false;
    }
    return moment().isAfter(this.deadlineDate, 'days');
  }
}
