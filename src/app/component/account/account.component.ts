import {Component, Inject, OnInit} from '@angular/core';

import {tap} from 'rxjs/operators';

import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {UserService} from '../../service/user.service';
import {User} from '../../model/user';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  userFormModel = new User();

  constructor(public i18nService: I18nService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              @Inject(HTTP_RESPONSE_HANDLER) protected httpResponseHandler: HttpResponseHandler) {
    const user = authenticationService.getAuthenticatedUser();
    this.userFormModel = user.clone();
  }

  ngOnInit(): void {
  }

  onFullNameInputBlur() {
    this.saveUser();
  }

  private saveUser() {
    const user = this.authenticationService.getAuthenticatedUser();
    if (this.userFormModel.fullName !== user.fullName) {
      this.userService.updateUser(this.userFormModel).pipe(
        tap({
          error: (error: HttpRequestError) => {
            if (!error.localizedMessage) {
              error.localizedMessage = this.i18nService.translate('failed_to_save_account_settings');
            }
          }
        })
      ).subscribe(u => {
        this.userFormModel = u.clone();
        this.setAuthenticatedUser(u)
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('account_settings_saved'));
      }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    }
  }

  private setAuthenticatedUser(user: User) {
    const currentUser = this.authenticationService.getAuthenticatedUser();
    user.validUntilSeconds = currentUser.validUntilSeconds;
    this.authenticationService.setAuthenticatedUser(user);
  }
}
