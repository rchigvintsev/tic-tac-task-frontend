import {HttpRequestError} from './http-request.error';

export class ResourceNotFoundError extends HttpRequestError {
  constructor(url: string, message: string) {
    super(url, 404, message);
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
    this.name = 'ResourceNotFoundError';
  }

  static fromResponse(response: any): ResourceNotFoundError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 404';
    return new ResourceNotFoundError(response.url, message);
  }
}
