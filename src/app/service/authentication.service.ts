import {Injectable, InjectionToken} from '@angular/core';

import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';

import {User} from '../model/user';

export const ACCESS_TOKEN_COOKIE_NAME = 'ATP';
export const CURRENT_USER = new InjectionToken<User>('Current user');

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = new JwtHelperService();

  constructor(private cookieService: CookieService) {}

  static getCurrentUser(authenticationService: AuthenticationService): User {
    if (authenticationService.isUserAuthenticated()) {
      const accessTokenValue = authenticationService.getAccessTokenValue();
      const decodedToken = authenticationService.jwtHelper.decodeToken(accessTokenValue);
      const user = new User();
      user.fullName = decodedToken.name;
      user.imageUrl = decodedToken.picture;
      return user;
    }
    return null;
  }

  isUserAuthenticated(): boolean {
    const accessTokenValue = this.getAccessTokenValue();
    return accessTokenValue && !this.jwtHelper.isTokenExpired(accessTokenValue);
  }

  private getAccessTokenValue(): string {
    const value = this.cookieService.get(ACCESS_TOKEN_COOKIE_NAME);
    // JwtHelperService expects two dots
    return value ? `.${value}.` : null;
  }
}
