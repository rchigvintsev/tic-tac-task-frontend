import {Serializable} from './serializable';

export class Task implements Serializable<Task> {
  id: number;
  title: string;

  deserialize(input: any): Task {
    this.id = input.id;
    this.title = input.title;
    return this;
  }
}
