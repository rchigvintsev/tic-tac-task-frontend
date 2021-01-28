import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {NgForm} from '@angular/forms';

import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {HttpErrors} from '../../util/http-errors';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../fragment/base-sign/base-sign.component.styl']
})
export class SigninComponent extends BaseSignComponent implements OnInit {
  @ViewChild('signinForm', {read: NgForm})
  signinForm: NgForm;

  constructor(
    i18nService: I18nService,
    authenticationService: AuthenticationService,
    log: LogService,
    config: ConfigService,
    router: Router,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    activatedRoute: ActivatedRoute,
    private alertService: AlertService,
  ) {
    super(i18nService, authenticationService, log, config, router, iconRegistry, domSanitizer, activatedRoute);
  }

  onSigninFormSubmit() {
    if (this.signinForm.valid) {
      this.authenticationService.signIn(this.email, this.password).subscribe(
        accessTokenClaims => this.onSignIn(accessTokenClaims),
        error => this.onSignInError(error)
      );
    }
  }

  protected showErrorMessage(message: string = null): void {
    if (!message) {
      message = this.i18nService.translate('sign_in_error');
    }
    this.alertService.error(message);
  }

  private onSignIn(accessTokenClaims: any) {
    const principal = this.authenticationService.createPrincipal(accessTokenClaims);
    this.authenticationService.setPrincipal(principal);
    this.navigateToHomePage();
  }

  private onSignInError(error: any) {
    if (HttpErrors.isUnauthorized(error)) {
      this.showErrorMessage(this.i18nService.translate('user_not_found_or_invalid_password'));
    } else {
      this.onServiceCallError(error);
    }
  }

  private navigateToHomePage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code]).then();
  }
}
