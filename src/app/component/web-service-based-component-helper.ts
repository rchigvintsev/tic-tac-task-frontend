import {Injectable} from '@angular/core';

import {NotificationsService} from 'angular2-notifications';

import {LogService} from '../service/log.service';
import {AuthenticationService} from '../service/authentication.service';
import {PageNavigationService} from '../service/page-navigation.service';
import {HttpErrors} from '../util/http-errors';

@Injectable({providedIn: 'root'})
export class WebServiceBasedComponentHelper {
  constructor(protected authenticationService: AuthenticationService,
              protected pageNavigationService: PageNavigationService,
              protected log: LogService,
              protected notificationsService: NotificationsService) {
  }

  handleWebServiceCallError(errorResponse: any, messageToDisplay: string = null) {
    if (HttpErrors.isUnauthorized(errorResponse)) {
      this.authenticationService.removePrincipal();
      this.pageNavigationService.navigateToSigninPage();
    } else {
      this.logError(errorResponse);
      if (messageToDisplay) {
        this.showError(messageToDisplay);
      }
    }
  }

  private logError(errorResponse: any) {
    let errorMessage = 'HTTP failure response for ' + errorResponse.url + ': ';
    let status = errorResponse.error ? errorResponse.error.status : 0;
    if (!status) {
      status = errorResponse.status;
    }
    if (status === 0) {
      errorMessage += 'unknown error';
    } else {
      errorMessage += 'server responded with status ' + status;
    }
    const errorDescription = errorResponse.error ? errorResponse.error.message : null;
    if (errorDescription) {
      errorMessage += ' and message "' + errorDescription + '"';
    }
    this.log.error(errorMessage);
  }

  private showError(messageToDisplay: string) {
    this.notificationsService.error(null, messageToDisplay, {
      timeOut: 5000,
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true
    });
  }
}
