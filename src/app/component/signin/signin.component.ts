import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {LogService} from '../../service/log.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {HttpRequestError} from '../../error/http-request.error';
import {UnauthorizedRequestError} from '../../error/unauthorized-request.error';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../fragment/base-sign/base-sign.component.scss']
})
export class SigninComponent extends BaseSignComponent implements OnInit {
  @ViewChild('signinForm', {read: NgForm})
  signinForm: NgForm;

  constructor(
    i18nService: I18nService,
    alertService: AlertService,
    config: ConfigService,
    activatedRoute: ActivatedRoute,
    private log: LogService,
    private authenticationService: AuthenticationService,
    private pageNavigationService: PageNavigationService
  ) {
    super(i18nService, alertService, config, activatedRoute);
  }

  onSigninFormSubmit() {
    if (this.signinForm.valid) {
      this.authenticationService.signIn(this.email, this.password).subscribe(
        accessTokenClaims => this.onSignIn(accessTokenClaims),
        (error: HttpRequestError) => this.onSignInError(error)
      );
    }
  }

  protected getDefaultErrorMessage(): string {
    return this.i18nService.translate('failed_to_sign_in');
  }

  private onSignIn(accessTokenClaims: any) {
    const user = this.authenticationService.createUser(accessTokenClaims);
    this.authenticationService.setUser(user);
    this.pageNavigationService.navigateToHomePage().then();
  }

  private onSignInError(error: HttpRequestError) {
    if (error instanceof UnauthorizedRequestError) {
      this.alertService.error(this.i18nService.translate('user_not_found_or_invalid_password'));
    } else {
      this.alertService.error(this.i18nService.translate('failed_to_sign_in'));
      this.log.error(error.message);
    }
  }
}
