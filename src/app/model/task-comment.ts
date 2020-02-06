import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';

export class TaskComment extends AbstractEntity<TaskComment> {
  id: number;
  taskId: number;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(other: TaskComment = null) {
    super();
    if (other) {
      this.id = other.id;
      this.taskId = other.taskId;
      this.commentText = other.commentText;
      this.createdAt = other.createdAt;
      this.updatedAt = other.updatedAt;
    }
  }

  deserialize(input: any): TaskComment {
    this.id = input.id;
    this.taskId = input.taskId;
    this.commentText = input.commentText;
    if (input.createdAt) {
      this.createdAt = moment.utc(input.createdAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    }
    if (input.updatedAt) {
      this.updatedAt = moment.utc(input.updatedAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    }
    return this;
  }

  clone(): TaskComment {
    const clone  = new TaskComment();
    clone.id = this.id;
    clone.taskId = this.taskId;
    clone.commentText = this.commentText;
    clone.createdAt = this.createdAt;
    clone.updatedAt = this.updatedAt;
    return clone;
  }
}
