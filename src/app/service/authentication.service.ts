import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

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

  signIn(username: string, password: string): Observable<any> {
    const body = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/login`, body, formContentOptions);
  }

  signUp(email: string, username: string, password: string): Observable<User> {
    if (!email) {
      throw new Error('Email must not be null or undefined');
    }
    if (!username) {
      throw new Error('Username must not be null or undefined');
    }

    const user = new User();
    user.email = email;
    user.fullName = username;
    user.password = password;
    return this.httpClient.post<any>(`${this.config.apiBaseUrl}/users`, user.serialize(), jsonContentOptions).pipe(
      map(response => new User().deserialize(response))
    );
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
