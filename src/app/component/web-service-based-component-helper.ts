import {HttpErrors} from '../util/http-errors';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {PageNavigationService} from '../service/page-navigation.service';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class WebServiceBasedComponentHelper {
  constructor(protected authenticationService: AuthenticationService,
              protected pageNavigationService: PageNavigationService,
              protected log: LogService) {
  }

  handleWebServiceCallError(errorResponse: any) {
    if (HttpErrors.isUnauthorized(errorResponse)) {
      this.authenticationService.removePrincipal();
      this.pageNavigationService.navigateToSigninPage();
    } else {
      this.logError(errorResponse);
      this.showError();
    }
  }

  private logError(error: any) {
    if (error.errors) {
      for (const message of error.errors) {
        this.log.error(message);
      }
    } else {
      this.log.error(error);
    }
  }

  private showError() {

  }
}
