import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Config extends AbstractEntity {
  apiBaseUrl: string;
  selfBaseUrl: string;

  deserialize(input: any): Config {
    this.apiBaseUrl = input.apiBaseUrl;
    this.selfBaseUrl = input.selfBaseUrl;
    return this;
  }

  clone(): Config {
    const clone = new Config();
    clone.apiBaseUrl = this.apiBaseUrl;
    clone.selfBaseUrl = this.selfBaseUrl;
    return clone;
  }

  equals(other: Config): boolean {
    return Objects.equals(this.apiBaseUrl, other.apiBaseUrl) && Objects.equals(this.selfBaseUrl, other.selfBaseUrl);
  }
}
