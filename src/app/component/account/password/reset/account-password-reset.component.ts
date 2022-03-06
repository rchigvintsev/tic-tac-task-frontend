import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {UserService} from '../../../../service/user.service';
import {I18nService} from '../../../../service/i18n.service';
import {AlertService} from '../../../../service/alert.service';
import {HttpRequestError} from '../../../../error/http-request.error';
import {LogService} from '../../../../service/log.service';

@Component({
  selector: 'app-account-password-reset',
  templateUrl: './account-password-reset.component.html',
  styleUrls: ['./account-password-reset.component.scss']
})
export class AccountPasswordResetComponent implements OnInit {
  @ViewChild('passwordResetForm', {read: NgForm})
  passwordResetForm: NgForm;

  email: string;

  constructor(public i18nService: I18nService,
              private log: LogService,
              private userService: UserService,
              private alertService: AlertService) {
  }

  ngOnInit() {
  }

  onPasswordResetFormSubmit() {
    if (this.passwordResetForm.valid) {
      this.userService.resetPassword(this.email).subscribe(
        _ => this.onPasswordReset(),
        (error: HttpRequestError) => this.onPasswordResetError(error)
      );
    }
  }

  private onPasswordReset() {
    this.alertService.info(this.i18nService.translate('account_password_reset_confirmation_link_sent', {email: this.email}));
    this.passwordResetForm.resetForm();
  }

  private onPasswordResetError(error: HttpRequestError) {
    const localizedMessage = error.localizedMessage || this.i18nService.translate('failed_to_confirm_account_password_reset');
    this.alertService.error(localizedMessage);
    this.log.error(error.message);
  }
}
