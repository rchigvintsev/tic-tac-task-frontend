import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';

import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {LogService} from '../../service/log.service';
import {HttpRequestError} from '../../error/http-request.error';

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

  constructor(i18nService: I18nService,
              alertService: AlertService,
              config: ConfigService,
              activatedRoute: ActivatedRoute,
              private log: LogService,
              private authenticationService: AuthenticationService) {
    super(i18nService, alertService, config, activatedRoute);
  }

  onSignupFormSubmit() {
    if (this.signupForm.valid) {
      this.authenticationService.signUp(this.email, this.fullName, this.password).subscribe(
        _ => this.onSignUp(),
        (error: HttpRequestError) => this.onSignUpError(error)
      );
    }
  }

  protected getDefaultErrorMessage(): string {
    return this.i18nService.translate('failed_to_sign_up');
  }

  private onSignUp() {
    this.alertService.info(this.i18nService.translate('email_confirmation_link_sent', {email: this.email}));
    this.signupForm.resetForm();
  }

  private onSignUpError(error: HttpRequestError) {
    const localizedMessage = error.localizedMessage || this.i18nService.translate('failed_to_sign_up');
    this.alertService.error(localizedMessage);
    this.log.error(error.message);
  }
}
