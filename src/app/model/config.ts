import {AbstractEntity} from './abstract-entity';

export class Config extends AbstractEntity<Config> {
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
}
