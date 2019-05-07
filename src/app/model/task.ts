import {Serializable} from './serializable';

export class Task implements Serializable<Task> {
  id: number;
  title: string;
  completed: boolean;

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.completed = input.completed;
    return this;
  }
}
