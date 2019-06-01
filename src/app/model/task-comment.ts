import {Serializable} from './serializable';

export class TaskComment implements Serializable<TaskComment> {
  id: number;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;

  deserialize(input: any): TaskComment {
    this.id = input.id;
    this.commentText = input.commentText;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    return this;
  }
}
