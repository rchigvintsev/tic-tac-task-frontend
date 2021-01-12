import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  debug(message) {
    // tslint:disable-next-line:no-console
    console.debug(message);
  }

  warn(message) {
    console.warn(message);
  }

  error(message) {
    console.error(message);
  }
}
