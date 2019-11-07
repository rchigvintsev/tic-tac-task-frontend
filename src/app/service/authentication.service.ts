import {Injectable} from '@angular/core';

import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';

export const ACCESS_TOKEN_COOKIE_NAME = 'ATP';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = new JwtHelperService();

  constructor(private cookieService: CookieService) {}

  isUserAuthenticated(): boolean {
    const accessTokenValue = this.getAccessTokenValue();
    return accessTokenValue && !this.jwtHelper.isTokenExpired(this.getAccessTokenValue());
  }

  private getAccessTokenValue(): string {
    const value = this.cookieService.get(ACCESS_TOKEN_COOKIE_NAME);
    // JwtHelperService expects two dots
    return value ? `.${value}.` : null;
  }
}
