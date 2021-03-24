import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {UserService} from '../../service/user.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-password-reset-confirmation',
  templateUrl: './password-reset-confirmation.component.html',
  styleUrls: ['./password-reset-confirmation.component.styl']
})
export class PasswordResetConfirmationComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('passwordResetConfirmationForm', {read: NgForm})
  passwordResetConfirmationForm: NgForm;

  password: string;
  repeatedPassword: string;

  private userId: number;
  private token: string;

  constructor(i18nService: I18nService,
              authenticationService: AuthenticationService,
              log: LogService,
              router: Router,
              private userService: UserService,
              private alertService: AlertService,
              private activatedRoute: ActivatedRoute) {
    super(i18nService, authenticationService, log, router);
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
    this.router.navigate([this.i18nService.currentLanguage.code, 'signin'],
      {queryParams: {error: false, message: 'password_reset_confirmed'}});
  }

  private onPasswordResetConfirmError(response: any) {
    if (response.error.localizedMessage) {
      this.alertService.error(response.error.localizedMessage);
    } else {
      this.alertService.error(this.i18nService.translate('password_reset_confirmation_error'));
    }
    this.onServiceCallError(response);
  }
}
