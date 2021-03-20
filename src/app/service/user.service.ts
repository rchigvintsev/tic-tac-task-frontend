import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {User} from '../model/user';
import {Strings} from '../util/strings';
import {HttpContentOptions} from '../util/http-content-options';

@Injectable({providedIn: 'root'})
export class UserService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/users`;
  }

  createUser(user: User): Observable<User> {
    if (!user) {
      throw new Error('User must not be null or undefined');
    }
    return this.http.post<User>(this.baseUrl, user.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new User().deserialize(response))
    );
  }

  confirmEmail(userId: number, token: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${userId}/email/confirmation/${token}`, null, {withCredentials: true});
  }

  resetPassword(email: string): Observable<any> {
    if (Strings.isBlank(email)) {
      throw new Error('Email must not be blank');
    }

    const body = 'email=' + encodeURIComponent(email);
    return this.http.post<any>(`${this.baseUrl}/password/reset`, body, HttpContentOptions.FORM);
  }
}
