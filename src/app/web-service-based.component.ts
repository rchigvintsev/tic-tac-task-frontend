import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {HttpErrors} from './util/http-errors';
import {AuthenticationService} from './service/authentication.service';
import {LogService} from './service/log.service';

@Injectable()
export class WebServiceBasedComponent {
  constructor(protected router: Router,
              protected translate: TranslateService,
              protected authenticationService: AuthenticationService,
              protected log: LogService) {
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

  onServiceCallError(error) {
    if (HttpErrors.isUnauthorized(error)) {
      this.authenticationService.removePrincipal();
      this.navigateToSigninPage();
    } else {
      this.logError(error);
    }
  }

  navigateToSigninPage() {
    this.router.navigate([this.translate.currentLang, 'signin']).then();
  }
}
