import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {JwtHelperService} from '@auth0/angular-jwt';

import {User} from '../model/user';
import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {HttpRequestError} from '../error/http-request.error';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

const AUTHENTICATED_USER_KEY = 'authenticated-user';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private user: User = null;
  private jwtHelper = new JwtHelperService();

  private readonly _authenticatedUserChangeSubject: Subject<User>;
  private readonly _onAuthenticatedUserChange: Observable<User>;

  constructor(private httpClient: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this._authenticatedUserChangeSubject = new Subject<User>();
    this._onAuthenticatedUserChange = this._authenticatedUserChangeSubject.asObservable();
  }

  getAuthenticatedUser(): User {
    if (!this.user) {
      const user = localStorage.getItem(AUTHENTICATED_USER_KEY);
      if (user) {
        this.user = new User().deserialize(JSON.parse(user));
      }
    }
    if (this.user && !this.user.isValid()) {
      this.removeAuthenticatedUser();
    }
    return this.user;
  }

  setAuthenticatedUser(user: User) {
    Assert.notNullOrUndefined(user, 'User must not be null or undefined');
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(user));
    this.notifyAuthenticatedUserChanged(user);
  }

  removeAuthenticatedUser() {
    localStorage.removeItem(AUTHENTICATED_USER_KEY);
    this.user = null;
    this.notifyAuthenticatedUserChanged(null);
  }

  parseAccessTokenClaims(encodedClaims: string): User {
    return JSON.parse(this.jwtHelper.urlBase64Decode(encodedClaims));
  }

  createAuthenticatedUser(claims: any) {
    const user = new User();
    user.id = parseInt(claims.sub, 10);
    user.email = claims.email;
    user.fullName = claims.name;
    user.profilePictureUrl = claims.picture;
    user.validUntilSeconds = claims.exp;
    return user;
  }

  isUserSignedIn(): boolean {
    return this.getAuthenticatedUser() != null;
  }

  signIn(username: string, password: string, showLoadingIndicator = true): Observable<any> {
    const body = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
    const observable = this.httpClient.post<any>(`${this.config.apiBaseUrl}/login`, body, HttpContentOptions.FORM);
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  signUp(email: string, username: string, password: string, showLoadingIndicator = true): Observable<User> {
    Assert.notNullOrUndefined(email, 'Email must not be null or undefined');
    Assert.notNullOrUndefined(username, 'Username must not be null or undefined');

    const user = new User();
    user.email = email;
    user.fullName = username;
    user.password = password;

    const url = `${this.config.apiBaseUrl}/v1/users`;
    const observable = this.httpClient.post<any>(url, user.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new User().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  signOut(showLoadingIndicator = true): Observable<any> {
    const url = `${this.config.apiBaseUrl}/logout`;
    const observable = this.httpClient.post<any>(url, null, HttpContentOptions.JSON).pipe(
      tap({
        complete: () => this.removeAuthenticatedUser(),
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_sign_out');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  get onAuthenticatedUserChange(): Observable<User> {
    return this._onAuthenticatedUserChange;
  }

  notifyAuthenticatedUserChanged(user: User) {
    this._authenticatedUserChangeSubject.next(user);
  }
}
