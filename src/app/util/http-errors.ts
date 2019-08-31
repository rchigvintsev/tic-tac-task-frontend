export class HttpErrors {
  static isUnauthorized(error: any): boolean {
    return error.status === 401;
  }
}
