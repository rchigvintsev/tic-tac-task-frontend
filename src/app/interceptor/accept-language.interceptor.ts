import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

/**
 * This interceptor sets value of "Accept-Language" header to current language provided by {@link TranslateService}.
 */
@Injectable({
  providedIn: 'root'
})
export class AcceptLanguageInterceptor implements HttpInterceptor {
  constructor(private translate: TranslateService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.translate.currentLang) {
      req = req.clone({headers: req.headers.set('Accept-Language', this.translate.currentLang)});
    }
    return next.handle(req);
  }
}
