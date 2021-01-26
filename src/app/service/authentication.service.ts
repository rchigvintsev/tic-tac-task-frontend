import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {JwtHelperService} from '@auth0/angular-jwt';

import {User} from '../model/user';
import {ConfigService} from './config.service';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';

const PRINCIPAL_KEY = 'principal';

const jsonContentOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
  withCredentials: true
};
const formContentOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'}),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private user: User = null;
  private jwtHelper = new JwtHelperService();

  constructor(private httpClient: HttpClient, private config: ConfigService) {
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
    if (!principal) {
      throw new Error('Principal must not be null or undefined');
    }
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
    user.email = claims.sub;
    user.fullName = claims.name;
    user.imageUrl = claims.picture;
    user.validUntilSeconds = claims.exp;
    return user;
  }

  isUserSignedIn(): boolean {
    return this.getPrincipal() != null;
  }

  signIn(username: string, password: string): Observable<any> {
    const body = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/login`, body, formContentOptions);
  }

  signUp(email: string, fullName: string, password: string): Observable<any> {
    const body = '';
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/users`, body, jsonContentOptions);
  }

  signOut(): Observable<any> {
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/logout`, null, jsonContentOptions)
      .pipe(
        tap(() => {
          this.removePrincipal();
        })
      );
  }
}
