import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Tag extends AbstractEntity<Tag> {
  id: number;
  name: string;

  constructor(name: string = null) {
    super();
    this.name = name;
  }

  deserialize(input: any): Tag {
    this.id = input.id;
    this.name = input.name;
    return this;
  }

  serialize(): any {
    return {id: this.id, name: this.name};
  }

  clone(): Tag {
    const clone = new Tag();
    clone.id = this.id;
    clone.name = this.name;
    return clone;
  }

  equals(other: Tag): boolean {
    return Objects.equals(this.id, other.id) && Objects.equals(this.name, other.name);
  }
}
