import {Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {JwtHelperService} from '@auth0/angular-jwt';

import {User} from '../model/user';
import {ConfigService} from './config.service';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';

export const PRINCIPAL = new InjectionToken<AuthenticatedPrincipal>('Authenticated principal');

const PRINCIPAL_KEY = 'principal';

const postOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'}), withCredentials: true};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = new JwtHelperService();

  constructor(private httpClient: HttpClient, private config: ConfigService) {
  }

  static getPrincipal(): AuthenticatedPrincipal {
    const principal = localStorage.getItem(PRINCIPAL_KEY);
    if (principal) {
      return new User().deserialize(JSON.parse(principal));
    }
    return null;
  }

  static setPrincipal(principal: AuthenticatedPrincipal) {
    if (!principal) {
      throw new Error('Principal must not be null or undefined');
    }
    localStorage.setItem(PRINCIPAL_KEY, JSON.stringify(principal));
  }

  static removePrincipal() {
    localStorage.removeItem(PRINCIPAL_KEY);
  }

  createPrincipal(encodedClaims: string): AuthenticatedPrincipal {
    const claims = JSON.parse(this.jwtHelper.urlBase64Decode(encodedClaims));
    const user = new User();
    user.email = claims.sub;
    user.fullName = claims.name;
    user.imageUrl = claims.picture;
    user.validUntilSeconds = claims.exp;
    return user;
  }

  isUserSignedIn(): boolean {
    return AuthenticationService.getPrincipal() != null;
  }

  signOut(): Observable<any> {
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/logout`, null, postOptions)
      .pipe(
        tap(() => {
          AuthenticationService.removePrincipal();
        })
      );
  }
}
