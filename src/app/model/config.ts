import {Serializable} from './serializable';
import {Cloneable} from './cloneable';

export class Config implements Serializable<Config>, Cloneable<Config> {
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
