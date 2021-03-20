import {HttpHeaders} from '@angular/common/http';

export class HttpContentOptions {
  static readonly JSON = {
    headers: new HttpHeaders({'Content-Type': 'application/json'}),
    withCredentials: true
  };

  static readonly FORM = {
    headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'}),
    withCredentials: true
  };

  private constructor() {
  }
}
