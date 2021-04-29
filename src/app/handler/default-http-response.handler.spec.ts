import {getTestBed, TestBed} from '@angular/core/testing';

import {NotificationsService} from 'angular2-notifications';

import {TestSupport} from '../test/test-support';
import {DefaultHttpResponseHandler} from './default-http-response.handler';
import {LogService} from '../service/log.service';
import {HttpRequestError} from '../error/http-request.error';

describe('DefaultHttpResponseHandler', () => {
  let log: LogService;
  let notificationsService: NotificationsService;
  let handler: DefaultHttpResponseHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });

    const injector = getTestBed();

    log = injector.get(LogService);
    spyOn(log, 'error').and.stub();

    notificationsService = injector.get(NotificationsService);
    spyOn(notificationsService, 'success').and.stub();
    spyOn(notificationsService, 'error').and.stub();

    handler = injector.get(DefaultHttpResponseHandler);
  });

  it('should log error message', () => {
    const message = 'Something went wrong';
    const error = new HttpRequestError('/', 500, message);
    handler.handleError(error);

    expect(log.error).toHaveBeenCalledWith(message);
  });

  it('should show error notification on error handle', () => {
    const localizedMessage = 'Что-то пошло не так';
    const error = new HttpRequestError('/', 500, 'Something went wrong', localizedMessage);
    handler.handleError(error);

    expect(notificationsService.error).toHaveBeenCalledWith(null, localizedMessage);
  });

  it('should throw error on error handle when error object is null', () => {
    expect(() => handler.handleError(null)).toThrow(new Error('Error must not be null or undefined'));
  });

  it('should show success notification on success handle', () => {
    const message = 'Success!';
    handler.handleSuccess(message);
    expect(notificationsService.success).toHaveBeenCalledWith(null, message);
  });
});
