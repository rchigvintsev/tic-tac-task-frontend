import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {User} from '../model/user';

const commonHttpOptions = {withCredentials: true};
const jsonContentOptions = Object.assign({
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}, commonHttpOptions);

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
    return this.http.post<User>(this.baseUrl, user.serialize(), jsonContentOptions).pipe(
      map(response => new User().deserialize(response))
    );
  }
}
