import {HttpRequestError} from './http-request.error';

export class UnauthorizedRequestError extends HttpRequestError {
  constructor(url: string, message: string) {
    super(url, 401, message);
    Object.setPrototypeOf(this, UnauthorizedRequestError.prototype);
    this.name = 'UnauthorizedRequestError';
  }

  static fromResponse(response: any): UnauthorizedRequestError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 401';
    return new UnauthorizedRequestError(response.url, message);
  }
}
