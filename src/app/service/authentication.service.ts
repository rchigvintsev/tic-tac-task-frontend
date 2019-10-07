import {Injectable} from '@angular/core';

import {JwtHelperService} from '@auth0/angular-jwt';

import {getAccessToken} from '../access-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private jwtHelper: JwtHelperService) {}

  isUserAuthenticated(): boolean {
    const accessToken = getAccessToken();
    return accessToken && !this.jwtHelper.isTokenExpired(accessToken);
  }
}
