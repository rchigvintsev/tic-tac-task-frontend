import {Injectable} from '@angular/core';

import {NotificationsService} from 'angular2-notifications';

import {HttpResponseHandler} from './http-response.handler';
import {HttpRequestError} from '../error/http-request.error';
import {LogService} from '../service/log.service';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class DefaultHttpResponseHandler implements HttpResponseHandler {
  constructor(private log: LogService,
              private notificationsService: NotificationsService) {
  }

  handleSuccess(message: string) {
    this.notificationsService.success('', message);
  }

  handleError(error: HttpRequestError) {
    Assert.notNullOrUndefined(error, 'Error must not be null or undefined');
    this.log.error(error.message);
    if (error.localizedMessage) {
      this.notificationsService.error('', error.localizedMessage);
    }
  }
}
