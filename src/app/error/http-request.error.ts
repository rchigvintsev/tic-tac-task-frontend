export class HttpRequestError extends Error {
  constructor(public url: string,
              public status: number,
              public message: string,
              public localizedMessage: string = null) {
    super(message);
    Object.setPrototypeOf(this, HttpRequestError.prototype);
    this.name = 'HttpRequestError';
  }

  static fromResponse(response: any) {
    const status = HttpRequestError.getResponseStatus(response);
    const message = HttpRequestError.buildErrorMessage(response);
    const localizedMessage = HttpRequestError.getLocalizedErrorMessage(response);
    return new HttpRequestError(response.url, status, message, localizedMessage);
  }

  private static getResponseStatus(response: any): number {
    let status = response.error ? response.error.status : 0;
    if (!status) {
      status = response.status;
    }
    return status;
  }

  private static buildErrorMessage(response: any): string {
    let message = 'HTTP failure response for ' + response.url + ': ';

    const status = HttpRequestError.getResponseStatus(response);
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

  private static getLocalizedErrorMessage(response: any): string {
    return response.error ? response.error.localizedMessage : null;
  }
}
