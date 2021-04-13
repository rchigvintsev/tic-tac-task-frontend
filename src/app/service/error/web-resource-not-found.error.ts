import {WebServiceCallError} from './web-service-call.error';

export class WebResourceNotFoundError extends WebServiceCallError {
  constructor(url: string, message: string) {
    super(url, 404, message);
    Object.setPrototypeOf(this, WebResourceNotFoundError.prototype);
    this.name = 'WebResourceNotFoundError';
  }

  static fromResponse(response: any): WebResourceNotFoundError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 404';
    return new WebResourceNotFoundError(response.url, message);
  }
}
