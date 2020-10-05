import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Tag extends AbstractEntity<Tag> {
  id: number;
  name: string;
  color = '';

  constructor(name: string = null) {
    super();
    this.name = name;
  }

  deserialize(input: any): Tag {
    this.id = input.id;
    this.name = input.name;
    this.color = input.color || '';
    return this;
  }

  serialize(): any {
    return {id: this.id, name: this.name, color: this.color};
  }

  clone(): Tag {
    const clone = new Tag();
    clone.id = this.id;
    clone.name = this.name;
    clone.color = this.color;
    return clone;
  }

  equals(other: Tag): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.name, other.name)
      && Objects.equals(this.color, other.color);
  }
}
