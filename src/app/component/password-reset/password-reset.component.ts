import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {UserService} from '../../service/user.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.styl']
})
export class PasswordResetComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('passwordResetForm', {read: NgForm})
  passwordResetForm: NgForm;

  email: string;

  constructor(i18nService: I18nService,
              authenticationService: AuthenticationService,
              log: LogService,
              router: Router,
              private userService: UserService,
              private alertService: AlertService) {
    super(i18nService, authenticationService, log, router);
  }

  ngOnInit() {
  }

  onPasswordResetFormSubmit() {
    if (this.passwordResetForm.valid) {
      this.userService.resetPassword(this.email)
        .subscribe(_ => this.onPasswordReset(), error => this.onServiceCallError(error));
    }
  }

  private onPasswordReset() {
    this.alertService.info(this.i18nService.translate('password_reset_confirmation_link_sent', {email: this.email}));
    this.passwordResetForm.resetForm();
  }
}
