import {Strings} from './strings';

export class Assert {
  private constructor() {
  }

  static notNullOrUndefined(object: any, message: string = null) {
    if (!object) {
      if (!message) {
        message = 'Object must not be null or undefined';
      }
      throw new Error(message);
    }
  }

  static notBlank(s: string, message: string = null) {
    if (Strings.isBlank(s)) {
      if (!message) {
        message = 'String must not be blank';
      }
      throw new Error(message);
    }
  }
}
