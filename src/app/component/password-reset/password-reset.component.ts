import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {UserService} from '../../service/user.service';
import {I18nService} from '../../service/i18n.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.styl']
})
export class PasswordResetComponent implements OnInit {
  @ViewChild('passwordResetForm', {read: NgForm})
  passwordResetForm: NgForm;

  email: string;

  constructor(public i18nService: I18nService,
              private componentHelper: WebServiceBasedComponentHelper,
              private userService: UserService,
              private alertService: AlertService) {
  }

  ngOnInit() {
  }

  onPasswordResetFormSubmit() {
    if (this.passwordResetForm.valid) {
      this.userService.resetPassword(this.email)
        .subscribe(_ => this.onPasswordReset(), response => this.onPasswordResetError(response));
    }
  }

  private onPasswordReset() {
    this.alertService.info(this.i18nService.translate('password_reset_confirmation_link_sent', {email: this.email}));
    this.passwordResetForm.resetForm();
  }

  private onPasswordResetError(errorResponse: any) {
    if (errorResponse.error.localizedMessage) {
      this.alertService.error(errorResponse.error.localizedMessage);
    } else {
      this.alertService.error(this.i18nService.translate('failed_to_confirm_password_reset'));
    }
    this.componentHelper.handleWebServiceCallError(errorResponse);
  }
}
