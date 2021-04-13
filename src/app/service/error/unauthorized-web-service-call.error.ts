import {WebServiceCallError} from './web-service-call.error';

export class UnauthorizedWebServiceCallError extends WebServiceCallError {
  constructor(url: string, message: string) {
    super(url, 401, message);
  }

  static fromResponse(response: any): UnauthorizedWebServiceCallError {
    const message = 'HTTP failure response for ' + response.url + ': server responded with status 401';
    return new UnauthorizedWebServiceCallError(response.url, message);
  }
}
