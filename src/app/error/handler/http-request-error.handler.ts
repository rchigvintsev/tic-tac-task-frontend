import {InjectionToken} from '@angular/core';

import {HttpRequestError} from '../http-request.error';

export const HTTP_REQUEST_ERROR_HANDLER = new InjectionToken<HttpRequestErrorHandler>('httpRequestErrorHandler');

export interface HttpRequestErrorHandler {
  handle(error: HttpRequestError);
}
