import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {NgForm} from '@angular/forms';

import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../fragment/base-sign/base-sign.component.styl']
})
export class SignupComponent extends BaseSignComponent {
  fullName: string;
  repeatedPassword: string;

  @ViewChild('signupForm', {read: NgForm})
  signupForm: NgForm;

  constructor(
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    alertService: AlertService,
    i18nService: I18nService,
    config: ConfigService,
    activatedRoute: ActivatedRoute,
    private componentHelper: WebServiceBasedComponentHelper,
    private authenticationService: AuthenticationService
  ) {
    super(iconRegistry, domSanitizer, alertService, i18nService, config, activatedRoute);
  }

  onSignupFormSubmit() {
    if (this.signupForm.valid) {
      this.authenticationService.signUp(this.email, this.fullName, this.password).subscribe(
        _ => this.onSignUp(),
        response => this.onSignUpError(response)
      );
    }
  }

  protected getDefaultErrorMessage(): string {
    return this.i18nService.translate('sign_up_error');
  }

  private onSignUp() {
    this.alertService.info(this.i18nService.translate('email_confirmation_link_sent', {email: this.email}));
    this.signupForm.resetForm();
  }

  private onSignUpError(errorResponse: any) {
    if (errorResponse.error.localizedMessage) {
      this.alertService.error(errorResponse.error.localizedMessage);
    } else {
      this.componentHelper.handleWebServiceCallError(errorResponse);
    }
  }
}
