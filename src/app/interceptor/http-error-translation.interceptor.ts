import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {HttpRequestError} from '../error/http-request.error';
import {UnauthorizedRequestError} from '../error/unauthorized-request.error';
import {ResourceNotFoundError} from '../error/resource-not-found.error';
import {HttpErrors} from '../util/http-errors';

@Injectable({providedIn: 'root'})
export class HttpErrorTranslationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (HttpErrors.isUnauthorized(error)) {
          return throwError(UnauthorizedRequestError.fromResponse(error));
        }
        if (HttpErrors.isNotFound(error)) {
          return throwError(ResourceNotFoundError.fromResponse(error));
        }
        return throwError(HttpRequestError.fromResponse(error));
      })
    );
  }
}
