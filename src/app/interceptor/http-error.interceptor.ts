import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';

import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {HTTP_ERROR_HANDLERS, HttpErrorHandler} from '../error/handler/http-error.handler';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(@Inject(HTTP_ERROR_HANDLERS) private errorHandlers: HttpErrorHandler[]) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        for (const handler of this.errorHandlers) {
          if (handler.supports(error)) {
            return handler.handle(error, req);
          }
        }
        return throwError(error);
      })
    );
  }
}
