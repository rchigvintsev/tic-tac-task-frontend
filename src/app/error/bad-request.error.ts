import {HttpRequestError} from './http-request.error';

export class BadRequestError extends HttpRequestError {
  constructor(url: string, message: string, public fieldErrors: any) {
    super(url, 400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = 'BadRequestError';
  }

  static fromResponse(response: any): BadRequestError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 400';
    return new BadRequestError(response.url, message, BadRequestError.getFieldErrors(response));
  }

  private static getFieldErrors(response: any): any {
    if (response.error && response.error.fieldErrors) {
      return response.error.fieldErrors;
    }
    return [];
  }
}
