import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Config} from '../model/config';

@Injectable({providedIn: 'root'})
export class ConfigService {
  private static readonly DEFAULT_SCHEME = 'http';
  private static readonly DEFAULT_HOST = 'localhost';
  private static readonly DEFAULT_PORT = 4200;

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

  get domain(): string {
    this.assertInitialized();
    return this.config.domain;
  }

  get apiBaseUrl(): string {
    this.assertInitialized();
    return this.config.apiBaseUrl;
  }

  get selfBaseUrl(): string {
    this.assertInitialized();
    if (this.domain) {
      return `https://${this.domain}`
    }
    return `${ConfigService.DEFAULT_SCHEME}://${ConfigService.DEFAULT_HOST}:${ConfigService.DEFAULT_PORT}`
  }

  get pageSize(): number {
    this.assertInitialized();
    return this.config.pageSize;
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
