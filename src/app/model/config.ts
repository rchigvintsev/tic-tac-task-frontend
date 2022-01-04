import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Config extends AbstractEntity {
  domain: string;
  apiBaseUrl: string;

  deserialize(input: any): Config {
    this.domain = input.domain;
    this.apiBaseUrl = input.apiBaseUrl;
    return this;
  }

  clone(): Config {
    const clone = new Config();
    clone.domain = this.domain;
    clone.apiBaseUrl = this.apiBaseUrl;
    return clone;
  }

  equals(other: Config): boolean {
    return Objects.equals(this.domain, other.domain) && Objects.equals(this.apiBaseUrl, other.apiBaseUrl);
  }
}
