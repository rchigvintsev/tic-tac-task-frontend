export class Objects {
  private constructor() {
  }

  static equals(v1: any, v2: any): boolean {
    if (Objects.isNullOrUndefined(v1)) {
      return this.isNullOrUndefined(v2);
    }
    return v1 === v2;
  }

  private static isNullOrUndefined(v: any) {
    return v === null || typeof v === 'undefined';
  }
}
