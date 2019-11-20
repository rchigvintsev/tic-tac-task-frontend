import {Injectable, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {HttpErrors} from './util/http-errors';

@Injectable()
export class AbstractComponent implements OnInit {
  constructor(private router: Router, protected translate: TranslateService) {
  }

  private static logError(error: any) {
    if (error.message) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }

  ngOnInit(): void {
  }

  onServiceCallError(error) {
    if (HttpErrors.isUnauthorized(error)) {
      this.navigateToSigninPage();
    } else {
      AbstractComponent.logError(error);
    }
  }

  navigateToSigninPage() {
    this.router.navigate([this.translate.currentLang, 'signin']).then();
  }
}
