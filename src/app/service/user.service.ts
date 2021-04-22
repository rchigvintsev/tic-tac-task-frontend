import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {HttpRequestError} from '../error/http-request.error';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class UserService {
  readonly baseUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/users`;
  }

  confirmEmail(userId: number, token: string, showLoadingIndicator = true): Observable<any> {
    const url = `${this.baseUrl}/${userId}/email/confirmation/${token}`;
    const observable = this.http.post<any>(url, null, {withCredentials: true});
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  resetPassword(email: string, showLoadingIndicator = true): Observable<any> {
    Assert.notBlank(email, 'Email must not be blank');
    const body = 'email=' + encodeURIComponent(email);
    const observable = this.http.post<any>(`${this.baseUrl}/password/reset`, body, HttpContentOptions.FORM).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_confirm_password_reset');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  confirmPasswordReset(userId: number, token: string, password: string, showLoadingIndicator = true) {
    const url = `${this.baseUrl}/${userId}/password/reset/confirmation/${token}`;
    const body = 'password=' + encodeURIComponent(password);
    const observable = this.http.post<any>(url, body, HttpContentOptions.FORM).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_confirm_password_reset');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }
}
