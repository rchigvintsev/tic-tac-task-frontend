import {Serializable} from './serializable';

import * as moment from 'moment';

export class TaskComment implements Serializable<TaskComment> {
  id: number;
  taskId: number;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;

  deserialize(input: any): TaskComment {
    this.id = input.id;
    this.taskId = input.taskId;
    this.commentText = input.commentText;
    this.createdAt = moment.utc(input.createdAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    if (input.updatedAt) {
      this.updatedAt = moment.utc(input.updatedAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    }
    return this;
  }
}
