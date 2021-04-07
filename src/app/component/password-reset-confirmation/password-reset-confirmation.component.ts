import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {UserService} from '../../service/user.service';
import {I18nService} from '../../service/i18n.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-password-reset-confirmation',
  templateUrl: './password-reset-confirmation.component.html',
  styleUrls: ['./password-reset-confirmation.component.styl']
})
export class PasswordResetConfirmationComponent implements OnInit {
  @ViewChild('passwordResetConfirmationForm', {read: NgForm})
  passwordResetConfirmationForm: NgForm;

  password: string;
  repeatedPassword: string;

  private userId: number;
  private token: string;

  constructor(public i18nService: I18nService,
              private componentHelper: WebServiceBasedComponentHelper,
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
      this.userService.confirmPasswordReset(this.userId, this.token, this.password)
        .subscribe(_ => this.onPasswordResetConfirm(), response => this.onPasswordResetConfirmError(response));
    }
  }

  private onPasswordResetConfirm() {
    this.passwordResetConfirmationForm.resetForm();
    this.pageNavigationService.navigateToSigninPage({error: false, message: 'password_reset_confirmed'});
  }

  private onPasswordResetConfirmError(errorResponse: any) {
    if (errorResponse.error.localizedMessage) {
      this.alertService.error(errorResponse.error.localizedMessage);
    } else {
      this.alertService.error(this.i18nService.translate('failed_to_confirm_password_reset'));
    }
    this.componentHelper.handleWebServiceCallError(errorResponse);
  }
}
