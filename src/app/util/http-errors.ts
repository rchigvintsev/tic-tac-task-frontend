export class HttpErrors {
  private constructor() {
  }

  static isBadRequest(response: any): boolean {
    return response.status === 400;
  }

  static isUnauthorized(response: any): boolean {
    return response.status === 401;
  }

  static isForbidden(response: any): boolean {
    return response.status === 403;
  }

  static isNotFound(response: any): boolean {
    return response.status === 404;
  }

  static isInternalServerError(response: any): boolean {
    return response.status === 500;
  }
}
