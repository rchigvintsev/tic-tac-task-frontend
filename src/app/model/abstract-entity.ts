import {Serializable} from './serializable';
import {Cloneable} from './cloneable';

export abstract class AbstractEntity implements Serializable, Cloneable {
  abstract clone(): AbstractEntity;

  abstract deserialize(input: any): AbstractEntity;

  abstract equals(other: AbstractEntity): boolean;

  serialize(): any {
    return this.clone();
  }
}
