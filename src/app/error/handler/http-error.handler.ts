import {InjectionToken} from '@angular/core';
import {HttpRequest} from '@angular/common/http/src/request';
import {HttpEvent} from '@angular/common/http/src/response';

import {Observable} from 'rxjs';

export const HTTP_ERROR_HANDLERS = new InjectionToken<HttpErrorHandler[]>('HTTP error handlers');

export interface HttpErrorHandler {
  supports(error: any): boolean;

  handle(error: any, req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
