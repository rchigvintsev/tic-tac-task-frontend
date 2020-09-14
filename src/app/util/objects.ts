import {AbstractEntity} from '../model/abstract-entity';

export class Objects {
  private constructor() {
  }

  static equals(v1: any, v2: any): boolean {
    if (Objects.isNullOrUndefined(v1)) {
      return this.isNullOrUndefined(v2);
    }
    if (v1 instanceof AbstractEntity && v2 instanceof AbstractEntity) {
      return v1.equals(v2);
    }
    if (v1 instanceof Date && v2 instanceof Date) {
      return v1.getTime() === v2.getTime();
    }
    if (v1 instanceof Array && v2  instanceof Array) {
      if (v1.length !== v2.length) {
        return false;
      }
      for (let i = 0; i < v1.length; i++) {
        if (!Objects.equals(v1[i], v2[i])) {
          return false;
        }
      }
      return true;
    }
    return v1 === v2;
  }

  private static isNullOrUndefined(v: any) {
    return v === null || typeof v === 'undefined';
  }
}
