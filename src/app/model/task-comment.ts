import {Serializable} from './serializable';

export class TaskComment implements Serializable<TaskComment> {
  id: number;
  commentText: string;

  deserialize(input: any): TaskComment {
    this.id = input.id;
    this.commentText = input.commentText;
    return this;
  }
}
