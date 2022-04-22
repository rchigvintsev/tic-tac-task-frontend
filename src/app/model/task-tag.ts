import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';
import {ColorPalette} from '../util/color-palette';

const DEFAULT_TAG_COLOR = ColorPalette.COLOR_GREEN[500].hex;

export class TaskTag extends AbstractEntity {
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

  deserialize(input: any): TaskTag {
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
    return {id: this.id, name: this.name, color: TaskTag.hexStringToNumber(this.color)};
  }

  clone(): TaskTag {
    const clone = new TaskTag();
    clone.id = this.id;
    clone.name = this.name;
    clone.color = this.color;
    return clone;
  }

  equals(other: TaskTag): boolean {
    if (!other) {
      return false;
    }
    return Objects.equal(this.id, other.id)
      && Objects.equal(this.name, other.name)
      && Objects.equal(this.color, other.color);
  }
}
