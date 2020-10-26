import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  warn(message) {
    console.warn(message);
  }

  error(message) {
    console.error(message);
  }
}
