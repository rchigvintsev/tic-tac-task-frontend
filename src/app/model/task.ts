import {Serializable} from './serializable';

export class Task implements Serializable<Task> {
  id: number;
  title: string;
  description: string;
  completed: boolean;

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    this.description = input.description;
    this.completed = input.completed;
    return this;
  }
}
