import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class Config extends AbstractEntity {
  domain: string;
  apiBaseUrl: string;
  pageSize = 20;

  deserialize(input: any): Config {
    this.domain = input.domain;
    this.apiBaseUrl = input.apiBaseUrl;
    this.pageSize = input.pageSize;
    return this;
  }

  clone(): Config {
    const clone = new Config();
    clone.domain = this.domain;
    clone.apiBaseUrl = this.apiBaseUrl;
    clone.pageSize = this.pageSize;
    return clone;
  }

  equals(other: Config): boolean {
    if (!other) {
      return false;
    }
    return Objects.equal(this.domain, other.domain)
      && Objects.equal(this.apiBaseUrl, other.apiBaseUrl)
      && Objects.equal(this.pageSize, other.pageSize);
  }
}
