import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Config} from '../model/config';

@Injectable({providedIn: 'root'})
export class ConfigService {
  private config: Config;

  constructor(private http: HttpClient) {
  }

  loadConfig(): Promise<void> {
    return this.http.get<any>('/assets/config.json').toPromise().then(response => {
      this.setConfig(new Config().deserialize(response));
    });
  }

  setConfig(config: Config) {
    this.assertNotInitialized();
    this.config = config.clone();
  }

  get apiBaseUrl() {
    this.assertInitialized();
    return this.config.apiBaseUrl;
  }

  get selfBaseUrl() {
    this.assertInitialized();
    return this.config.selfBaseUrl;
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
