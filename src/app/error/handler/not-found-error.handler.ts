import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpEvent, HttpRequest} from '@angular/common/http';

import {EMPTY, Observable} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {HttpErrorHandler} from './http-error.handler';

@Injectable({
  providedIn: 'root'
})
export class NotFoundErrorHandler implements HttpErrorHandler {
  constructor(private router: Router, private translate: TranslateService) {
  }

  supports(error: any): boolean {
    return error.status === 404;
  }

  handle(error: any, req: HttpRequest<any>): Observable<HttpEvent<any>> {
    this.router.navigate([this.translate.currentLang, 'error', '404']).then();
    return EMPTY;
  }
}
