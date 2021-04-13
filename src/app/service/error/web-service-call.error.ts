export class WebServiceCallError extends Error {
  constructor(public url: string,
              public status: number,
              public message: string,
              public localizedMessage: string = null) {
    super(message);
    Object.setPrototypeOf(this, WebServiceCallError.prototype);
    this.name = 'WebServiceCallError';
  }

  static fromResponse(response: any, localizedMessage: string = null) {
    const status = WebServiceCallError.getResponseStatus(response);
    const message = WebServiceCallError.buildErrorMessage(response);
    if (!localizedMessage && response.error) {
      localizedMessage = response.error.localizedMessage;
    }
    return new WebServiceCallError(response.url, status, message, localizedMessage);
  }

  private static buildErrorMessage(response: any): string {
    let message = 'HTTP failure response for ' + response.url + ': ';

    const status = WebServiceCallError.getResponseStatus(response);
    if (status === 0) {
      return message + 'unknown error';
    }

    message += 'server responded with status ' + status;
    const description = response.error ? response.error.message : null;
    if (description) {
      message += ' and message "' + description + '"';
    }
    return message;
  }

  private static getResponseStatus(response: any): number {
    let status = response.error ? response.error.status : 0;
    if (!status) {
      status = response.status;
    }
    return status;
  }
}
