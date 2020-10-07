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

  private static hexStringToNumber(hex: string) {
    return hex ? parseInt(hex.substring(1), 16) : null;
  }

  deserialize(input: any): Tag {
    this.id = input.id;
    this.name = input.name;
    this.color = input.color ? '#' + (input.color as number).toString(16) : '';
    return this;
  }

  serialize(): any {
    return {id: this.id, name: this.name, color: Tag.hexStringToNumber(this.color)};
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
