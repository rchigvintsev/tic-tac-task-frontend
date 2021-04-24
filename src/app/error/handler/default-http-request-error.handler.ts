import {Injectable} from '@angular/core';

import {NotificationsService} from 'angular2-notifications';

import {HttpRequestErrorHandler} from './http-request-error.handler';
import {HttpRequestError} from '../http-request.error';
import {LogService} from '../../service/log.service';
import {Assert} from '../../util/assert';

@Injectable({providedIn: 'root'})
export class DefaultHttpRequestErrorHandler implements HttpRequestErrorHandler {
  constructor(private log: LogService,
              private notificationsService: NotificationsService) {
  }

  handle(error: HttpRequestError) {
    Assert.notNullOrUndefined(error, 'Error must not be null or undefined');
    this.log.error(error.message);
    if (error.localizedMessage) {
      this.notificationsService.error(null, error.localizedMessage);
    }
  }
}
