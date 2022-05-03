import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {HttpRequestError} from '../error/http-request.error';
import {HttpRequestOptions} from '../util/http-request-options';
import {Assert} from '../util/assert';
import {User} from '../model/user';
import {PageRequest} from './page-request';

@Injectable({providedIn: 'root'})
export class UserService {
  readonly baseUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/users`;
  }

  getUserCount(showLoadingIndicator = true): Observable<number> {
    const observable = this.http.get<number>(`${this.baseUrl}/count`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_user_count');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getUsers(pageRequest: PageRequest = this.newPageRequest(), showLoadingIndicator = true): Observable<User[]> {
    const url = `${this.baseUrl}?${pageRequest.toQueryParameters()}`
    const observable = this.http.get<User[]>(url, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_users');
          }
        }
      }),
      map(response => {
        const users = [];
        for (const json of response) {
          users.push(new User().deserialize(json));
        }
        return users;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  confirmEmail(userId: number, token: string, showLoadingIndicator = true): Observable<any> {
    const url = `${this.baseUrl}/${userId}/email/confirmation/${token}`;
    const observable = this.http.post<any>(url, null, {withCredentials: true});
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  resetPassword(email: string, showLoadingIndicator = true): Observable<any> {
    Assert.notBlank(email, 'Email must not be blank');
    const body = 'email=' + encodeURIComponent(email);
    const observable = this.http.post<any>(`${this.baseUrl}/password/reset`, body, HttpRequestOptions.FORM).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_confirm_account_password_reset');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  confirmPasswordReset(userId: number,
                       token: string,
                       password: string,
                       showLoadingIndicator = true): Observable<any> {
    const url = `${this.baseUrl}/${userId}/password/reset/confirmation/${token}`;
    const body = 'password=' + encodeURIComponent(password);
    const observable = this.http.post<any>(url, body, HttpRequestOptions.FORM).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_confirm_account_password_reset');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  changePassword(user: User, currentPassword: string, newPassword: string, showLoadingIndicator = true) {
    const body = `currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`;
    const observable = this.http.post<any>(`${this.baseUrl}/${user.id}/password`, body, HttpRequestOptions.FORM).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_change_password');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateUser(user: User, showLoadingIndicator = true): Observable<User> {
    Assert.notNullOrUndefined(user, 'User must not be null or undefined');
    const observable = this.http.put<any>(`${this.baseUrl}/${user.id}`, user.serialize(), HttpRequestOptions.JSON).pipe(
      map(response => new User().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateProfilePicture(user: User, profilePictureFile: File, showLoadingIndicator = true): Observable<string> {
    Assert.notNullOrUndefined(user, 'User must not be null or undefined');
    Assert.notNullOrUndefined(profilePictureFile, 'Profile picture file must not be null or undefined');
    const formData = new FormData();
    formData.append('profilePicture', profilePictureFile, profilePictureFile.name);
    const url = `${this.baseUrl}/${user.id}/profile-picture`;
    const observable = this.http.put<any>(url, formData, {withCredentials: true}).pipe(map(_ => url));
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  private newPageRequest() {
    return new PageRequest(0, this.config.pageSize);
  }
}
