import {getTestBed, TestBed} from '@angular/core/testing';

import {NotificationsService} from 'angular2-notifications';

import {TestSupport} from '../../test/test-support';
import {DefaultHttpRequestErrorHandler} from './default-http-request-error.handler';
import {HttpRequestError} from '../http-request.error';
import {LogService} from '../../service/log.service';

describe('DefaultHttpRequestErrorHandler', () => {
  let log: LogService;
  let notificationsService: NotificationsService;
  let handler: DefaultHttpRequestErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });

    const injector = getTestBed();

    log = injector.get(LogService);
    spyOn(log, 'error').and.stub();

    notificationsService = injector.get(NotificationsService);
    spyOn(notificationsService, 'error').and.stub();

    handler = injector.get(DefaultHttpRequestErrorHandler);
  });

  it('should log error message', () => {
    const message = 'Something went wrong';
    const error = new HttpRequestError('/', 500, message);
    handler.handle(error);

    expect(log.error).toHaveBeenCalledWith(message);
  });

  it('should show notification with localized error message', () => {
    const localizedMessage = 'Что-то пошло не так';
    const error = new HttpRequestError('/', 500, 'Something went wrong', localizedMessage);
    handler.handle(error);

    expect(notificationsService.error).toHaveBeenCalledWith(null, localizedMessage);
  });

  it('should throw error on handle when error object is null', () => {
    expect(() => handler.handle(null)).toThrow(new Error('Error must not be null or undefined'));
  });
});
