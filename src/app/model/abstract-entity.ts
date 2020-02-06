import {Serializable} from './serializable';
import {Cloneable} from './cloneable';

export abstract class AbstractEntity<T> implements Serializable<T>, Cloneable<T> {
  abstract clone(): T;

  abstract deserialize(input: any): T;

  serialize(): any {
    return this.clone();
  }
}
