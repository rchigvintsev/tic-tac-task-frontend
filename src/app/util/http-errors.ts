export class HttpErrors {
  private constructor() {
  }

  static isUnauthorized(response: any): boolean {
    return response.status === 401;
  }

  static isBadRequest(response: any): boolean {
    return response.status === 400;
  }

  static isInternalServerError(response: any): boolean {
    return response.status === 500;
  }
}
