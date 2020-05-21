export class Objects {
  private constructor() {
  }

  static equals(v1: any, v2: any): boolean {
    if (Objects.isNullOrUndefined(v1)) {
      return this.isNullOrUndefined(v2);
    }
    if (v1 instanceof Date && v2 instanceof Date) {
      return v1.getTime() === v2.getTime();
    }
    return v1 === v2;
  }

  private static isNullOrUndefined(v: any) {
    return v === null || typeof v === 'undefined';
  }
}
