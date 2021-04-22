import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {JwtHelperService} from '@auth0/angular-jwt';

import {User} from '../model/user';
import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';
import {HttpRequestError} from '../error/http-request.error';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

const PRINCIPAL_KEY = 'principal';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private user: User = null;
  private jwtHelper = new JwtHelperService();

  constructor(private httpClient: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
  }

  getPrincipal(): AuthenticatedPrincipal {
    if (!this.user) {
      const principal = localStorage.getItem(PRINCIPAL_KEY);
      if (principal) {
        this.user = new User().deserialize(JSON.parse(principal));
      }
    }
    if (this.user && !this.user.isValid()) {
      this.removePrincipal();
    }
    return this.user;
  }

  setPrincipal(principal: AuthenticatedPrincipal) {
    Assert.notNullOrUndefined(principal, 'Principal must not be null or undefined');
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(principal));
  }

  removePrincipal() {
    localStorage.removeItem(PRINCIPAL_KEY);
    this.user = null;
  }

  parseAccessTokenClaims(encodedClaims: string): AuthenticatedPrincipal {
    return JSON.parse(this.jwtHelper.urlBase64Decode(encodedClaims));
  }

  createPrincipal(claims: any) {
    const user = new User();
    user.id = claims.sub;
    user.email = claims.email;
    user.fullName = claims.name;
    user.profilePictureUrl = claims.picture;
    user.validUntilSeconds = claims.exp;
    return user;
  }

  isUserSignedIn(): boolean {
    return this.getPrincipal() != null;
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

    const url = `${this.config.apiBaseUrl}/users`;
    const observable = this.httpClient.post<any>(url, user.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new User().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  signOut(showLoadingIndicator = true): Observable<any> {
    const url = `${this.config.apiBaseUrl}/logout`;
    const observable = this.httpClient.post<any>(url, null, HttpContentOptions.JSON).pipe(
      tap({
        complete: () => this.removePrincipal(),
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_sign_out');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }
}
