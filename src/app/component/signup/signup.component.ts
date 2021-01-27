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

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../fragment/base-sign/base-sign.component.styl']
})
export class SignupComponent extends BaseSignComponent implements OnInit {
  fullName: string;
  passwordRepeat: string;

  @ViewChild('signupForm', {read: NgForm})
  signupForm: NgForm;

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

  onSignupFormSubmit() {
    if (this.signupForm.valid) {
      this.authenticationService.signUp(this.email, this.fullName, this.password).subscribe(
        response => this.onSignUp(response),
        this.onServiceCallError.bind(this)
      );
    }
  }

  protected onSignError(): void {
    this.alertService.error(this.i18nService.translate('sign_up_error'));
  }

  private onSignUp(response: any) {
  }
}
