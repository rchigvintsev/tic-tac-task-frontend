import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {UserService} from '../../service/user.service';
import {I18nService} from '../../service/i18n.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {AlertService} from '../../service/alert.service';
import {LogService} from '../../service/log.service';
import {HttpRequestError} from '../../error/http-request.error';

@Component({
  selector: 'app-password-reset-confirmation',
  templateUrl: './password-reset-confirmation.component.html',
  styleUrls: ['./password-reset-confirmation.component.scss']
})
export class PasswordResetConfirmationComponent implements OnInit {
  @ViewChild('passwordResetConfirmationForm', {read: NgForm})
  passwordResetConfirmationForm: NgForm;

  newPassword: string;
  newPasswordRepeated: string;

  private userId: number;
  private token: string;

  constructor(public i18nService: I18nService,
              private log: LogService,
              private userService: UserService,
              private pageNavigationService: PageNavigationService,
              private alertService: AlertService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.userId = parseInt(params.get('userId'), 10);
      this.token = params.get('token');
    });
  }

  onPasswordResetConfirmationFormSubmit() {
    if (this.passwordResetConfirmationForm.valid) {
      this.userService.confirmPasswordReset(this.userId, this.token, this.newPassword).subscribe(
        _ => this.onPasswordResetConfirm(),
        (error: HttpRequestError) => this.onPasswordResetConfirmError(error)
      );
    }
  }

  private onPasswordResetConfirm() {
    this.passwordResetConfirmationForm.resetForm();
    this.pageNavigationService.navigateToSigninPage({error: false, message: 'password_reset_confirmed'}).then();
  }

  private onPasswordResetConfirmError(error: HttpRequestError) {
    const localizedMessage = error.localizedMessage || this.i18nService.translate('failed_to_confirm_password_reset');
    this.alertService.error(localizedMessage);
    this.log.error(error.message);
  }
}
