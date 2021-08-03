import {HttpRequestError} from './http-request.error';

export class ForbiddenRequestError extends HttpRequestError {
  constructor(url: string, message: string) {
    super(url, 403, message);
    Object.setPrototypeOf(this, ForbiddenRequestError.prototype);
    this.name = 'ForbiddenRequestError';
  }

  static fromResponse(response: any): ForbiddenRequestError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 403';
    return new ForbiddenRequestError(response.url, message);
  }
}
