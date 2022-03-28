import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class TaskComment extends AbstractEntity {
  id: number;
  taskId: number;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;

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
    clone.createdAt = this.createdAt != null ? new Date(this.createdAt.getTime()) : null;
    clone.updatedAt = this.updatedAt != null ? new Date(this.updatedAt.getTime()) : null;
    return clone;
  }

  equals(other: TaskComment): boolean {
    if (!other) {
      return false;
    }
    return Objects.equal(this.id, other.id)
      && Objects.equal(this.taskId, other.taskId)
      && Objects.equal(this.commentText, other.commentText)
      && Objects.equal(this.createdAt, other.createdAt)
      && Objects.equal(this.updatedAt, other.updatedAt);
  }
}
