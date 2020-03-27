import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Task extends AbstractEntity<Task> {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: Date;

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.description = input.description;
    this.status = input.status;
    if (input.deadline) {
      this.deadline = moment.utc(input.deadline, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    }
    return this;
  }

  serialize(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      deadline: this.deadline ? moment(this.deadline).utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS) : null
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.title = this.title;
    clone.description = this.description;
    clone.status = this.status;
    clone.deadline = this.deadline;
    return clone;
  }

  equals(other: Task): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.title, other.title)
      && Objects.equals(this.description, other.description)
      && Objects.equals(this.status, other.status)
      && Objects.equals(this.deadline, other.deadline);
  }
}
