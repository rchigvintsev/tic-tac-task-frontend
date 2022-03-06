import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {UserService} from '../../../../../service/user.service';
import {I18nService} from '../../../../../service/i18n.service';
import {PageNavigationService} from '../../../../../service/page-navigation.service';
import {AlertService} from '../../../../../service/alert.service';
import {LogService} from '../../../../../service/log.service';
import {HttpRequestError} from '../../../../../error/http-request.error';
import {PasswordChangeEvent} from '../../../../fragment/account/password/change/account-password-change.component';
import {Strings} from '../../../../../util/strings';

@Component({
  selector: 'app-account-password-reset-confirmation',
  templateUrl: './account-password-reset-confirmation.component.html',
  styleUrls: ['./account-password-reset-confirmation.component.scss']
})
export class AccountPasswordResetConfirmationComponent implements OnInit {
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

  onPasswordChange(event: PasswordChangeEvent) {
    if (!Strings.isBlank(event.newPassword)) {
      this.userService.confirmPasswordReset(this.userId, this.token, event.newPassword).subscribe(
        _ => this.onPasswordResetConfirm(),
        (error: HttpRequestError) => this.onPasswordResetConfirmError(error)
      );
    }
  }

  private onPasswordResetConfirm() {
    this.pageNavigationService.navigateToSigninPage({error: false, message: 'account_password_reset_confirmed'}).then();
  }

  private onPasswordResetConfirmError(error: HttpRequestError) {
    const localizedMessage = error.localizedMessage || this.i18nService.translate('failed_to_confirm_account_password_reset');
    this.alertService.error(localizedMessage);
    this.log.error(error.message);
  }
}
