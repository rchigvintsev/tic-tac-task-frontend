import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {HttpErrors} from '../util/http-errors';
import {I18nService} from '../service/i18n.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';

@Injectable()
export class WebServiceBasedComponent {
  constructor(public i18nService: I18nService,
              protected authenticationService: AuthenticationService,
              protected log: LogService,
              protected router: Router) {
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

  onServiceCallError(errorResponse) {
    if (HttpErrors.isUnauthorized(errorResponse)) {
      this.authenticationService.removePrincipal();
      this.navigateToSigninPage();
    } else {
      this.logError(errorResponse);
    }
  }

  navigateToSigninPage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code, 'signin']);
  }

  navigateToNotFoundErrorPage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code, 'error', '404']);
  }
}
