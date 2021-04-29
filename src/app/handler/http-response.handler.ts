import {InjectionToken} from '@angular/core';

import {HttpRequestError} from '../error/http-request.error';

export const HTTP_RESPONSE_HANDLER = new InjectionToken<HttpResponseHandler>('httpResponseHandler');

export interface HttpResponseHandler {
  handleSuccess(message: string);

  handleError(error: HttpRequestError);
}
