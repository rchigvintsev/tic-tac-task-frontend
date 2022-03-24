import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

const DEFAULT_TAG_COLOR = '#e0e0e0';

export class Tag extends AbstractEntity {
  id: number;
  name: string;
  color = DEFAULT_TAG_COLOR;

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
    if (input.color) {
      let hex = (input.color as number).toString(16);
      hex = '000000'.substring(0, 6 - hex.length) + hex;
      this.color = '#' + hex;
    } else {
      this.color = DEFAULT_TAG_COLOR;
    }
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
    if (!other) {
      return false;
    }
    return Objects.equal(this.id, other.id)
      && Objects.equal(this.name, other.name)
      && Objects.equal(this.color, other.color);
  }
}
