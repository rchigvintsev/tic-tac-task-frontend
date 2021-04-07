import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {PageNavigationService} from '../../service/page-navigation.service';
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
    alertService: AlertService,
    i18nService: I18nService,
    config: ConfigService,
    activatedRoute: ActivatedRoute,
    private componentHelper: WebServiceBasedComponentHelper,
    private authenticationService: AuthenticationService,
    private pageNavigationService: PageNavigationService
  ) {
    super(alertService, i18nService, config, activatedRoute);
  }

  onSigninFormSubmit() {
    if (this.signinForm.valid) {
      this.authenticationService.signIn(this.email, this.password).subscribe(
        accessTokenClaims => this.onSignIn(accessTokenClaims),
        error => this.onSignInError(error)
      );
    }
  }

  protected getDefaultErrorMessage(): string {
    return this.i18nService.translate('failed_to_sign_in');
  }

  private onSignIn(accessTokenClaims: any) {
    const principal = this.authenticationService.createPrincipal(accessTokenClaims);
    this.authenticationService.setPrincipal(principal);
    this.pageNavigationService.navigateToHomePage();
  }

  private onSignInError(errorResponse: any) {
    if (HttpErrors.isUnauthorized(errorResponse)) {
      this.alertService.error(this.i18nService.translate('user_not_found_or_invalid_password'));
    } else {
      this.alertService.error(this.i18nService.translate('failed_to_sign_in'));
      this.componentHelper.handleWebServiceCallError(errorResponse);
    }
  }
}
