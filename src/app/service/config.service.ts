import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Config} from '../model/config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: Config;

  constructor(private http: HttpClient) {
  }

  init(): Promise<void> {
    this.assertNotInitialized();
    return this.http.get<any>('/assets/config.json').toPromise().then(response => {
      this.config = new Config().deserialize(response);
    });
  }

  get apiBaseUrl() {
    this.assertInitialized();
    return this.config.apiBaseUrl;
  }

  private assertNotInitialized() {
    if (this.config != null) {
      throw new Error('Service is already initialized');
    }
  }

  private assertInitialized() {
    if (this.config == null) {
      throw new Error('Service is not initialized');
    }
  }
}
