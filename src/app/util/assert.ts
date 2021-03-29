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
}
