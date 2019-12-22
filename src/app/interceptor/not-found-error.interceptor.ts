import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotFoundErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private translate: TranslateService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 404) {
          this.router.navigate([this.translate.currentLang, 'error', '404']).then();
          return EMPTY;
        }
        return throwError(error);
      })
    );
  }
}
