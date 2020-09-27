import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {ConfigService} from './config.service';
import {Config} from '../model/config';

describe('ConfigService', () => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    configService = injector.get(ConfigService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const service: ConfigService = TestBed.get(ConfigService);
    expect(service).toBeTruthy();
  });

  it('should load config', () => {
    const config = {
      apiBaseUrl: 'http://backend.com',
      selfBaseUrl: 'http://frontend.com'
    };
    const result = configService.loadConfig().then(() => {
      expect(configService.apiBaseUrl).toBe(config.apiBaseUrl);
      expect(configService.selfBaseUrl).toBe(config.selfBaseUrl);
    });
    const request = httpMock.expectOne('/assets/config.json');
    expect(request.request.method).toBe('GET');
    request.flush(config);
    return result;
  });

  it('should throw error on attempt to access uninitialized service', () => {
    expect(() => configService.apiBaseUrl).toThrow(new Error('Service is not initialized'));
  });

  it('should throw error on attempt to initialize already initialized service', () => {
    configService.setConfig(new Config());
    expect(() => configService.setConfig(new Config())).toThrow(new Error('Service is already initialized'));
  });
});
