import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {UnauthorizedRequestError} from '../error/unauthorized-request.error';
import {AuthenticationService} from '../service/authentication.service';
import {PageNavigationService} from '../service/page-navigation.service';

@Injectable({providedIn: 'root'})
export class UnauthorizedRequestInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService,
              private pageNavigationService: PageNavigationService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (error instanceof UnauthorizedRequestError && !this.pageNavigationService.isOnSigninPage()) {
          this.authenticationService.removeAuthenticatedUser();
          this.pageNavigationService.navigateToSigninPage().then();
          return EMPTY;
        }
        return throwError(error);
      })
    );
  }
}
