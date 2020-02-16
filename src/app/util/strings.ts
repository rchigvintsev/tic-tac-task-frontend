export class Strings {
  private constructor() {
  }

  static isBlank(s: string): boolean {
    return s === undefined || s === null || s.trim().length === 0;
  }
}
