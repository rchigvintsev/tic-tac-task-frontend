import {Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';

import {User} from '../model/user';
import {ConfigService} from './config.service';

export const ACCESS_TOKEN_COOKIE_NAME = 'ATP';
export const CURRENT_USER = new InjectionToken<User>('Current user');

const appJsonHttpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = new JwtHelperService();

  constructor(private httpClient: HttpClient,
              private cookieService: CookieService,
              private config: ConfigService) {}

  static getCurrentUser(authenticationService: AuthenticationService): User {
    if (authenticationService.isSignedIn()) {
      const accessTokenValue = authenticationService.getAccessTokenValue();
      const decodedToken = authenticationService.jwtHelper.decodeToken(accessTokenValue);
      const user = new User();
      user.fullName = decodedToken.name;
      user.imageUrl = decodedToken.picture;
      return user;
    }
    return null;
  }

  isSignedIn(): boolean {
    const accessTokenValue = this.getAccessTokenValue();
    return accessTokenValue && !this.jwtHelper.isTokenExpired(accessTokenValue);
  }

  signOut(): Observable<any> {
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/logout`, null, appJsonHttpOptions);
  }

  private getAccessTokenValue(): string {
    const value = this.cookieService.get(ACCESS_TOKEN_COOKIE_NAME);
    // JwtHelperService expects two dots
    return value ? `.${value}.` : null;
  }
}
