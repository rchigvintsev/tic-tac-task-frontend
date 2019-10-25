import {Serializable} from './serializable';
import {Cloneable} from './cloneable';

export class Config implements Serializable<Config>, Cloneable<Config> {
  apiBaseUrl: string;

  deserialize(input: any): Config {
    this.apiBaseUrl = input.apiBaseUrl;
    return this;
  }

  clone(): Config {
    const clone = new Config();
    clone.apiBaseUrl = this.apiBaseUrl;
    return clone;
  }
}
