import {Serializable} from './serializable';
import {Cloneable} from './cloneable';

export class Task implements Serializable<Task>, Cloneable<Task> {
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

  clone(): Task {
    const clone = new Task();
    clone.id = this.id;
    clone.title = this.title;
    clone.description = this.description;
    clone.completed = this.completed;
    return clone;
  }

  equals(other: Task): boolean {
    return this.id === other.id
      && this.title === other.title
      && this.description === other.description
      && this.completed === other.completed;
  }
}
