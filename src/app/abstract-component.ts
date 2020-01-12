import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {HttpErrors} from './util/http-errors';
import {AuthenticationService} from './service/authentication.service';

@Injectable()
export class AbstractComponent {
  constructor(private router: Router, protected translate: TranslateService) {
  }

  private static logError(error: any) {
    if (error.message) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }

  onServiceCallError(error) {
    if (HttpErrors.isUnauthorized(error)) {
      AuthenticationService.removePrincipal();
      this.navigateToSigninPage();
    } else {
      AbstractComponent.logError(error);
    }
  }

  navigateToSigninPage() {
    this.router.navigate([this.translate.currentLang, 'signin']).then();
  }
}
