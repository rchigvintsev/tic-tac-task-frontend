import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';

export class Task extends AbstractEntity<Task> {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  deadline: Date;

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.description = input.description;
    this.completed = input.completed;
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
      completed: this.completed,
      deadline: moment(this.deadline).utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    };
  }

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.title = this.title;
    clone.description = this.description;
    clone.completed = this.completed;
    clone.deadline = this.deadline;
    return clone;
  }

  equals(other: Task): boolean {
    return this.id === other.id
      && this.title === other.title
      && this.description === other.description
      && this.completed === other.completed
      && this.deadline === other.deadline;
  }
}
